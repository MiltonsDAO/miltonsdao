import { BigNumber, ethers } from 'ethers'
import { getAddresses } from 'constants/'
import { TimeTokenContract, TestContract, MemoTokenContract, DaiTokenContract, wMemoTokenContract } from 'abi'
import PMLSContract from 'config/abi/pmls.json'
import { setAll } from 'helpers'

import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit'
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Bond } from 'helpers/bond/bond'
import { Networks } from 'constants/blockchain'
import React from 'react'
import { RootState } from '../store'
import { IToken } from 'helpers/tokens'
import { BooleanArraySupportOption } from 'prettier'
import { ERC20_INTERFACE, PMLS_INTERFACE, MLS_INTERFACE, REFERRAL_INTERFACE } from 'config/abi/erc20'

interface IGetBalances {
  address: string
  networkID: Networks
  provider: StaticJsonRpcProvider | JsonRpcProvider
}

interface IAccountBalances {
  balances: {
    smls: BigNumber
    mls: BigNumber
    pmls: BigNumber
    usdt: BigNumber
  }
}

export const getBalances = createAsyncThunk(
  'account/getBalances',
  async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID)

    const smlsContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, provider)
    let smlsBalance:BigNumber = await smlsContract.balanceOf(address)

    const newMemoContract = new ethers.Contract(addresses.NEW_sOHM_ADDRESS, MemoTokenContract, provider)
    const newSMLSBalance:BigNumber  = await newMemoContract.balanceOf(address)
    smlsBalance = newSMLSBalance.add(smlsBalance)

    const mlsContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, provider)
    const mlsBalance = await mlsContract.balanceOf(address)

    const pmlsContract = new ethers.Contract(addresses.PMLS_ADDRESS, PMLSContract, provider)
    const pmlsBalance = await pmlsContract.balanceOf(address)

    const usdtContract = new ethers.Contract(addresses.USDT_ADDRESS, PMLSContract, provider)
    const usdtBalance = await usdtContract.balanceOf(address)

    return {
      balances: {
        smls: smlsBalance,
        mls: mlsBalance,
        pmls: pmlsBalance,
        usdt: usdtBalance,
      },
    }
  },
)

interface ILoadAccountDetails {
  address: string
  networkID: Networks
  provider: StaticJsonRpcProvider | JsonRpcProvider
}

interface IUserAccountDetails {
  totalProfit: number
  partners: ISonSlice[]
  referral: string
  registered: boolean
  balances: {
    mls: number
    smls: number
    wmemo: string
  }
  allowance: {
    mls: BigNumber
    smls: BigNumber
  }
  wrapping: {
    smls: number
  }
}

export const loadAccountDetails = createAsyncThunk(
  'account/loadAccountDetails',
  async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let timeBalance 
    let smlsBalance

    let wmemoBalance 
    let memoWmemoAllowance = 0

    let stakeAllowance = BigNumber.from(0)
    let unstakeAllowance = BigNumber.from(0)

    var totalProfit = 0
    let sonslice: ISonSlice[] = []
    let referral = ''
    let registered = false
    const addresses = getAddresses(networkID)

    if (addresses.OHM_ADDRESS) {
      const mlsContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, provider)
      timeBalance = await mlsContract.balanceOf(address)
      stakeAllowance = await mlsContract.allowance(address, addresses.NEW_STAKING_HELPER_ADDRESS)
    }
    if (addresses.sOHM_ADDRESS) {
      const smlsContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, provider)
      smlsBalance = await smlsContract.balanceOf(address)
      if (addresses.STAKING_ADDRESS) {
        unstakeAllowance = await smlsContract.allowance(address, addresses.STAKING_ADDRESS)
      }
    }
    if (addresses.NEW_sOHM_ADDRESS) {
      const newSMLSContract = new ethers.Contract(addresses.NEW_sOHM_ADDRESS, MemoTokenContract, provider)
      const newSMLSBalance = await newSMLSContract.balanceOf(address)
      if (!unstakeAllowance.eq(0)) {
        unstakeAllowance = await newSMLSContract.allowance(address, addresses.NEW_STAKING_ADDRESS)
      }
      if (smlsBalance == 0) {
        smlsBalance = newSMLSBalance
      }
    }
    if (addresses.REFERRAL_ADDRESS) {
      const referralContract = new ethers.Contract(addresses.REFERRAL_ADDRESS, REFERRAL_INTERFACE, provider)
      referral = await referralContract.referrals(address)
    }
    return {
      totalProfit: totalProfit,
      partners: sonslice,
      referral: referral,
      registered: registered,
      balances: {
        smls: smlsBalance,
        mls: timeBalance,
        wmemo: ethers.utils.formatEther(wmemoBalance),
      },
      allowance: {
        mls: stakeAllowance,
        smls: unstakeAllowance,
      },
      wrapping: {
        smls: Number(memoWmemoAllowance),
      },
    }
  },
)

interface ICalcUserBondDetails {
  address: string
  bond: Bond
  provider: StaticJsonRpcProvider | JsonRpcProvider
  networkID: Networks
}

export interface IUserBondDetails {
  allowance: number
  balance: number
  avaxBalance: number
  interestDue: number
  bondMaturationBlock: number
  pendingPayout: number //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk(
  'account/calculateUserBondDetails',
  async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
      return new Promise<any>((resevle) => {
        resevle({
          bond: '',
          displayName: '',
          bondIconSvg: '',
          isLP: false,
          allowance: 0,
          balance: 0,
          interestDue: 0,
          bondMaturationBlock: 0,
          pendingPayout: '',
          avaxBalance: 0,
        })
      })
    }

    const bondContract = bond.getContractForBond(networkID, provider)
    const reserveContract = bond.getContractForReserve(networkID, provider)

    let interestDue, pendingPayout, bondMaturationBlock
    const bondDetails = await bondContract.bondInfo(address)
    interestDue = ethers.utils.formatUnits(bondDetails.payout, 'gwei')

    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastTime)

    try {
      pendingPayout = await bondContract.pendingPayoutFor(address)
    } catch (error) {
      console.log(error)
    }

    let allowance,
      balance = '0'

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID))
    balance = await reserveContract.balanceOf(address)
    const balanceVal = balance && ethers.utils.formatEther(balance)
    const avaxBalance = await provider.getSigner().getBalance()
    const avaxVal = ethers.utils.formatEther(avaxBalance)

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, 'gwei')

    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: allowance,
      balance: balanceVal,
      avaxBalance: avaxVal,
      interestDue: interestDue,
      bondMaturationBlock,
      pendingPayout: pendingPayoutVal,
    }
  },
)

interface ICalcUserTokenDetails {
  address: string
  token: IToken
  provider: StaticJsonRpcProvider | JsonRpcProvider
  networkID: Networks
}

export interface IUserTokenDetails {
  allowance: number
  balance: number
  isAvax?: boolean
}

export const calculateUserTokenDetails = createAsyncThunk(
  'account/calculateUserTokenDetails',
  async ({ address, token, networkID, provider }: ICalcUserTokenDetails) => {
    if (!address) {
      return new Promise<any>((resevle) => {
        resevle({
          token: '',
          address: '',
          img: '',
          allowance: 0,
          balance: 0,
        })
      })
    }

    if (token.isAvax) {
      const avaxBalance = await provider.getSigner().getBalance()
      const avaxVal = ethers.utils.formatEther(avaxBalance)

      return {
        token: token.name,
        tokenIcon: token.img,
        balance: Number(avaxVal),
        isAvax: true,
      }
    }

    const addresses = getAddresses(networkID)
    let tokenContract = new ethers.Contract(token.address, DaiTokenContract, provider)

    let allowance,
      balance = '0'

    allowance = await tokenContract.allowance(address, addresses.ZAPIN_ADDRESS)

    balance = await tokenContract.balanceOf(address)
    const balanceVal = Number(balance) / Math.pow(10, token.decimals)

    return {
      token: token.name,
      address: token.address,
      img: token.img,
      allowance: Number(allowance),
      balance: Number(balanceVal),
    }
  },
)

export interface ISonSlice {
  address: string
  profit: BigNumber
}
export interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails }
  balances: {
    smls: BigNumber
    mls: BigNumber
    pmls: BigNumber
    usdt: BigNumber
    // wmemo: BigNumber
  }
  loading: boolean
  partners: ISonSlice[]
  referral: string
  registered: boolean
  totalProfit: number
  allowance: {
    mls: BigNumber
    smls: BigNumber
  }
  wrapping: {
    smls: BigNumber
  }
  tokens: { [key: string]: IUserTokenDetails }
}

const initialState: IAccountSlice = {
  loading: true,
  partners: [],
  referral: '',
  registered: false,
  totalProfit: 0,
  bonds: {},
  balances: { smls: BigNumber.from(0), mls: BigNumber.from(0), pmls: BigNumber.from(0), usdt: BigNumber.from(0) },
  allowance: { mls: BigNumber.from(0), smls: BigNumber.from(0) },
  wrapping: { smls: BigNumber.from(0) },
  tokens: {},
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAccountDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload)
        state.loading = false
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false
        console.log(error)
      })
      .addCase(getBalances.pending, (state) => {
        state.loading = true
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload)
        state.loading = false
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false
        console.log(error)
      })
      .addCase(calculateUserBondDetails.pending, (state, action) => {
        state.loading = true
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return
        const bond = action.payload.bond
        state.bonds[bond] = action.payload
        state.loading = false
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false
        console.log(error)
      })
      .addCase(calculateUserTokenDetails.pending, (state, action) => {
        state.loading = true
      })
      .addCase(calculateUserTokenDetails.fulfilled, (state, action) => {
        if (!action.payload) return
        const token = action.payload.token
        state.tokens[token] = action.payload
        state.loading = false
      })
      .addCase(calculateUserTokenDetails.rejected, (state, { error }) => {
        state.loading = false
        console.log(error)
      })
  },
})

export default accountSlice.reducer

export const { fetchAccountSuccess } = accountSlice.actions

const baseInfo = (state: RootState) => state.account

export const getAccountState = createSelector(baseInfo, (account) => account)
