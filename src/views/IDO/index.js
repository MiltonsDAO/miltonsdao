import { useMemo, useState, useCallback, useEffect, useRef, Component } from 'react'
import { Grid, InputAdornment, OutlinedInput, Zoom, Slider } from '@material-ui/core'
import PageSection from 'components/PageSection'

import { useWeb3Context, useAddress } from '../../hooks'
import poolabi from './poolabi'
import usdtabi from './usdtabi'
import { useSelector, useDispatch } from 'react-redux'
import {
  IPendingTxn,
  isPendingTxn,
  txnButtonText,
  clearPendingTxn,
  fetchPendingTxns,
  getWrappingTypeText,
} from '../../store/slices/pending-txns-slice'
import { messages } from '../../constants/messages'
import classnames from 'classnames'
import { error, warning, success, info } from '../../store/slices/messages-slice'
import { ethers, BigNumber } from 'ethers'
import { IAccountSlice, fetchAccountSuccess } from 'store/slices/account-slice'
import { Skeleton } from '@material-ui/lab'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { shorten, trim } from '../../helpers'
import { metamaskErrorWrap } from '../../helpers/metamask-error-wrap'
import copy from 'copy-to-clipboard'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import { formatUnits } from 'ethers/lib/utils'
import { extend } from 'lodash'
import { render } from 'react-dom'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { AppDispatch, AppState } from '../../state'
import Page from '../Page'
import styled from 'styled-components'
import Timer from 'views/Lottery/components/Countdown/Timer'
import useNextEventCountdown from 'views/Lottery/hooks/useNextEventCountdown'
import { useAppDispatch } from 'state'
import useToast from 'hooks/useToast'
import { useTranslation } from 'contexts/Localization'
import { useWeb3React } from '@web3-react/core'


var featured = {
  closes_in: 'Ended',
  distribute_token: 0,
  _id: '',
  start_date: Date.parse(new Date('2022-03-25 00:00:00 GMT+0800')),
  end_date: Date.parse(new Date('2022-04-06 00:00:00 GMT+0800')),
  pool_type: 'featured',
  title: 'PMIL',
  up_pool_raise: 1 / 2.2,
  usd_per_share: 1,
  content:
    'Membership sustainable income business based on risk free asset.',
  images: '',
  min_allocation: '',
  max_allocation: '',
  up_pool_access: 'Public 1',
  participants: 0,
  swap_amount: null,
  min_swap_level: '',
  symbol: 'PMIL',
  decimal: 18,
  // address: '0x5B611c2935BB1c1fBE231292eDB02774425D4821',
  address: "0x82546044488199dAb10F0eA0DdF534134C3B8a61",
  token_address: 'TBA',
  abi_name: '',
  raised: 0,
  total_supply: 1000000,
  idoPercent: 1,
  description: '<p>PMIL Eco</p>',
  twitter_link: '',
  git_link: '',
  telegram_link: '',
  reddit_link: '',
  medium_link: '',
  browser_web_link: '',
  youtube: '',
  instagram: '',
  discord: '',
  white_paper: '',
  network_type: 'BSC',
  crypto_type: 'USDT',
  idophase: 'Public 1',
  token_distribution_date: '',
  fblink: '',
  contract_type: '',
  createdAt: '',
  updatedAt: Date.now(),
  __v: 0,
  Owner: null,
  price: null,
  time_duration: Date.now(),
}

var startDate = new Date(featured.start_date)
let year = startDate.getFullYear()
let month = startDate.getMonth() + 1
let day = startDate.getDate()
let hour = startDate.getHours()
let minute = startDate.getMinutes()
let second = startDate.getSeconds()
const start = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second

const endDate = new Date(featured.end_date)
year = endDate.getFullYear()
month = endDate.getMonth() + 1
day = endDate.getDate()
hour = endDate.getHours()
minute = endDate.getMinutes()
second = endDate.getSeconds()
const endTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second

let title = ''
const uint256MAX = BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935')
let usdt = null
let ido = null
let closed = 0
let closesIn = 0
let startIn = 0
let filled = 0
let y = 0
let closes_seconds = ''


function IDO() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { chainID, library } = useActiveWeb3React()
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const [approved, setApproved] = useState(false)
  const [number1, setNumber1] = useState(0)
  const [number2, setNumber2] = useState(0)
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [PMLIBalance, setPMILBalance] = useState(BigNumber.from(0))
  const [amount, setAmount] = useState(100)
  const [startTime, setStartTime] = useState(0)
  const [startTimeMobile, setStartTimeMobile] = useState(0)

  title =
    featured.title && featured.title.length && featured.title.length >= 20
      ? `${featured.title.substring(0, 20)}...`
      : featured.title

  const signer = library.getSigner()

  ido = new ethers.Contract(featured.address, JSON.stringify(poolabi), signer)
  // usdt = new ethers.Contract('0x55d398326f99059fF775485246999027B3197955', JSON.stringify(usdtabi), signer)
  usdt = new ethers.Contract("0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c", JSON.stringify(usdtabi), signer);

  const useNextEventCountdown = (startDate, endDate) => {
    const [secondsRemaining, setSecondsRemaining] = useState(null)
    const timer = useRef(null)
    useEffect(() => {
      const now = Date.now()
      const startUnixStamp = Date.parse(startDate)
      const endUnixStamp = Date.parse(endDate)
      const currentSeconds = Math.floor(now / 1000)
      let secondsRemainingCalc
      if (now < startUnixStamp ) {
        secondsRemainingCalc = startUnixStamp - now
      } else if (startUnixStamp < now && now < endUnixStamp) {
        secondsRemainingCalc = endUnixStamp - now
      }
      setSecondsRemaining(secondsRemainingCalc)
      timer.current = setInterval(() => {
        update()

        setSecondsRemaining((prevSecondsRemaining) => {
          if (prevSecondsRemaining <= 1) {
            clearInterval(timer.current)
          }
          return prevSecondsRemaining - 1
        })
      }, 1000)
      return () => clearInterval(timer.current)
    }, [setSecondsRemaining, timer])
    return secondsRemaining

  }

  const secondsRemaining = useNextEventCountdown(startDate, endDate)
  const update = useCallback(() => {
    let date = new Date();
    let now_utc = Date.parse(date);
    if (number1 > "99.98") {
      startIn = 0;
      closesIn = 0;
      closed = 0;
      filled = 1;
      y = 1;
    } else if (endDate < now_utc) {
      closed = 1;
      y = 1;
    } else if (now_utc < startDate) {
      startIn = 1;
      y = 1;
    } else if (endDate >= now_utc && now_utc >= startDate) {
      closesIn = 1;
      startIn = 0;
      y = 0;
    } else {
      startIn = 0;
      closesIn = 0;
      y = 1;
    }

    let closes_in_days = "";
    let closes_in_hours = "";
    let closes_in_minutes = "";
    let desktopTimer = "";
    let mobileTimer = "";
    let closes_in_sec = "";
    if (startDate && startIn) {
      closes_in_sec = (startDate - now_utc) / 1000;

      closes_in_days = Math.floor(closes_in_sec / (3600 * 24));

      closes_in_sec -= closes_in_days * 86400;

      closes_in_hours = Math.floor(closes_in_sec / 3600) % 24;
      closes_in_sec -= closes_in_hours * 3600;

      closes_in_minutes = Math.floor(closes_in_sec / 60) % 60;
      closes_in_sec -= closes_in_minutes * 60;

      closes_seconds = Math.floor(closes_in_sec % 60);

      desktopTimer = `${closes_in_days} days: ${closes_in_hours} hours: ${closes_in_minutes} minutes: ${closes_in_sec} seconds`;
      mobileTimer = `${closes_in_days} d: ${closes_in_hours} h: ${closes_in_minutes} m: ${closes_in_sec} s`;

      setStartTime(desktopTimer)
      setStartTimeMobile(mobileTimer)
    }

    if (endDate && closesIn) {
      closes_in_sec = (endDate - now_utc) / 1000;

      closes_in_days = Math.floor(closes_in_sec / (3600 * 24));

      closes_in_sec -= closes_in_days * 86400;

      closes_in_hours = Math.floor(closes_in_sec / 3600) % 24;
      closes_in_sec -= closes_in_hours * 3600;

      closes_in_minutes = Math.floor(closes_in_sec / 60) % 60;
      closes_in_sec -= closes_in_minutes * 60;

      closes_seconds = Math.floor(closes_in_sec % 60);

      desktopTimer = `${closes_in_days} days: ${closes_in_hours} hours: ${closes_in_minutes} minutes: ${closes_seconds} seconds`;
      mobileTimer = `${closes_in_days}d: ${closes_in_hours}h: ${closes_in_minutes}m: ${closes_seconds}s`;

      setStartTime(desktopTimer)
      setStartTimeMobile(mobileTimer)
      if (account) {
        updatePool();
      }
    }
  }, [secondsRemaining])

  const updatePool = useCallback(async () => {
    var allowance = await usdt.allowance(account, featured.address);
    setApproved(BigNumber.from(allowance) >= uint256MAX / 2);

    var balance = await ido.getIDOBalance(account);
    setBalance(balance);

    setPMILBalance(await ido.balances(account));
    
    var total = await ido.IDOTotal();
    featured.raised = total;
    setNumber1(((featured.raised * featured.up_pool_raise) / 10 ** 18 / (featured.total_supply * featured.idoPercent)) * 100);
    setNumber2(featured.raised / 10 ** 18);

  }, [secondsRemaining, account]);

  async function buyToken() {
    const usdPerShare = featured.usd_per_share
    let stake = (BigNumber.from(10).pow(18) * amount * usdPerShare).toString()
    console.log(stake);
    try {
      await ido.attendIDO(stake)
    } catch (error) {
      metamaskErrorWrap(error, dispatch)
    }
  }

  let full = ''
  let length = featured.content && featured.content.length && featured.content.length > 210
  let num = Math.ceil(number1 / 2)
  let allocation = number2 * featured.up_pool_raise
  if (num === 50) {
    full = 'fullupload'
  }
  return (
    <Page>
      <div className='ido-view'>
        <Zoom in={true}>
          <div className="ido-card">
            <div className="home">
              <div className="pools feat_ured">
                <div className="container_cust">
                  <div className="inner_pools">
                    <div className="pool_grid home">
                      {' '}
                      <div className="pool_card">
                        <div className="pool-link">
                          <div className="tit_le">
                            <div className="title-img">
                              <div className="image_circle" />
                            </div>
                            <div className="title-head">
                              <h3>
                                {/* <div className="h-title">{title}</div> */}
                                <span>
                                  1 {featured.symbol} = {1 / featured.up_pool_raise}{' '}
                                  {featured.crypto_type === 'USDT' ? 'USDT' : 'BNB'}
                                </span>
                              </h3>
                              <div className="title-info">
                                <p>
                                  {length ? featured.content.substring(0, 170) : featured.content}
                                  {length ? '...' : ''}
                                  {length && <a href="#read-more">Read More</a>}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="title-head-mob">
                            {/* <h3>
                                                        <div className="h-title">{title}</div>
                                                    </h3> */}
                            <div className="title-info">
                              <p>
                                {length ? featured.content.substring(0, 170) : featured.content}
                                {length ? '...' : ''}
                                {length && <a href="#read-more">Read More</a>}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="center-bg"></div>
                        <div className="home-progress">
                          <div className="raise-three mob">
                            <div className="raise">
                              <p className="total_raise">Total Raised</p>
                              <h2>
                                {number2 ? number2.toFixed(2) : '0'} {featured.crypto_type === 'USDT' ? 'USDT' : 'BNB'}
                              </h2>
                            </div>
                            <div className="allocation">
                              <div>
                                <p className="feature_max">Maximum</p>
                                <h3>
                                  {featured.max_allocation
                                    ? featured.max_allocation + (featured.crypto_type === 'USDT' ? ' USDT' : ' BNB')
                                    : 'TBA'}
                                </h3>
                              </div>
                              <div>
                                <p className="feature_max">Access</p>
                                <h3>{featured.up_pool_access}</h3>
                              </div>
                            </div>
                          </div>
                          <div className="allocation-mob">
                            <div>
                              <p className="feature_max">Maximum</p>
                              <h3>
                                {featured.max_allocation
                                  ? featured.max_allocation + (featured.crypto_type === 'USDT' ? ' USDT' : ' BNB')
                                  : 'TBA'}
                              </h3>
                            </div>
                            <div>
                              <p className="feature_max">Access</p>
                              <h3>{featured.up_pool_access}</h3>
                            </div>
                          </div>
                          <div className="rts">
                            {startIn ? <p className="status-p">Start in</p> : ''}
                            <div className="timer_desktop">
                              {startIn === 1 ? (
                                <h3 style={{ color: "white", fontSize: 18 }} id="poolonpagestart">
                                  {startTime}
                                </h3>
                              ) : (
                                ''
                              )}
                            </div>
                            <div className="timer_mobile">
                              {startIn === 1 ? (
                                <h3 style={{ color: 'white', fontSize: 14 }} id="poolonpagestart">
                                  {startTimeMobile}
                                </h3>
                              ) : (
                                ''
                              )}
                            </div>
                            {closesIn ? <p className="status-p">Ends in</p> : ''}
                            <div className="timer_desktop">
                              {closesIn === 1 ? (
                                <h3 style={{ color: 'white', fontSize: 18 }} id="poolonpagestart">
                                  {startTime}
                                </h3>
                              ) : (
                                ''
                              )}
                            </div>
                            <div className="timer_mobile">
                              {closesIn === 1 ? (
                                <h3 style={{ color: 'white', fontSize: 14 }} id="poolonpagestart">
                                  {startTimeMobile}
                                </h3>
                              ) : (
                                ''
                              )}
                            </div>
                            {closed ? <p className="status-p">Status</p> : ''}
                            {closed ? <h3>Closed</h3> : ''}
                            {filled ? <h3>Filled</h3> : ''}
                          </div>
                          <div className="prog_bar">
                            <div className="prog_bar_grd">
                              <span className="prog">Progress</span>
                              {/* <span className="parti">
                                                            Max Participants <span className="white_text">{participants.toString()}</span>
                                                        </span> */}
                            </div>
                            <div className={`battery ${full}`}>
                              {num
                                ? [...Array(num)].map((item, index) => (
                                  <div className="bar active" key={index} data-power="10"></div>
                                ))
                                : ''}
                            </div>
                            <div className="prog_bar_grd">
                              {<span className="prog _percent">{number1 ? number1.toFixed(2) : '0'}%</span>}
                              {
                                <span className="parti _nls">
                                  {allocation ? allocation.toFixed(2) : '0'}/{featured.total_supply}{' '}
                                  {featured.symbol}
                                </span>
                              }
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="buy-btnbtc">
                              <div className="buy-token">
                                {approved ? (
                                  <OutlinedInput
                                    id="buy-button"
                                    className="btnn_white"
                                    style={{ color: 'white', border: '2px solid #2f2f37', width: '8rem' }}
                                    type="number"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => {
                                      var value = e.target.value
                                      setAmount(value)
                                    }}
                                    endAdornment={
                                      <InputAdornment position="end">
                                        <div
                                          style={{ cursor: 'pointer' }}
                                          className="wrap-action-input-btn"
                                          onClick={async () => {
                                            if (endDate && closesIn) {
                                              if (!account) {
                                                toastError(t('Error'), t('Not connected'))
                                                return
                                              }
                                              var balance = await ido.getBalance(account)
                                              if (balance == 0) {
                                                if (amount >= 100 && amount <= 1000) {
                                                  buyToken(amount)
                                                } else {
                                                  toastError(t('Error'), t('The first amount have to bewteen 100 and 1000'))
                                                }
                                              } else {
                                                var added = balance.add(BigNumber.from(10).pow(18).mul(amount))
                                                if (added > BigNumber.from(10).pow(18) * 1000) {
                                                  toastError(t('Error'), t('Total amount have to be smaller than 1000'))
                                                } else {
                                                  buyToken(amount)
                                                }
                                              }
                                            } else {
                                              toastError(t('Error'), t('Not start yet'))
                                            }
                                          }}
                                        >
                                          <p>Buy</p>
                                        </div>
                                      </InputAdornment>
                                    }
                                  ></OutlinedInput>
                                ) : (
                                  <button
                                    className="btnn_white"
                                    onClick={async () => {
                                      if (!account) {
                                        toastError(t('Error'), t('Not connected'))
                                        return
                                      }
                                      if (endDate && closesIn) {
                                        await usdt.approve(featured.address, BigNumber.from(uint256MAX))
                                      } else {
                                        toastError(t('Error'), t('Not start yet'))
                                      }
                                    }}
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <p>IDO Balance:{formatUnits(balance, 18)} USDT</p>
                              <p>PMIL Balance:{formatUnits(PMLIBalance, 18)} PMIL</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Zoom>
      </div>
    </Page>
  )
}

export default IDO
