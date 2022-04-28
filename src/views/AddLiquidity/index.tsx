import { useCallback, useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, TokenAmount, CurrencyAmount, WETH } from '@pancakeswap/sdk'
import {
  AddIcon, CardBody, Message, useModal, Button,
  Text,
  ArrowDownIcon,
  Box,
  Flex,
  IconButton,
  BottomDrawer,
  useMatchBreakpoints,
  ArrowUpDownIcon,
  Skeleton,
} from '@pancakeswap/uikit'

import { logError } from 'utils/sentry'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useTranslation } from 'contexts/Localization'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTokenBalance from 'hooks/useTokenBalance'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { CHAIN_ID } from 'config/constants/networks'
import { AppDispatch } from '../../state'
import { LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Layout/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AppHeader, AppBody } from '../../components/App'
import { MinimalPositionCard } from '../../components/PositionCard'
import { RowBetween } from '../../components/Layout/Row'
import ConnectWalletButton from '../../components/ConnectWalletButton'

import { ROUTER_ADDRESS } from '../../config/constants'
import { PairState } from '../../hooks/usePairs'
import { useCurrency, useToken } from '../../hooks/TokensPancake'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTokenAllowance from '../../hooks/useTokenAllowance'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { Field, resetMintState } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useGasPrice, useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import Dots from '../../components/Loader/Dots'
import { currencyId } from '../../utils/currencyId'
import PoolPriceBar from './PoolPriceBar'
import Page from '../Page'
import ConfirmAddLiquidityModal from '../Swap/components/ConfirmAddLiquidityModal'
import { AutoRow } from '../../components/Layout/Row'
import { ONE_BIPS } from '../../config/constants'
import styled from 'styled-components'
import { Field as SwapField } from '../../state/swap/actions'
import tokens from 'config/constants/tokens'
import useToast from 'hooks/useToast'

import { ContractInterface, Contract, utils } from 'ethers'
import { ERC20_INTERFACE, PMLS_INTERFACE, MLS_INTERFACE } from 'config/abi/erc20'
import { MaxUint256 } from '@ethersproject/constants'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useCake, useTokenContract } from 'hooks/useContract'
import { useSWRContract } from 'hooks/useSWRContract'
import useSWR, {
  Middleware,
  SWRConfiguration,
  KeyedMutator,
  // eslint-disable-next-line camelcase
  unstable_serialize,
} from 'swr'
import { AppState } from '../../state'
import { getBalances } from 'store/slices/account-slice'

const SwitchIconButton = styled(IconButton)`
  box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.1);
`

export default function AddLiquidity() {
  const router = useRouter()
  const pmlsBalance = useSelector((state: AppState) => state.account.balances.pmls)
  console.log("pmlsBalance:",pmlsBalance);
  const { toastSuccess, toastError } = useToast()

  const [currencyIdA, currencyIdB] = router.query.currency || []

  const { account, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const gasPrice = useGasPrice()

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  useEffect(() => {
    if (!currencyIdA && !currencyIdB) {
      dispatch(resetMintState())
    }
  }, [dispatch, currencyIdA, currencyIdB])

  const oneCurrencyIsWETH = Boolean(
    chainId &&
    ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
      (currencyB && currencyEquals(currencyB, WETH[chainId]))),
  )

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // modal and loading
  const [{ attemptingTxn, liquidityErrorMessage, txHash }, setLiquidityState] = useState<{
    attemptingTxn: boolean
    liquidityErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    attemptingTxn: false,
    liquidityErrorMessage: undefined,
    txHash: undefined,
  })

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS[CHAIN_ID])
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS[CHAIN_ID])

  const addTransaction = useTransactionAdder()

  async function onAdd() {
    if (!chainId || !library || !account) return
    const routerContract = getRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    let estimate
    let method: (...args: any) => Promise<TransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = routerContract.estimateGas.addLiquidityETH
      method = routerContract.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = routerContract.estimateGas.addLiquidity
      method = routerContract.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ]
      value = null
    }

    setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
          gasPrice,
        }).then((response) => {
          setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response.hash })

          addTransaction(response, {
            summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencies[Field.CURRENCY_A]?.symbol
              } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`,
          })
        }),
      )
      .catch((err) => {
        if (err && err.code !== 4001) {
          logError(err)
          console.error(`Add Liquidity failed`, err, args, value)
        }
        setLiquidityState({
          attemptingTxn: false,
          liquidityErrorMessage: err && err.code !== 4001 ? `Add Liquidity failed: ${err.message}` : undefined,
          txHash: undefined,
        })
      })
  }

  const pendingText = t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencies[Field.CURRENCY_A]?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencies[Field.CURRENCY_B]?.symbol ?? '',
  })

  const handleCurrencyASelect = useCallback(
    (currencyA_: Currency) => {
      const newCurrencyIdA = currencyId(currencyA_)
      if (newCurrencyIdA === currencyIdB) {
        router.replace(`/add/${currencyIdB}/${currencyIdA}`, undefined, { shallow: true })
      } else if (currencyIdB) {
        router.replace(`/add/${newCurrencyIdA}/${currencyIdB}`, undefined, { shallow: true })
      } else {
        router.replace(`/add/${newCurrencyIdA}`, undefined, { shallow: true })
      }
    },
    [currencyIdB, router, currencyIdA],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB_: Currency) => {
      const newCurrencyIdB = currencyId(currencyB_)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          router.replace(`/add/${currencyIdB}/${newCurrencyIdB}`, undefined, { shallow: true })
        } else {
          router.replace(`/add/${newCurrencyIdB}`, undefined, { shallow: true })
        }
      } else {
        router.replace(`/add/${currencyIdA || 'BNB'}/${newCurrencyIdB}`, undefined, { shallow: true })
      }
    },
    [currencyIdA, router, currencyIdB],
  )

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
  }, [onFieldAInput, txHash])

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  var PMLS = useCurrency(tokens.pmls.address)
  var USDT = useCurrency(tokens.usdt.address)
  var MLS = useCurrency(tokens.mls.address)

  // const usdtBalance = useCurrencyBalance(account ?? undefined, USDT ?? undefined)?.toSignificant(18)
  // const pmlsBalance = useCurrencyBalance(account ?? undefined, PMLS ?? undefined)?.toSignificant(18)
  // const [usdtBalance, setUsdtBalance] = useState("")
  // setUsdtBalance(useTokenBalance(tokens.usdt.address).balance.toString())

  // console.log("usdtBalance:", usdtBalance)

  // const [pmlsBalance, setPmlsBalance] = useState("")
  // setPmlsBalance(useTokenBalance(tokens.pmls.address).balance.toString())
  // console.log("pmlsBalance:", pmlsBalance)

  const usdtBalance = useTokenBalance(tokens.usdt.address).balance.toString()
  // const contract = useTokenContract(tokens.pmls.address, false)
  // const { data, status, ...rest } = useSWR(
  //   "balances",
  //   async () => {
  //     return contract["balances"](account)
  //   },
  // )
  // const pmlsBalance = data && data.toString()
  // console.log("pmlsBalance:", pmlsBalance)
  // if (requiredUsdt > usdtBalance.balance){
  //   toastError("Error","Not engough USDT") 
  // } 
  let pmls
  let usdt
  let mls
  if (library) {
    mls = new Contract(tokens.mls.address, MLS_INTERFACE, library.getSigner())
    pmls = new Contract(tokens.pmls.address, PMLS_INTERFACE, library.getSigner())
    usdt = new Contract(tokens.usdt.address, ERC20_INTERFACE, library.getSigner())
  }
  return (
    <Page>
      <AppBody>
        <CardBody>
          <AutoColumn gap="20px">
            <CurrencyInputPanel
              value={utils.formatUnits(pmlsBalance,"ether")}

              onUserInput={onFieldAInput}
              onMax={() => {
                // onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={PMLS}
              id="add-liquidity-input-tokena"
              showCommonBases
            />
            <CurrencyInputPanel
              value={utils.formatUnits(usdtBalance,"ether")}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                // onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={USDT}
              id="add-liquidity-input-tokenb"
              showCommonBases
            />
          </AutoColumn>
          <AutoColumn justify="space-between">
            <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
              <SwitchIconButton
                variant="light"
                scale="sm"
                onClick={() => {
                  setApprovalSubmitted(false)
                }}
              >
                <ArrowDownIcon
                  className="icon-down"
                  color={currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] ? 'primary' : 'text'}
                />
              </SwitchIconButton>
            </AutoRow>
          </AutoColumn>
          <CurrencyInputPanel
            value={utils.formatUnits(pmlsBalance,"ether")}
            onUserInput={null}
            label={t('To')}
            showMaxButton={false}
            currency={MLS}
            onCurrencySelect={null}
            otherCurrency={currencies[SwapField.INPUT]}
            id="swap-currency-output"
          />
          <Button
            onClick={async () => {
              const usdtAllowance = await usdt.allowance(account, tokens.pmls.address)
              if (usdtAllowance.eq(0)) {
                var tx = await usdt.approve(tokens.pmls.address, MaxUint256)
                await tx.wait()
              }
              var tx = await pmls.swap(pmlsBalance)

            }}
            style={{ margin: "1rem 0" }}
            width="100%"
            id="swap-button"
          >
            {t('Swap')}
          </Button>
        </CardBody>
      </AppBody>
    </Page>
  )
}
