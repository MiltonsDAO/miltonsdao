import { ethers } from 'ethers'
import { getAddresses } from 'constants/'
import { StakingHelperContract, TimeTokenContract, MemoTokenContract, StakingContract } from '../../abi'
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from './pending-txns-slice'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAccountSuccess, getBalances, loadAccountDetails, calculateUserTokenDetails} from './account-slice'
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Networks } from 'constants/blockchain'
import { warning, success, info, error } from '../../store/slices/messages-slice'
import { messages } from 'constants/messages'
import { getGasPrice } from 'helpers/get-gas-price'
import { metamaskErrorWrap } from 'helpers/metamask-error-wrap'
import { sleep } from 'helpers'
import useToast from 'hooks/useToast'
import { loadAppDetails, IAppSlice } from '../../store/slices/app-slice'

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
      dispatch(warning({ text: messages.please_connect_wallet }))
      return
    }
    const addresses = getAddresses(networkID)

    const signer = provider.getSigner()
    const mlsContract = new ethers.Contract(addresses.OHM_ADDRESS, TimeTokenContract, signer)
    const memoContract = new ethers.Contract(addresses.sOHM_ADDRESS, MemoTokenContract, signer)

    let approveTx
    try {
      const gasPrice = await getGasPrice(provider)

      if (token === 'mls') {
        approveTx = await mlsContract.approve(addresses.STAKING_HELPER_ADDRESS, ethers.constants.MaxUint256, {
          gasPrice,
        })
      }

      if (token === 'smls') {
        approveTx = await memoContract.approve(addresses.STAKING_ADDRESS, ethers.constants.MaxUint256, { gasPrice })
      }

      const text = 'Approve ' + (token === 'mls' ? 'Staking' : 'Unstaking')
      const pendingTxnType = token === 'mls' ? 'approve_staking' : 'approve_unstaking'

      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }))
      await approveTx.wait()
      dispatch(success({ text: messages.tx_successfully_send }))
    } catch (err: any) {
      return metamaskErrorWrap(err, dispatch)
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash))
      }
    }

    // await sleep(2)

    const stakeAllowance = await mlsContract.allowance(address, addresses.STAKING_HELPER_ADDRESS)
    const unstakeAllowance = await memoContract.allowance(address, addresses.STAKING_ADDRESS)

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
      dispatch(warning({ text: messages.please_connect_wallet }))
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
    console.log("mlsBalance:",mlsBalance.toString())

    const smlsBalance = await smls.balanceOf(address)
    console.log("smlsBalance:",smlsBalance)

    const newSMLSBalance = await newSMLS.balanceOf(address)
    console.log("newSMLSBalance:",newSMLSBalance)

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
        } else if (!smlsBalance.eq(0)){
          stakeTx = await staking.unstake(ethers.utils.parseUnits(value, 'gwei'), false)
        }
      }
      const pendingTxnType = action === 'stake' ? 'staking' : 'unstaking'
      // dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }))
      await stakeTx.wait()
      // dispatch(warning({ text: messages.tx_successfully_send }))
      console.log('warning', messages.tx_successfully_send)
    } catch (error: any) {
      // return toastError("error",err.message)
      console.log("changeStake:",error)
      // toastError("Error",  error?.data?.message)
      // return metamaskErrorWrap(err, dispatch)
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash))
      }
    }
    console.log('warning', messages.your_balance_update_soon)

    // await sleep(10)
    await dispatch(getBalances({ address, networkID, provider }))
    await dispatch(loadAppDetails({ networkID: networkID, provider: provider }))

    console.log('warning', messages.your_balance_updated)
    // toastInfo('Info', messages.your_balance_updated)
    return
  },
)
