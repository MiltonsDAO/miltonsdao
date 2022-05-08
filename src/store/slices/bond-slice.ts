import { ethers, constants } from 'ethers'
import { getMarketPrice, getTokenPrice } from 'helpers'
import { calculateUserBondDetails, getBalances, loadAccountDetails } from './account-slice'
import { getAddresses } from 'constants/'
import { fetchPendingTxns, clearPendingTxn } from './pending-txns-slice'
import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit'
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { fetchAccountSuccess } from './account-slice'
import { Bond } from 'helpers/bond/bond'
import { Networks } from 'constants/blockchain'
import { getBondCalculator } from 'helpers/bond-calculator'
import { RootState } from '../store'
// import { avaxTime, wavax } from "helpers/bond";
import { error, warning, success, info } from '../slices/messages-slice'
import { messages } from 'constants/messages'
import { getGasPrice } from 'helpers/get-gas-price'
import { metamaskErrorWrap } from 'helpers/metamask-error-wrap'
import { sleep } from 'helpers'
import { BigNumber } from 'ethers'
import { ContractInterface, Contract, utils } from 'ethers'
import { ERC20_INTERFACE, PMLS_INTERFACE, MLS_INTERFACE, REFERRAL_INTERFACE } from 'config/abi/erc20'
import { useSelector } from 'react-redux'
import { stat } from 'fs'
import { AppState } from 'state'

import { IAllBondData } from 'hooks/bonds'
import { toBn } from 'evm-bn'

interface IChangeApproval {
  bond: Bond
  provider: StaticJsonRpcProvider | JsonRpcProvider
  networkID: Networks
  address: string
}

export const changeApproval = createAsyncThunk(
  'bonding/changeApproval',
  async ({ bond, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
      dispatch(warning({ text: messages.please_connect_wallet }))
      return
    }

    const signer = provider.getSigner()
    const reserveContract = bond.getContractForReserve(networkID, signer)

    let approveTx
    try {
      const gasPrice = await getGasPrice(provider)
      const bondAddr = bond.getAddressForBond(networkID)
      approveTx = await reserveContract.approve(bondAddr, constants.MaxUint256, { gasPrice })
      dispatch(
        fetchPendingTxns({
          txnHash: approveTx.hash,
          text: 'Approving ' + bond.displayName,
          type: 'approve_' + bond.name,
        }),
      )
      await approveTx.wait()
      dispatch(success({ text: messages.tx_successfully_send }))
    } catch (err: any) {
      metamaskErrorWrap(err, dispatch)
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash))
      }
    }

    // await sleep(2)

    let allowance = '0'

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID))

    return dispatch(
      fetchAccountSuccess({
        bonds: {
          [bond.name]: {
            allowance: Number(allowance),
          },
        },
      }),
    )
  },
)

interface ICalcBondDetails {
  bond: Bond
  value: string | null
  provider: StaticJsonRpcProvider | JsonRpcProvider
  networkID: Networks
}

export interface IBondDetails {
  bond: string
  bondDiscount: number
  bondQuote: number
  purchased: number
  vestingTerm: number
  maxBondPrice: number
  bondPrice: number
  marketPrice: number
  maxBondPriceToken: number
}

export const calcBondDetails = createAsyncThunk(
  'bonding/calcBondDetails',
  async ({ bond, value, provider, networkID }: ICalcBondDetails, { dispatch }) => {
    if (!value) {
      value = '0'
    }
    let amountInWei = toBn(value)

    let bondPrice = 0,
      bondDiscount = 0,
      valuation = 0,
      bondQuote = 0

    const addresses = getAddresses(networkID)
    if (!addresses) {
      return new Promise<any>((resevle) => {
        resevle({
          bond: '',
          bondDiscount: 0,
          bondQuote: 0,
          purchased: 0,
          vestingTerm: 0,
          maxBondPrice: 0,
          bondPrice: 0,
          marketPrice: 0,
          maxBondPriceToken: 0,
        })
      })
    }
    const bondContract = bond.getContractForBond(networkID, provider)
    console.log("bondContract:",bondContract)
    const bondCalcContract = getBondCalculator(networkID, provider)

    const terms = await bondContract.terms()

    const maxBondPrice = (await bondContract.maxPayout()) / Math.pow(10, 9)
    console.log('maxBondPrice:', maxBondPrice)
    const marketPrice = (await getMarketPrice(networkID, provider)) / Math.pow(10, 9)

    try {
      bondPrice = await bondContract.bondPriceInUSD()
      // console.log('bondPrice:', bondPrice)

      bondDiscount = (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice
      // console.log('bondPriceInUSD:', bondPrice.toString(), 'marketPrice:', marketPrice, 'bondDiscount:', bondDiscount)
    } catch (e) {
      console.log('error getting bondPriceInUSD', e)
    }

    let maxBondPriceToken = 0
    const maxBondValue = ethers.utils.parseEther('1')

    if (bond.isLP) {
      valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei)
      bondQuote = await bondContract.payoutFor(valuation)

      bondQuote = bondQuote / Math.pow(10, 9)

      const maxValuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), maxBondValue)
      // console.log('maxValuation:', maxValuation.toString())

      const maxBondQuote = await bondContract.payoutFor(maxValuation)
      // console.log('maxBondQuote:', maxBondQuote.toString())

      maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -9))
      console.log('LP maxBondPriceToken:', maxBondPriceToken)
    } else {
      bondQuote = await bondContract.payoutFor(amountInWei)
      bondQuote = bondQuote / Math.pow(10, 18)

      const maxBondQuote = await bondContract.payoutFor(maxBondValue)
      maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -18))
      // console.log('maxBondPriceToken:', maxBondPriceToken)
    }

    if (!!value && bondQuote > maxBondPrice) {
      dispatch(error({ text: messages.try_mint_more(maxBondPrice.toFixed(2).toString()) }))
    }

    const token = bond.getContractForReserve(networkID, provider)
    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS)
    if (bond.isLP) {
      const assetAddress = bond.getAddressForReserve(networkID)
      const markdown = await bondCalcContract.markdown(assetAddress)

      purchased = await bondCalcContract.valuation(assetAddress, purchased)
      purchased = (markdown / Math.pow(10, 18)) * (purchased / Math.pow(10, 9))
    } else {
      if (bond.tokensInStrategy) {
        purchased = BigNumber.from(purchased).add(BigNumber.from(bond.tokensInStrategy)).toString()
      }
      purchased = purchased / Math.pow(10, 18)
    }

    return {
      bond: bond.name,
      bondDiscount,
      bondQuote,
      purchased,
      vestingTerm: Number(terms.vestingTerm),
      maxBondPrice,
      bondPrice: bondPrice / Math.pow(10, 18),
      marketPrice,
      maxBondPriceToken,
    }
  },
)

interface IBondAsset {
  value: string
  address: string
  bond: Bond
  networkID: Networks
  provider: StaticJsonRpcProvider | JsonRpcProvider
  slippage: number
  useAvax: boolean
  referral: string
}

export const bondAsset = createAsyncThunk(
  'bonding/bondAsset',
  async ({ value, address, bond, networkID, provider, slippage, useAvax, referral }: IBondAsset, { dispatch }) => {
    const depositorAddress = address
    const acceptedSlippage = slippage / 100 || 0.005
    const valueInWei = ethers.utils.parseUnits(value, 'ether')
    const signer = provider.getSigner()
    const bondContract = bond.getContractForBond(networkID, signer)
    const addresses = getAddresses(networkID)

    const referralContract = new Contract(addresses.REFERRAL_ADDRESS, REFERRAL_INTERFACE, signer)
    const calculatePremium = await bondContract.bondPrice()
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage))
    let bondTx
    let bondCalcContract
    let valuation
    let bondQuote
    try {
      if (bond.isLP) {
        bondCalcContract = getBondCalculator(networkID, provider)
        valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), valueInWei)
        bondQuote = await bondContract.payoutFor(valuation)
      }
      const gasPrice = await getGasPrice(provider)
      bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { gasPrice })

      await bondTx.wait()
      try {
        if (bond.isLP) {
          await referralContract.setReferral(referral, bondQuote)
        } else {
          await referralContract.setReferral(referral, valueInWei.mul(100).div(calculatePremium * 1e9))
        }
      } catch (error: any) {
        console.log('referral:', error)
      }
      dispatch(calculateUserBondDetails({ address, bond, networkID, provider }))
      dispatch(loadAccountDetails({ networkID, provider, address }))
      dispatch(info({ text: messages.your_balance_updated }))
      return
    } catch (err: any) {
      return metamaskErrorWrap(err, dispatch)
    } finally {
      if (bondTx) {
        dispatch(clearPendingTxn(bondTx.hash))
      }
    }
  },
)

interface IRedeemBond {
  address: string
  bond: Bond
  networkID: Networks
  provider: StaticJsonRpcProvider | JsonRpcProvider
  autostake: boolean
}

export const redeemBond = createAsyncThunk(
  'bonding/redeemBond',
  async ({ address, bond, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
      dispatch(warning({ text: messages.please_connect_wallet }))
      return
    }

    const signer = provider.getSigner()
    const bondContract = bond.getContractForBond(networkID, signer)

    let redeemTx
    try {
      const gasPrice = await getGasPrice(provider)

      redeemTx = await bondContract.redeem(address, autostake === true, { gasPrice })
      const pendingTxnType = 'redeem_bond_' + bond.name + (autostake === true ? '_autostake' : '')
      dispatch(
        fetchPendingTxns({
          txnHash: redeemTx.hash,
          text: 'Redeeming ' + bond.displayName,
          type: pendingTxnType,
        }),
      )
      await redeemTx.wait()
      dispatch(success({ text: messages.tx_successfully_send }))
      // await sleep(0.01)
      dispatch(info({ text: messages.your_balance_update_soon }))
      // await sleep(10)
      await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }))
      // await dispatch(getBalances({ address, networkID, provider }))
      dispatch(info({ text: messages.your_balance_updated }))
      return
    } catch (err: any) {
      metamaskErrorWrap(err, dispatch)
    } finally {
      if (redeemTx) {
        dispatch(clearPendingTxn(redeemTx.hash))
      }
    }
  },
)

export interface IBondSlice extends IBondDetails {
  loading: boolean
}

const initialState: IBondSlice = {
  loading: true,
  bond: '',
  bondDiscount: 0,
  bondQuote: 0,
  purchased: 0,
  vestingTerm: 0,
  maxBondPrice: 0,
  bondPrice: 0,
  marketPrice: 0,
  maxBondPriceToken: 0,
}

const setBondState = (state: IBondSlice, payload: any) => {
  const bond = payload.bond
  const newState = { ...state[bond], ...payload }
  state[bond] = newState
  state.loading = false
}

const bondingSlice = createSlice({
  name: 'bonding',
  initialState,
  reducers: {
    fetchBondSuccess(state, action) {
      state[action.payload.bond] = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calcBondDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(calcBondDetails.fulfilled, (state, action) => {
        setBondState(state, action.payload)
        state.loading = false
      })
      .addCase(calcBondDetails.rejected, (state, { error }) => {
        state.loading = false
        console.log(error)
      })
  },
})

export default bondingSlice.reducer

export const { fetchBondSuccess } = bondingSlice.actions

const baseInfo = (state: RootState) => state.bonding

export const getBondingState = createSelector(baseInfo, (bonding) => bonding)
