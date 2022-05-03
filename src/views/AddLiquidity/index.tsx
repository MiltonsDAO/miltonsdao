import { useCallback, useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, TokenAmount, CurrencyAmount, WETH, Pair, Token } from '@pancakeswap/sdk'
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
  MetamaskIcon
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

import { StableBondContract } from 'abi'
import { usdt as usdtBond } from 'helpers/bond'
import { Input as NumericalInput } from 'components/CurrencyInputPanel/NumericalInput'
import { CopyButton } from 'components/CopyButton'
import { registerToken } from 'utils/wallet'
import { useIsListActive } from 'state/lists/hooks'

const SwitchIconButton = styled(IconButton)`
  box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.1);
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0 0.5rem;
`
const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`
const Container = styled.div`
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
`
export default function AddLiquidity() {
  const router = useRouter()
  const { toastError, toastWarning } = useToast()
  const pmlsBalance = useSelector((state: AppState) => state.account.balances.pmls)
  const mlsBalance = useSelector((state: AppState) => state.account.balances.mls)
  const usdtBalance = useSelector((state: AppState) => state.account.balances.usdt)


  const [min, setMin] = useState(BigNumber.from(0))
  const [pmlsAmount, setPMLSAmount] = useState("")
  const [usdtAmount, setUSDTAmount] = useState("")

  const [currencyIdA, currencyIdB] = router.query.currency || []

  const { account, chainId, library } = useActiveWeb3React()

  const acceptedSlippage = 0.005
  const signer = library?.getSigner()
  var bondAddress = usdtBond.networkAddrs[chainId].bondAddress
  const bondContract = new Contract(bondAddress, usdtBond.bondContractABI, signer)

  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const gasPrice = useGasPrice()

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(false)

  var PMLS = useCurrency(tokens.pmls.address)
  var USDT = useCurrency(tokens.usdt.address)
  var MLS = useCurrency(tokens.mls.address)

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
            <Box position="relative" id="tokenA">
              <Flex mb="6px" alignItems="center" justifyContent="space-between">
                <Flex>
                  <CurrencySelectButton
                    className="open-currency-select-button"
                    selected={!!tokens.pmls}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text id="pair" bold>
                        {tokens.pmls?.symbol}
                      </Text>
                    </Flex>
                  </CurrencySelectButton>
                  {tokens.pmls && tokens.pmls.address ? (
                    <Flex style={{ gap: '4px' }} alignItems="center">
                      <CopyButton
                        width="16px"
                        buttonColor="textSubtle"
                        text={tokens.pmls.address}
                        tooltipMessage={t('Token address copied')}
                        tooltipTop={-20}
                        tooltipRight={40}
                        tooltipFontSize={12}
                      />
                      {library?.provider?.isMetaMask && (
                        <MetamaskIcon
                          style={{ cursor: 'pointer' }}
                          width="16px"
                          onClick={() => registerToken(tokens.pmls.address, tokens.pmls.symbol, tokens.pmls.decimals)}
                        />
                      )}
                    </Flex>
                  ) : null}
                </Flex>
                {account && (
                  <Text onClick={() => onFieldAInput(utils.formatEther(pmlsBalance))} color="textSubtle" fontSize="14px" style={{ display: 'inline', cursor: 'pointer' }}>
                    {!!tokens.pmls && pmlsBalance
                      ? t('Balance: %balance%', { balance: utils.formatEther(pmlsBalance) })
                      : ' -'}
                  </Text>
                )}
              </Flex>
              <InputPanel>
                <Container as="label">
                  <LabelRow>
                    <NumericalInput
                      className="token-amount-input"
                      value={pmlsAmount}
                      onUserInput={(val) => {
                        setPMLSAmount(val)
                      }}
                    />
                  </LabelRow>
                </Container>
              </InputPanel>
            </Box>
            <Box position="relative" id="tokenA">
              <Flex mb="6px" alignItems="center" justifyContent="space-between">
                <Flex>
                  <CurrencySelectButton
                    className="open-currency-select-button"
                    selected={!!USDT}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text id="pair" bold>
                        {tokens.usdt?.symbol}
                      </Text>

                    </Flex>
                  </CurrencySelectButton>
                  {tokens.usdt && tokens.usdt.address ? (
                    <Flex style={{ gap: '4px' }} alignItems="center">
                      <CopyButton
                        width="16px"
                        buttonColor="textSubtle"
                        text={tokens.usdt.address}
                        tooltipMessage={t('Token address copied')}
                        tooltipTop={-20}
                        tooltipRight={40}
                        tooltipFontSize={12}
                      />
                      {library?.provider?.isMetaMask && (
                        <MetamaskIcon
                          style={{ cursor: 'pointer' }}
                          width="16px"
                          onClick={() => registerToken(tokens.usdt.address, tokens.usdt.symbol, tokens.usdt.decimals)}
                        />
                      )}
                    </Flex>
                  ) : null}
                </Flex>
                {account && (
                  <Text onClick={() => onFieldAInput(utils.formatEther(usdtBalance))} color="textSubtle" fontSize="14px" style={{ display: 'inline', cursor: 'pointer' }}>
                    {!!USDT && usdtBalance
                      ? t('Balance: %balance%', { balance: utils.formatEther(usdtBalance) })
                      : ' -'}
                  </Text>
                )}
              </Flex>
              <InputPanel>
                <Container as="label">
                  <LabelRow>
                    <NumericalInput
                      className="token-amount-input"
                      value={pmlsAmount}
                      onUserInput={(val) => {
                        setPMLSAmount(val)
                      }}
                    />
                  </LabelRow>
                </Container>
              </InputPanel>
            </Box>
            <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
              <SwitchIconButton
                variant="light"
                scale="sm"
              >
                <ArrowDownIcon
                  className="icon-down"
                />
              </SwitchIconButton>
            </AutoRow>
          </AutoColumn>
          <Box position="relative" id="tokenA">
            <Flex mb="6px" alignItems="center" justifyContent="space-between">
              <Flex>
                <CurrencySelectButton
                  className="open-currency-select-button"
                >
                  <Flex alignItems="center" justifyContent="space-between">
                    <Text id="pair" bold>
                      {tokens.mls?.symbol}
                    </Text>

                  </Flex>
                </CurrencySelectButton>
                {tokens.mls && tokens.mls.address ? (
                  <Flex style={{ gap: '4px' }} alignItems="center">
                    <CopyButton
                      width="16px"
                      buttonColor="textSubtle"
                      text={tokens.mls.address}
                      tooltipMessage={t('Token address copied')}
                      tooltipTop={-20}
                      tooltipRight={40}
                      tooltipFontSize={12}
                    />
                    {library?.provider?.isMetaMask && (
                      <MetamaskIcon
                        style={{ cursor: 'pointer' }}
                        width="16px"
                        onClick={() => registerToken(tokens.mls.address, tokens.mls.symbol, tokens.mls.decimals)}
                      />
                    )}
                  </Flex>
                ) : null}
              </Flex>
              {account && (
                <Text onClick={() => onFieldAInput(utils.formatUnits(mlsBalance, 9))} color="textSubtle" fontSize="14px" style={{ display: 'inline', cursor: 'pointer' }}>
                  {!!MLS
                    ? t('Balance: %balance%', { balance: utils.formatUnits(mlsBalance, 9) })
                    : ' -'}
                </Text>
              )}
            </Flex>
            <InputPanel>
              <Container as="label">
                <LabelRow>
                  <NumericalInput
                    className="token-amount-input"
                    value={pmlsAmount}
                    onUserInput={(val) => {
                      setPMLSAmount(val)
                    }}
                  />
                </LabelRow>
              </Container>
            </InputPanel>
          </Box>
          <Button
            onClick={async () => {
              if (usdtBalance.eq(0) || pmlsBalance.eq(0)) {
                toastError("Error", "No USDT")
                return
              }

              const usdtAllowance = await usdt.allowance(account, tokens.pmls.address)
              if (usdtAllowance.eq(0)) {
                var tx = await usdt.approve(tokens.pmls.address, MaxUint256)
                await tx.wait()
              }

              const maxBondPrice = await bondContract.maxPayout()
              var parsedPmlsAmount = utils.parseUnits(pmlsAmount, 9)
              if (parsedPmlsAmount.gt(maxBondPrice)) {
                toastError("Error", "Greater than max bond price:" + utils.formatUnits(maxBondPrice, 9))
                return
              }
              var pmlsAmountInWei = utils.parseUnits(pmlsAmount, 18)
              try {
                let bondTx = await pmls.swap(pmlsAmountInWei)
              } catch (error: any) {
                console.log(error)
                toastError("Error", error?.data?.message)
              }
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
