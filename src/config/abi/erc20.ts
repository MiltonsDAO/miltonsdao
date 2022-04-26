import { Interface } from '@ethersproject/abi'
import ERC20_ABI from './erc20.json'
import ERC20_BYTES32_ABI from './erc20_bytes32.json'
import PMLS_ABI from './pmls.json'
import MLS_ABI from './mls.json'

export const ERC20_INTERFACE = new Interface(ERC20_ABI)
export const PMLS_INTERFACE = new Interface(PMLS_ABI)
export const MLS_INTERFACE = new Interface(MLS_ABI)

const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI)

export { ERC20_ABI, ERC20_BYTES32_INTERFACE, ERC20_BYTES32_ABI }
