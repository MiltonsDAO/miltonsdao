import { useWeb3React } from '@web3-react/core'
import IDO from '../views/IDO'

const IDOPage = () => {
  const { account } = useWeb3React()

  return <IDO account={account}/>
}

export default IDOPage
