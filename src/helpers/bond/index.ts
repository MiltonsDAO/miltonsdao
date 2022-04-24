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
      bondAddress: '0xCe23A6aEA3F54BeB2EA445df6fCE7B04656f35Cc',
      reserveAddress: '0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c',
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
      bondAddress: '0xFfC34E3Df624a8E2bFf445B173bf6fc45512Ac3D',
      reserveAddress: '0x5B53f0114a22D8cb2DfDbD0ffFa460dC7F96A940',
    },
  },
  lpUrl:
    'https://testnet.bscscan.com/#/pool/',
})



export default [dai, daiOHM]
