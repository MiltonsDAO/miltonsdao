import { Networks } from 'constants/blockchain'

export enum BondType {
  StableAsset,
  LP,
}

export interface BondAddresses {
  reserveAddress: string
  bondAddress: string
}

export interface NetworkAddresses {
  [Networks.BSC]: BondAddresses
  [Networks.BSC_TESTNET]: BondAddresses
  [Networks.AVAX_TESTNET]: BondAddresses
  [Networks.HARDHAT]: BondAddresses
}
