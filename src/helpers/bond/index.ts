import { Networks } from 'constants/blockchain'
import { LPBond } from './lp-bond'
import { StableBond } from './stable-bond'

import MimIcon from 'assets/tokens/MIM.svg'
import AvaxIcon from 'assets/tokens/AVAX.svg'
import MimTimeIcon from 'assets/tokens/TIME-MIM.svg'
import AvaxTimeIcon from 'assets/tokens/TIME-AVAX.svg'

import {
  StableBondContract,
  TestContract,
  LpBondContract,
  WavaxBondContract,
  StableReserveContract,
  LpReserveContract,
} from '../../abi'

export const usdt = new StableBond({
  name: 'USDT',
  displayName: 'USDT',
  bondToken: 'USDT',
  bondIconSvg: MimIcon,
  bondContractABI: StableBondContract,
  testContractABI: TestContract,
  reserveContractAbi: StableReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x29CEa51B5a6d7aDF16b375f31Cb56958cd19Eb95',
      reserveAddress: '0x55d398326f99059fF775485246999027B3197955',
    },
    [Networks.BSC_TESTNET]: {
      bondAddress: '0xce284f850a2A5393C5DBC9091D35c57a4Ef31038',
      reserveAddress: '0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c',
    },
    [Networks.AVAX_TESTNET]: {
      bondAddress: '0x39dE9c97cfE629e56fE4a6Ab95E48F6DbBc2F1f0',
      reserveAddress: '0x44f11408a784b981E1C9E4E07feEBBf6E5E01A3c',
    },
    [Networks.HARDHAT]: {
      bondAddress: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
      reserveAddress: '0xA388515Aeb4d8067470034a2561285f9C741C265',
    },
  },
  tokensInStrategy: '60500000000000000000000000',
})


export const usdtMLS = new LPBond({
  name: 'usdt_mls_lp',
  displayName: 'MLS-USDT LP',
  bondToken: 'USDT',
  bondIconSvg: MimTimeIcon,
  bondContractABI: LpBondContract,
  testContractABI: TestContract,
  reserveContractAbi: LpReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x46fF83f877153a554734199c0a4453BDC14316bE',
      reserveAddress: '0x9EBe39eC93D28b83298fCa61a6Ce0DD260A1314D',
    },
    [Networks.BSC_TESTNET]: {
      bondAddress: '0xa0621192e912c599A553c53A60b1c48f78D36f06',
      reserveAddress: '0xBC24d3D48991a61d4C93c8c6883da1CAf5259D64',
    },
    [Networks.AVAX_TESTNET]: {
      bondAddress: '0x82985685C9fD9a4f40Ae6B3e755075372262CEb3',
      reserveAddress: '0x329f06E35fFC02aBe8Af1fae78D2D1a821dC07FB',
    },
    [Networks.HARDHAT]: {
      bondAddress: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
      reserveAddress: '0xA388515Aeb4d8067470034a2561285f9C741C265',
    },
  },
  lpUrl:
    'https://bscscan.com/address/0x46fF83f877153a554734199c0a4453BDC14316bE#code',
})



export default [usdt, usdtMLS]
