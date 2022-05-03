import { Networks } from './blockchain'

const BSC_MAINNET = {
  OHM_ADDRESS: '0x7027Be050ad3c6Bd0f8c77374aF102D7f2947903',
  USDT_ADDRESS: '0x55d398326f99059fF775485246999027B3197955',
  sOHM_ADDRESS: '0xfc987BB38e65b288EB260FA109f959338B88A14B',
  PMLS_ADDRESS: "0xAE8dC37e54c4F4FE9631f04e68778850eC9C92F1",

  TREASURY_ADDRESS: '0x80F86b7716203734dc98426A277eA14671C5Ced4',
  STAKING_ADDRESS: '0x23186E695EADb1E409082E03f4b76d187b6D34F7',
  STAKING_HELPER_ADDRESS: '0xab6266eA0D168018b1174A8ddcB465697C621E59',
  OHM_BONDING_CALC_ADDRESS: '0xFC9b21300F50C399da6dfC81cb18C6ee309701DF',
  ZAPIN_ADDRESS: '0x7C488C807eFD61929D2c330e949a06Cc638fC748',
  WMEMO_ADDRESS: '0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b',


}

const BSC_TESTNET = {
  PMLS_ADDRESS: "0xEfF46346a988b1D80010702eb232Fc077EEfF452",
  PMLSMigration_ADDRESS: "0x0536B6aB665deb1cea72ffeF2854bBa16D0e56bE",
  OHM_ADDRESS: "0x6728331F51627bA3F12958DAF5AFbEB17b6DcdBd",
  USDT_ADDRESS: "0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c",
  sOHM_ADDRESS: "0x65C203AE2A5fF50F4fb2c5E27a77f34C7A155C00",
  OHM_BONDING_CALC_ADDRESS: "0x10dDD250B91eF859ca7176C03aFe64671c1B10eC",
  TREASURY_ADDRESS: "0xE2fc271290cD587fbbe867a7965de796A1dAA6c1",
  STAKING_ADDRESS: "0x5C594735c0AD7422fE2D63D8dC7B0745A235564B",
  STAKING_HELPER_ADDRESS: "0x0095D997B9f9F33f3Cd8E735C1Df6355f1483db9",
  ZAPIN_ADDRESS: "0x7C488C807eFD61929D2c330e949a06Cc638fC748",
  WMEMO_ADDRESS: "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b",

}

const HARDHAT = {
  PMLS_ADDRESS: "0xEfF46346a988b1D80010702eb232Fc077EEfF452",

  OHM_ADDRESS: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  USDT_ADDRESS: "0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c",
  sOHM_ADDRESS: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  REFERRAL_ADDRESS: "0x4d40bc51f3BbDBB4826F71c3B11339F5fBBC044B",
  TREASURY_ADDRESS: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  STAKING_ADDRESS: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  STAKING_HELPER_ADDRESS: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
  OHM_BONDING_CALC_ADDRESS: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  ZAPIN_ADDRESS: "0x7C488C807eFD61929D2c330e949a06Cc638fC748",
  WMEMO_ADDRESS: "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b",
}
const AVAX_TESTNET = {
  PMLS_ADDRESS: "0xEfF46346a988b1D80010702eb232Fc077EEfF452",
  OHM_ADDRESS: "0x20aeDae6d129282f4dee895DB4499ed1cd851147",
  USDT_ADDRESS: "0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c",
  sOHM_ADDRESS: "0xA8fAe49d168DB58E81A54564313250D23B0400cD",
  REFERRAL_ADDRESS: "0x4d40bc51f3BbDBB4826F71c3B11339F5fBBC044B",
  TREASURY_ADDRESS: "0x5f74393BB31D437c44A4Ce615dE30B12EbF87781",
  STAKING_ADDRESS: "0x31BE4cE673Dd983fC9Fd91F80eAC54b4cB9CAB63",
  STAKING_HELPER_ADDRESS: "0xbb042194cCD02488073eb6CFCd581f0Bf67CC243",
  OHM_BONDING_CALC_ADDRESS: "0x1552fc71e90a0C297B582A45E328ac5bbA2A92a8",
  ZAPIN_ADDRESS: "0x7C488C807eFD61929D2c330e949a06Cc638fC748",
  WMEMO_ADDRESS: "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b",
}
export const getAddresses = (networkID: number) => {
  if (networkID === Networks.BSC) return BSC_MAINNET
  else if (networkID === Networks.BSC_TESTNET) return BSC_TESTNET
  else if (networkID === Networks.AVAX_TESTNET) return AVAX_TESTNET
  else if (networkID === Networks.HARDHAT) return HARDHAT
  throw Error("Network don't support")
}
