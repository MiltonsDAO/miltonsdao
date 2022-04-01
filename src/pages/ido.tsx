import IDO from '../views/IDO'
import { useWeb3React } from '@web3-react/core'

const IDOPage = () => {
  const { account } = useWeb3React()

  return <IDO account={account}/>
}

export default IDOPage
