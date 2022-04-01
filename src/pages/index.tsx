import { FACTORY_ADDRESS } from '@pancakeswap/sdk'
import { getUnixTime, sub } from 'date-fns'
import { gql } from 'graphql-request'
import { GetStaticProps } from 'next'
import { SWRConfig } from 'swr'
import { DeBankTvlResponse } from 'hooks/api'
import { bitQueryServerClient, infoServerClient } from 'utils/graphql'
import { getBlocksFromTimestamps } from 'views/Info/hooks/useBlocksFromTimestamps'
import Home from '../views/Home'
import IDO from '../views/IDO'
import AddLiquidity from '../views/AddLiquidity'
import Pool from '../views/Pool'
import { useWeb3React } from '@web3-react/core'

const IndexPage = () => {
  const { account } = useWeb3React()

  return <IDO account={account} />
}

export default IndexPage
