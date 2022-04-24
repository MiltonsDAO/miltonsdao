import { useWeb3React } from '@web3-react/core'
import { LotteryStatus } from 'config/constants/types'
import usePreviousValue from 'hooks/usePreviousValue'
import { useEffect } from 'react'
import { useAppDispatch } from 'state'

const useStatusTransitions = () => {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const previousStatus = usePreviousValue(status)
  
}

export default useStatusTransitions
