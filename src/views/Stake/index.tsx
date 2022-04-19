import { useCallback, useMemo, useState, useEffect } from 'react'
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
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { ROUTER_ADDRESS } from '../../config/constants'
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

import fromExponential from 'from-exponential'

import { useWeb3React } from '@web3-react/core'
import { loadAccountDetails, calculateUserBondDetails, calculateUserTokenDetails, IAccountSlice } from "../../store/slices/account-slice";
import { calcBondDetails } from "../../store/slices/bond-slice";
import { loadAppDetails, IAppSlice } from "../../store/slices/app-slice";
import { useAppDispatch } from 'state'
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { useMatchBreakpoints } from '../../../packages/uikit/src/hooks'
import useBonds from '../../hooks/bonds'
import useTokens from '../../hooks/Tokens'
import { useApp } from "../../hooks/useApp";
import {changeApproval} from "../../store/slices/wrap-slice";
import {changeStake} from "../../store/slices/stake-thunk";
import { messages } from "../../constants/messages";
import { warning, success, info, error } from "../../store/slices/messages-slice";

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

export default function Stake({ account }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { loadApp, loadAccount } = useApp()
  const { isMobile } = useMatchBreakpoints()
  const dispatch = useDispatch();

  const [currencyIdA, currencyIdB] = router.query.currency || []
  const { chainId, library } = useWeb3React()
  const { toastError, toastWarning } = useToast()

  const [view, setView] = useState(0)
  const [quantity, setQuantity] = useState<string>('')

  const isAppLoading = useSelector<AppState, boolean>(state => state.app.loading);

  useEffect(() => {
    if (account) {
      loadApp()
      loadAccount()
    }
  }, [account])

  const app = useSelector<AppState, IAppSlice>(state => {
    return state.app;
  });
  const currentIndex = app.currentIndex;

  const fiveDayRate = app.fiveDayRate;

  const accountSlice = useSelector<AppState, IAccountSlice>(state => {
    return state.account;
  });

  const timeBalance = accountSlice.balances && accountSlice.balances.mls;

  const memoBalance = accountSlice.balances && accountSlice.balances.smls;

  const stakeAllowance = accountSlice.staking && accountSlice.staking.mls;

  const unstakeAllowance = accountSlice.staking && accountSlice.staking.smls;
  const stakingRebase = app.stakingRebase;
  const stakingAPY = app.stakingAPY;
  const stakingTVL = app.stakingTVL;

  const pendingTransactions = useSelector<AppState, IPendingTxn[]>(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(timeBalance)
    } else {
      setQuantity(memoBalance)
    }
  }

  const onSeekApproval = async (token: string) => {
    await dispatch(changeApproval({ address: account, token, provider:library, networkID: chainId }))
  }

  const onChangeStake = async (action: string) => {
    if (quantity === '' || parseFloat(quantity) === 0) {
      toastError("error", action === 'stake' ? messages.before_stake : messages.before_unstake )
    } else {
      await dispatch(changeStake({ address: account, action, value: String(quantity), provider:library, networkID: chainId }))
      setQuantity('')
    }
  }

  const hasAllowance = useCallback(
    (token) => {
      if (token === 'mls') return stakeAllowance > 0
      if (token === 'smls') return unstakeAllowance > 0
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


  return (
    <Page>
      <div className="ido-view" style={isMobile ? { margin: "unset" } : {}}>
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
                                var pendingTxn = isPendingTxn(pendingTransactions, 'staking')
                                console.log("pendingTxn:",pendingTxn)
                                if (pendingTxn) return
                                onChangeStake('stake')
                              }}
                            >
                              <p>{txnButtonText(pendingTransactions, 'staking', 'Stake MLS')}</p>
                            </div>
                          ) : (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                if (isPendingTxn(pendingTransactions, 'approve_staking')) return
                                onSeekApproval('mls')
                              }}
                            >
                              <p>{txnButtonText(pendingTransactions, 'approve_staking', 'Approve')}</p>
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
                                if (isPendingTxn(pendingTransactions, 'unstaking')) return
                                onChangeStake('unstake')
                              }}
                            >
                              <p>{txnButtonText(pendingTransactions, 'unstaking', 'Unstake MLS')}</p>
                            </div>
                          ) : (
                            <div
                              className="ido-card-tab-panel-btn"
                              onClick={() => {
                                if (isPendingTxn(pendingTransactions, 'approve_unstaking')) return
                                onSeekApproval('smls')
                              }}
                            >
                              <p>{txnButtonText(pendingTransactions, 'approve_unstaking', 'Approve')}</p>
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
