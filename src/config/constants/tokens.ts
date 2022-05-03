import { ChainId, Token } from '@pancakeswap/sdk'
import { serializeToken } from 'state/user/hooks/helpers'
import { CHAIN_ID } from './networks'
import { SerializedToken } from './types'

const { MAINNET, TESTNET } = ChainId

interface TokenList {
  [symbol: string]: Token
}

const defineTokens = <T extends TokenList>(t: T) => t

export const mainnetTokens = defineTokens({
  wbnb: new Token(
    MAINNET,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.com/',
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  pmls: new Token(MAINNET, '0x88BA9E740FF0d0Ca12123EE87695aC775bF69361', 18, 'PMLS', 'PMLS', 'https://www.binance.com/'),
  mls: new Token(MAINNET, '0x7027Be050ad3c6Bd0f8c77374aF102D7f2947903', 9, 'MLS', 'MLS', 'https://tether.to/'),
  cake: new Token(
    MAINNET,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  ),

  usdt: new Token(
    MAINNET,
    '0x55d398326f99059fF775485246999027B3197955',
    18,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
} as const)

// export const testnetTokens = defineTokens({
//   wbnb: new Token(
//     MAINNET,
//     '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
//     18,
//     'WBNB',
//     'Wrapped BNB',
//     'https://www.binance.com/',
//   ),
//   pmls: new Token(
//     TESTNET,
//     '0xEfF46346a988b1D80010702eb232Fc077EEfF452',
//     18,
//     'PMLS',
//     'Miltons Token',
//     'https://pancakeswap.finance/',
//   ),
//   mls: new Token(
//     TESTNET,
//     '0x1Ed57ecF983bC2b62153A0D7133F5438a7Ff76D4',
//     18,
//     'MLS',
//     'Miltons Token',
//     'https://pancakeswap.finance/',
//   ),
//   cake: new Token(
//     MAINNET,
//     '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
//     18,
//     'CAKE',
//     'PancakeSwap Token',
//     'https://pancakeswap.finance/',
//   ),
//   usdt: new Token(
//     TESTNET,
//     '0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c',
//     18,
//     'USDT',
//     'USDT Token',
//     'https://pancakeswap.finance/',
//   ),
// } as const)

const tokens = () => {
  const chainId = CHAIN_ID

  // If testnet - return list comprised of testnetTokens wherever they exist, and mainnetTokens where they don't
  if (parseInt(chainId, 10) === ChainId.MAINNET) {
    return Object.keys(mainnetTokens).reduce((accum, key) => {
      return { ...accum, [key]:  mainnetTokens[key] }
    }, {} as  typeof mainnetTokens)
  } 

  return mainnetTokens
}

const unserializedTokens = tokens()

type SerializedTokenList = Record<keyof typeof unserializedTokens, SerializedToken>

export const serializeTokens = () => {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: serializeToken(unserializedTokens[key]) }
  }, {} as SerializedTokenList)

  return serializedTokens
}

export default unserializedTokens
