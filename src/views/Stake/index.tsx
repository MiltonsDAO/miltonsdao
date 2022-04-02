import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { useRouter } from 'next/router'
import useToast from 'hooks/useToast'
import { Currency, currencyEquals, ETHER, Percent, WETH } from '@pancakeswap/sdk'
import { Button, Text, AddIcon, ArrowDownIcon, CardBody, Slider, Box, Flex, useModal } from '@pancakeswap/uikit'
import { BigNumber } from '@ethersproject/bignumber'
import { useTranslation } from 'contexts/Localization'
import { CHAIN_ID } from 'config/constants/networks'

import { ROUTER_ADDRESS } from '../../config/constants'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useCurrency } from '../../hooks/TokensPancake'
import { usePairContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../hooks/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { useBurnActionHandlers, useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'

import { Field } from '../../state/burn/actions'
import { useGasPrice, useUserSlippageTolerance } from '../../state/user/hooks'
import Page from '../Page'
import ConfirmLiquidityModal from '../Swap/components/ConfirmRemoveLiquidityModal'
import { logError } from '../../utils/sentry'
import { Skeleton } from '@material-ui/lab'
import { Grid, InputAdornment, OutlinedInput, Zoom } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, AppState } from '../../state'
import classnames from "classnames";
import useMediaQuery from '@material-ui/core/useMediaQuery'

import fromExponential from 'from-exponential'

export const trim = (number: number = 0, precision?: number) => {
  if (number >= Math.pow(10, 36)) {
    return 'Infinity'
  }
  const array = fromExponential(number).split('.')
  if (array.length === 1) return fromExponential(number)
  //@ts-ignore
  array.push(array.pop().substring(0, precision))
  const trimmedNumber = array.join('.')
  return trimmedNumber
}

const BorderCard = styled.div`
  border: solid 1px ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px;
`

export default function Stake() {
  const router = useRouter()
  const [currencyIdA, currencyIdB] = router.query.currency || []
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const { toastError, toastWarning } = useToast()
  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)],
    [currencyA, currencyB, chainId],
  )
  const dispatch = useDispatch<AppDispatch>()
  const [view, setView] = useState(0)
  const [quantity, setQuantity] = useState<string>('')

  const isAppLoading = useSelector<AppState, boolean>((state) => false)
  const currentIndex = useSelector<AppState, string>((state) => {
    return ""
  })
  const fiveDayRate = useSelector<AppState, number>((state) => {
    return 0
  })
  const timeBalance = useSelector<AppState, string>((state) => {
    return ""
  })
  const memoBalance = useSelector<AppState, string>((state) => {
    return ""
  })
  const stakeAllowance = useSelector<AppState, number>((state) => {
    return 0
  })

  const stakingRebase = useSelector<AppState, number>((state) => {
    return 0
  })
  const stakingAPY = useSelector<AppState, number>((state) => {
    return 0
  })
  const stakingTVL = useSelector<AppState, number>((state) => {
    return 0
  })

  const pendingTransactions = useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl)

  const setMax = () => {
    if (view === 0) {
      setQuantity(timeBalance)
    } else {
      setQuantity(memoBalance)
    }
  }

  const onSeekApproval = async (token: string) => {
    // if (await checkWrongNetwork()) return
    // await dispatch(changeApproval({ account, token, provider, networkID: chainID }))
  }

  const onChangeStake = async (action: string) => {
    // if (await checkWrongNetwork()) return
    // if (quantity === '' || parseFloat(quantity) === 0) {
    //   dispatch(toastWarning(text: action === 'stake' ? messages.before_stake : messages.before_unstake ))
    // } else {
    //   await dispatch(changeStake({ account, action, value: String(quantity), provider, networkID: chainID }))
    //   setQuantity('')
    // }
  }

  const hasAllowance = useCallback(
    (token) => {
      // if (token === 'mls') return stakeAllowance > 0
      // if (token === 'smls') return unstakeAllowance > 0
      return 0
    },
    [stakeAllowance],
  )

  const changeView = (newView: number) => () => {
    setView(newView)
    setQuantity('')
  }

  const trimmedMemoBalance = trim(Number(memoBalance), 6)
  let trimmedStakingAPY = trim(stakingAPY * 100, 1)

  const stakingRebasePercentage = trim(stakingRebase * 100, 4)
  const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * Number(trimmedMemoBalance), 6)

  const { t } = useTranslation()
  const gasPrice = useGasPrice()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
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
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
        ? '<1'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS[CHAIN_ID])

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) {
      toastError(t('Error'), t('Missing liquidity amount'))
      throw new Error('missing liquidity amount')
    }

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'account' },
    ]
    const domain = {
      name: 'Pancake LPs',
      version: '1',
      chainId,
      verifyingContract: pair.liquidityToken.address,
    }
    const Permit = [
      { name: 'owner', type: 'account' },
      { name: 'spender', type: 'account' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[CHAIN_ID],
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber(),
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature) => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber(),
        })
      })
      .catch((err) => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (err?.code !== 4001) {
          approveCallback()
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, value: string) => {
      setSignatureData(null)
      return _onUserInput(field, value)
    },
    [_onUserInput],
  )

  const onLiquidityInput = useCallback((value: string): void => onUserInput(Field.LIQUIDITY, value), [onUserInput])
  const onCurrencyAInput = useCallback((value: string): void => onUserInput(Field.CURRENCY_A, value), [onUserInput])
  const onCurrencyBInput = useCallback((value: string): void => onUserInput(Field.CURRENCY_B, value), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()
  async function onRemove() {
    if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      toastError(t('Error'), t('Missing currency amounts'))
      throw new Error('missing currency amounts')
    }
    const routerContract = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) {
      toastError(t('Error'), t('Missing tokens'))
      throw new Error('missing tokens')
    }
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) {
      toastError(t('Error'), t('Missing liquidity amount'))
      throw new Error('missing liquidity amount')
    }

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH

    if (!tokenA || !tokenB) {
      toastError(t('Error'), t('Could not wrap'))
      throw new Error('could not wrap')
    }

    let methodNames: string[]
    let args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ]
      }
    }
    // we have a signature, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      toastError(t('Error'), t('Attempting to confirm without approval or a signature'))
      throw new Error('Attempting to confirm without approval or a signature')
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        routerContract.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((err) => {
            console.error(`estimateGas failed`, methodName, args, err)
            return undefined
          }),
      ),
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate),
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      toastError(t('Error'), t('This transaction would fail'))
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })
      await routerContract[methodName](...args, {
        gasLimit: safeGasEstimate,
        gasPrice,
      })
        .then((response: TransactionResponse) => {
          setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response.hash })
          addTransaction(response, {
            summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
              } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`,
          })
        })
        .catch((err) => {
          if (err && err.code !== 4001) {
            logError(err)
            console.error(`Remove Liquidity failed`, err, args)
          }
          setLiquidityState({
            attemptingTxn: false,
            liquidityErrorMessage: err && err?.code !== 4001 ? `Remove Liquidity failed: ${err.message}` : undefined,
            txHash: undefined,
          })
        })
    }
  }

  const pendingText = t('Removing %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencyA?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencyB?.symbol ?? '',
  })

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput],
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
    ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
      (currencyB && currencyEquals(WETH[chainId], currencyB))),
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        router.replace(`/remove/${currencyId(currency)}/${currencyIdA}`, undefined, { shallow: true })
      } else {
        router.replace(`/remove/${currencyId(currency)}/${currencyIdB}`, undefined, { shallow: true })
      }
    },
    [currencyIdA, currencyIdB, router],
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        router.replace(`/remove/${currencyIdB}/${currencyId(currency)}`, undefined, { shallow: true })
      } else {
        router.replace(`/remove/${currencyIdA}/${currencyId(currency)}`, undefined, { shallow: true })
      }
    },
    [currencyIdA, currencyIdB, router],
  )

  const handleDismissConfirmation = useCallback(() => {
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  )

  const [onPresentRemoveLiquidity] = useModal(
    <ConfirmLiquidityModal
      title={t('You will receive')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash || ''}
      allowedSlippage={allowedSlippage}
      onRemove={onRemove}
      pendingText={pendingText}
      approval={approval}
      signatureData={signatureData}
      tokenA={tokenA}
      tokenB={tokenB}
      liquidityErrorMessage={liquidityErrorMessage}
      parsedAmounts={parsedAmounts}
      currencyA={currencyA}
      currencyB={currencyB}
    />,
    true,
    true,
    'removeLiquidityModal',
  )
  const isSmallerScreen = useMediaQuery('(max-width: 960px)')

  return (
    <Page>
      <div className="ido-view" style={isSmallerScreen ? { margin: "unset" } : {}}>
        <Zoom in={true}>
          <div className="ido-card">
            <Grid className="ido-card-grid" container direction="column" spacing={2}>
              <Grid item>
                <div className="ido-card-header">
                  <p className="ido-card-header-title">MLS {t("Staking")} (🎩, 🎩)</p>
                </div>
              </Grid>

              <Grid item>
                <div className="ido-card-metrics">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="ido-card-apy">
                        <p className="ido-card-metrics-title">{t("APY")}</p>
                        <p className="ido-card-metrics-value">
                          {stakingAPY ? (
                            <>{new Intl.NumberFormat('en-US').format(Number(trimmedStakingAPY))}%</>
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </p>
                      </div>
                    </Grid>

                    <Grid item xs={6} sm={4} md={4} lg={4}>
                      <div className="ido-card-tvl">
                        <p className="ido-card-metrics-title">{t("TVL")}</p>
                        <p className="ido-card-metrics-value">
                          {stakingTVL ? (
                            new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            }).format(stakingTVL)
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </p>
                      </div>
                    </Grid>

                    <Grid item xs={6} sm={4} md={4} lg={4}>
                      <div className="ido-card-index">
                        <p className="ido-card-metrics-title">{t("Current Index")}</p>
                        <p className="ido-card-metrics-value">
                          {currentIndex ? <>{trim(Number(currentIndex), 2)} MLS</> : <Skeleton width="150px" />}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </Grid>

              <div className="ido-card-area">
                <div>
                  <div className="ido-card-action-area">
                    <div className="ido-card-action-stage-btns-wrap">
                      <div
                        onClick={changeView(0)}
                        className={classnames('ido-card-action-stage-btn', { active: !view })}
                      >
                        <p>{t("Stake")}</p>
                      </div>
                      <div
                        onClick={changeView(1)}
                        className={classnames('ido-card-action-stage-btn', { active: view })}
                      >
                        <p>{t("Unstake")}</p>
                      </div>
                    </div>

                    <div className="ido-card-action-row">
                      <OutlinedInput
                        type="number"
                        placeholder="Amount"
                        className="ido-card-action-input"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        labelWidth={0}
                        endAdornment={
                          <InputAdornment position="end">
                            <div onClick={setMax} className="ido-card-action-input-btn">
                              <p>{t("Max")}</p>
                            </div>
                          </InputAdornment>
                        }
                      />

                      {view === 0 && (
                        <div className="ido-card-tab-panel">
                          {account && hasAllowance('mls') ? (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                // if (isPendingTxn(pendingTransactions, 'staking')) return
                                onChangeStake('stake')
                              }}
                            >
                              {/* <p>{txnButtonText(pendingTransactions, 'staking', 'Stake MLS')}</p> */}
                            </div>
                          ) : (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                // if (isPendingTxn(pendingTransactions, 'approve_staking')) return
                                onSeekApproval('mls')
                              }}
                            >
                              {/* <p>{txnButtonText(pendingTransactions, 'approve_staking', 'Approve')}</p> */}
                            </div>
                          )}
                        </div>
                      )}

                      {view === 1 && (
                        <div className="ido-card-tab-panel">
                          {account && hasAllowance('smls') ? (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                // if (isPendingTxn(pendingTransactions, 'unstaking')) return
                                onChangeStake('unstake')
                              }}
                            >
                              {/* <p>{txnButtonText(pendingTransactions, 'unstaking', 'Unstake MLS')}</p> */}
                            </div>
                          ) : (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                // if (isPendingTxn(pendingTransactions, 'approve_unstaking')) return
                                onSeekApproval('smls')
                              }}
                            >
                              {/* <p>{txnButtonText(pendingTransactions, 'approve_unstaking', 'Approve')}</p> */}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* <div className="ido-card-action-help-text">
                        {account && ((!hasAllowance('mls') && view === 0) || (!hasAllowance('smls') && view === 1)) && (
                          <p>
                            Note: The "Approve" transaction is only needed when staking/unstaking for the first time;
                            subsequent staking/unstaking only requires you to perform the "Stake" or "Unstake"
                            transaction.
                          </p>
                        )}
                      </div> */}
                  </div>

                  <div className="ido-user-data">
                    <div className="data-row">
                      <p className="data-row-name">{t("Your Balance")}</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(timeBalance), 4)} MLS</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">{t("Your Staked Balance")}</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trimmedMemoBalance} sMLS</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">{t("Next Reward Amount")}</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{nextRewardValue} sMLS</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">{t("Next Reward Yield")}</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">{t("ROI (5-Day Rate)")}</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(fiveDayRate) * 100, 4)}%</>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
          </div>
        </Zoom>
      </div>
    </Page>
  )
}
