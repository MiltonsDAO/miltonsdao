import { Networks } from 'constants/blockchain'
import { LPBond, CustomLPBond } from './lp-bond'
import { StableBond, CustomBond } from './stable-bond'

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

export const dai = new StableBond({
  name: 'USDT',
  displayName: 'USDT',
  bondToken: 'USDT',
  bondIconSvg: MimIcon,
  bondContractABI: StableBondContract,
  testContractABI: TestContract,
  reserveContractAbi: StableReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x0a5572622800fDF2F06B63BD8F4108F14902a38e',
      reserveAddress: '0x4aEeB8D61FEABC8695Db1831c03914DD94067120',
    },
    [Networks.BSC_TESTNET]: {
      bondAddress: '0x45F71Ce19Be285394361B6089A5D252ab1F3F19B',
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

// export const wavax = new CustomBond({
//     name: "wavax",
//     displayName: "wAVAX",
//     bondToken: "AVAX",
//     bondIconSvg: AvaxIcon,
//     bondContractABI: WavaxBondContract,
//     reserveContractAbi: StableReserveContract,
//     networkAddrs: {
//         [Networks.BSC]: {
//             bondAddress: "0xE02B1AA2c4BE73093BE79d763fdFFC0E3cf67318",
//             reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
//         },
//     },
//     tokensInStrategy: "756916000000000000000000",
// });

export const daiOHM = new LPBond({
  name: 'usdt_mls_lp',
  displayName: 'MLS-USDT LP',
  bondToken: 'USDT',
  bondIconSvg: MimTimeIcon,
  bondContractABI: LpBondContract,
  testContractABI: TestContract,
  reserveContractAbi: LpReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x0a5572622800fDF2F06B63BD8F4108F14902a38e',
      reserveAddress: '0x4aEeB8D61FEABC8695Db1831c03914DD94067120',
    },
    [Networks.BSC_TESTNET]: {
      bondAddress: '0xbF855DD1fe2516d2e963cc993cf5D6b5c2A8B35c',
      reserveAddress: '0x608Db5A4D978bbe2eF456C2B579dBB1764346c35',
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
    'https://testnet.bscscan.com/#/pool/',
})



export default [dai, daiOHM]
