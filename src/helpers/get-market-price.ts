import { ethers } from 'ethers'
import { LpReserveContract } from '../abi'
import { daiOHM } from './bond'
import { Networks } from 'constants/blockchain'

export async function getMarketPrice(
  networkID: Networks,
  provider: ethers.Signer | ethers.providers.Provider,
): Promise<number> {
  const daiOHMAddress = daiOHM.getAddressForReserve(networkID)
  const pairContract = new ethers.Contract(daiOHMAddress, LpReserveContract, provider)
  const reserves = await pairContract.getReserves()

  const marketPrice = reserves[0] / reserves[1]
  console.log('daiOHMAddress:', daiOHMAddress, 'reserves:', reserves, 'marketPrice:', marketPrice)

  return marketPrice
}
