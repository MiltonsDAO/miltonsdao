import { useWeb3React } from '@web3-react/core'
import Stake from '../views/Stake'

const StakePage = () => {
  const { account } = useWeb3React()
  return <Stake account={account}/>
  // return <Stake />
}

export default StakePage
