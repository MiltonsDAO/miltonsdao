import { BigNumber, ethers } from 'ethers'
import { getAddresses } from 'constants/'
import { TimeTokenContract, TestContract, MemoTokenContract, DaiTokenContract, wMemoTokenContract } from 'abi'
import { setAll } from 'helpers'

import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit'
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Bond } from 'helpers/bond/bond'
import { Networks } from 'constants/blockchain'
import React from 'react'
import { RootState } from '../store'
import { IToken } from 'helpers/tokens'
import { BooleanArraySupportOption } from 'prettier'

interface IGetBalances {
  address: string
  networkID: Networks
  provider: StaticJsonRpcProvider | JsonRpcProvider
}

interface IAccountBalances {
  balances: {
    smls: string
    mls: string
  }
}

export const getBalances = createAsyncThunk(
  'account/getBalances',
  async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID)

    const memoContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, provider)
    const memoBalance = await memoContract.balanceOf(address)
    const timeContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, provider)
    const timeBalance = await timeContract.balanceOf(address)
    console.log('getBalances:', memoBalance, timeBalance)
    // const wmemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);
    // const wmemoBalance = await wmemoContract.balanceOf(address);
    // console.log("wmemoBalance:", wmemoBalance);

    return {
      balances: {
        smls: ethers.utils.formatUnits(memoBalance, 'gwei'),
        mls: ethers.utils.formatUnits(timeBalance, 'gwei'),
        // wmemo: ethers.utils.formatEther(wmemoBalance),
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
    mls: string
    smls: string
    wmemo: string
  }
  staking: {
    mls: number
    smls: number
  }
  wrapping: {
    smls: number
  }
}

export const loadAccountDetails = createAsyncThunk(
  'account/loadAccountDetails',
  async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let timeBalance = 0
    let memoBalance = 0

    let wmemoBalance = 0
    let memoWmemoAllowance = 0

    let stakeAllowance = 0
    let unstakeAllowance = 0

    let partners
    let profit = BigNumber.from(0)
    var totalProfit = 0
    let sonslice: ISonSlice[] = []
    let referral = ''
    let registered = false
    const addresses = getAddresses(networkID)

    if (addresses.OHM_ADDRESS) {
      console.log(addresses.OHM_ADDRESS)
      const timeContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, provider)
      timeBalance = await timeContract.balanceOf(address)
      stakeAllowance = await timeContract.allowance(address, addresses.STAKING_HELPER_ADDRESS)
    }
    if (addresses.sOHM_ADDRESS) {
      const memoContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, provider)
      memoBalance = await memoContract.balanceOf(address)
      console.log("memoBalance:", memoBalance)
      unstakeAllowance = await memoContract.allowance(address, addresses.STAKING_ADDRESS)

      // if (addresses.WMEMO_ADDRESS) {
      //     memoWmemoAllowance = await memoContract.allowance(address, addresses.WMEMO_ADDRESS);
      // }
    }
    // if (addresses.JESECO_ADDRESS) {
    //   const testContract = new ethers.Contract(addresses.JESECO_ADDRESS, TestContract, provider)
    //   referral = await testContract.referral(address)
    //   registered = await testContract.registered(address)
    //   partners = await testContract.partners(address)
    //   for (const son of partners) {
    //     profit = await testContract.totalProfit(son)
    //     console.log('profit:', profit.toNumber())
    //     sonslice.push({ address: son, profit: profit })
    //     totalProfit = totalProfit.add(profit)
    //   }
    //   console.log('totalProfit:', totalProfit.toNumber())
    // }


    // if (addresses.WMEMO_ADDRESS) {
    //     const wmemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);
    //     wmemoBalance = await wmemoContract.balanceOf(address);
    // }
    return {
      totalProfit: totalProfit,
      partners: sonslice,
      referral: referral,
      registered: registered,
      balances: {
        smls: ethers.utils.formatUnits(memoBalance, 'gwei'),
        mls: ethers.utils.formatUnits(timeBalance, 'gwei'),
        wmemo: ethers.utils.formatEther(wmemoBalance),
      },
      staking: {
        mls: Number(stakeAllowance),
        smls: Number(unstakeAllowance),
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

    interestDue = bondDetails.payout / Math.pow(10, 9)
    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastTime)
    pendingPayout = await bondContract.pendingPayoutFor(address)

    let allowance,
      balance = '0'

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID))
    console.log("address:",address)
    balance = await reserveContract.balanceOf(address)
    console.log("balance:",balance)

    const balanceVal = ethers.utils.formatEther(balance)

    const avaxBalance = await provider.getSigner().getBalance()
    const avaxVal = ethers.utils.formatEther(avaxBalance)

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, 'gwei')

    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: Number(balanceVal),
      avaxBalance: Number(avaxVal),
      interestDue,
      bondMaturationBlock,
      pendingPayout: Number(pendingPayoutVal),
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
    const tokenContract = new ethers.Contract(token.address, DaiTokenContract, provider)

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
    smls: string
    mls: string
    wmemo: string
  }
  loading: boolean
  partners: ISonSlice[]
  referral: string
  registered: boolean
  totalProfit: number
  staking: {
    mls: number
    smls: number
  }
  wrapping: {
    smls: number
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
  balances: { smls: '', mls: '', wmemo: '' },
  staking: { mls: 0, smls: 0 },
  wrapping: { smls: 0 },
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
