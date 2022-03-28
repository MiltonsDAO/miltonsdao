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
  name: 'dai',
  displayName: 'USDT',
  bondToken: 'USDT',
  bondIconSvg: MimIcon,
  bondContractABI: StableBondContract,
  testContractABI: TestContract,
  reserveContractAbi: StableReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x635763D7952A48257D12FE2e1461a0BFC27b5541',
      reserveAddress: '0xa76cfDbEdF7883428B0e847AC354DeBA21B58CfC',
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
  name: 'dai_ohm_lp',
  displayName: 'PMIL-USDT LP',
  bondToken: 'USDT',
  bondIconSvg: MimTimeIcon,
  bondContractABI: LpBondContract,
  testContractABI: TestContract,
  reserveContractAbi: LpReserveContract,
  networkAddrs: {
    [Networks.BSC]: {
      bondAddress: '0x635763D7952A48257D12FE2e1461a0BFC27b5541',
      reserveAddress: '0x3a5beff5ae20fc1170b508c48849bda10af715e1',
    },
  },
  lpUrl:
    'https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3',
})

// export const avaxTime = new CustomLPBond({
//     name: "avax_time_lp",
//     displayName: "PMIL-AVAX LP",
//     bondToken: "AVAX",
//     bondIconSvg: AvaxTimeIcon,
//     bondContractABI: LpBondContract,
//     reserveContractAbi: LpReserveContract,
//     networkAddrs: {
//         [Networks.BSC]: {
//             bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
//             reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
//         },
//     },
//     lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
// });

export default [dai, daiOHM]
