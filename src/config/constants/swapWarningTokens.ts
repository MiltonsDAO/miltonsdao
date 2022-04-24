import { Token } from '@pancakeswap/sdk'
import tokens from 'config/constants/tokens'

const { pmls, mls, usdt } = tokens

interface WarningTokenList {
  [key: string]: Token
}

const SwapWarningTokens = <WarningTokenList>{
 
}

export default SwapWarningTokens
