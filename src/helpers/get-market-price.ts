import { ethers } from 'ethers'
import { LpReserveContract } from '../abi'
import { usdtMLS } from './bond'
import { Networks } from 'constants/blockchain'

export async function getMarketPrice(
  networkID: Networks,
  provider: ethers.Signer | ethers.providers.Provider,
): Promise<number> {
  const daiOHMAddress = usdtMLS.getAddressForReserve(networkID)
  const pairContract = new ethers.Contract(daiOHMAddress, LpReserveContract, provider)
  const reserves = await pairContract.getReserves()
  console.log("reserve0:",reserves[0].toString(),reserves[1].toString())

  let marketPrice = reserves[1] / reserves[0]
  if (marketPrice < 1) {
    marketPrice = reserves[0] / reserves[1]
  }
  return marketPrice
}
