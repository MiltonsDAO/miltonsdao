import { ethers } from 'ethers'
import { getAddresses } from 'constants/'
import { StakingHelperContract, TimeTokenContract, MemoTokenContract, StakingContract } from '../../abi'
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from './pending-txns-slice'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAccountSuccess, getBalances, loadAccountDetails, calculateUserTokenDetails } from './account-slice'
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Networks } from 'constants/blockchain'
import { warning, success, info, error } from '../../store/slices/messages-slice'
import { messages } from 'constants/messages'
import { getGasPrice } from 'helpers/get-gas-price'
import { metamaskErrorWrap } from 'helpers/metamask-error-wrap'
import { sleep } from 'helpers'
import useToast from 'hooks/useToast'
import { loadAppDetails, IAppSlice } from '../../store/slices/app-slice'
import { MaxUint256 } from '@ethersproject/constants'

interface IChangeApproval {
  token: string
  provider: StaticJsonRpcProvider | JsonRpcProvider
  address: string
  networkID: Networks
}

export const changeApproval = createAsyncThunk(
  'stake/changeApproval',
  async ({ token, provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
      console.log(messages.please_connect_wallet)
      dispatch(warning({ text: messages.please_connect_wallet }))
      return
    }
    const addresses = getAddresses(networkID)

    const signer = provider.getSigner()
    const mlsContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, signer)
    const smlsContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, signer)
    const newSMLSContract = new ethers.Contract(addresses.NEW_sOHM_ADDRESS, MemoTokenContract, signer)

    const newSMLSBalance = await newSMLSContract.balanceOf(address)

    let approveTx
    try {
      const gasPrice = await getGasPrice(provider)

      if (token === 'mls') {
        approveTx = await mlsContract.approve(addresses.NEW_STAKING_HELPER_ADDRESS, ethers.constants.MaxUint256)
      }

      if (token === 'smls') {
        const smlsBalance = await smlsContract.balanceOf(address)

        if (smlsBalance != 0) {
          const allowance = await smlsContract.allowance(address, addresses.STAKING_ADDRESS)
          if (allowance.eq(0)) {
            approveTx = await smlsContract.approve(addresses.STAKING_ADDRESS, ethers.constants.MaxUint256)
          }
        }
        const newAllowance = await newSMLSContract.allowance(address, addresses.NEW_STAKING_ADDRESS)
        if (newAllowance.eq(0)) {
          approveTx = await newSMLSContract.approve(addresses.NEW_STAKING_ADDRESS, ethers.constants.MaxUint256)
        }
      }

      const text = 'Approve ' + (token === 'mls' ? 'Staking' : 'Unstaking')
      const pendingTxnType = token === 'mls' ? 'approve_staking' : 'approve_unstaking'

      // dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }))
      await approveTx.wait()
      // dispatch(success({ text: messages.tx_successfully_send }))
    } catch (err: any) {
      return metamaskErrorWrap(err, dispatch)
    } finally {
      // if (approveTx) {
      //   dispatch(clearPendingTxn(approveTx.hash))
      // }
    }

    // await sleep(2)

    const stakeAllowance = await mlsContract.allowance(address, addresses.NEW_STAKING_HELPER_ADDRESS)
    let unstakeAllowance = await smlsContract.allowance(address, addresses.STAKING_ADDRESS)
    const newUnstakeAllowance = await newSMLSContract.allowance(address, addresses.NEW_STAKING_ADDRESS)
    if (newSMLSBalance != 0) {
      unstakeAllowance = newUnstakeAllowance
    }
    return dispatch(
      fetchAccountSuccess({
        staking: {
          mls: Number(stakeAllowance),
          timeStake: Number(stakeAllowance),
          memoUnstake: Number(unstakeAllowance),
        },
      }),
    )
  },
)

interface IChangeStake {
  action: string
  value: string
  provider: StaticJsonRpcProvider | JsonRpcProvider
  address: string
  networkID: Networks
}

export const changeStake = createAsyncThunk(
  'stake/changeStake',
  async ({ action, value, provider, address, networkID }: IChangeStake, { dispatch }) => {
    // const { toastError, toastWarning } = useToast()

    if (!provider) {
      console.log('warning', messages.please_connect_wallet)
      return
    }
    const addresses = getAddresses(networkID)
    const signer = provider.getSigner()
    const staking = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, signer)
    const stakingHelper = new ethers.Contract(addresses.STAKING_HELPER_ADDRESS, StakingHelperContract, signer)
    const mls = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, signer)

    const newStaking = new ethers.Contract(addresses.NEW_STAKING_ADDRESS, StakingContract, signer)
    const newStakingHelper = new ethers.Contract(addresses.NEW_STAKING_HELPER_ADDRESS, StakingHelperContract, signer)
    const smls = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, signer)
    const newSMLS = new ethers.Contract(addresses.NEW_sOHM_ADDRESS, MemoTokenContract, signer)

    const mlsBalance = await mls.balanceOf(address)

    const smlsBalance = await smls.balanceOf(address)

    const newSMLSBalance = await newSMLS.balanceOf(address)

    let stakeTx

    try {
      const gasPrice = await getGasPrice(provider)
      if (action === 'stake') {
        if (!mlsBalance.eq(0)) {
          stakeTx = await newStakingHelper.stake(ethers.utils.parseUnits(value, 'gwei'), address)
        } else {
          stakeTx = await stakingHelper.stake(ethers.utils.parseUnits(value, 'gwei'), address)
        }
      } else {
        if (!newSMLSBalance.eq(0)) {
          stakeTx = await newStaking.unstake(ethers.utils.parseUnits(value, 'gwei'), false)
        }
        if (!smlsBalance.eq(0)) {
          stakeTx = await staking.unstake(ethers.utils.parseUnits(value, 'gwei'), false)
        }
      }
      const pendingTxnType = action === 'stake' ? 'staking' : 'unstaking'
      await stakeTx.wait()

      dispatch(getBalances({ address, networkID, provider }))
      dispatch(loadAppDetails({ networkID, provider }))
    } catch (error: any) {
      console.log('changeStake:', error)
      return
    } finally {
    }

    return
  },
)
