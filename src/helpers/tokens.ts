import AvaxIcon from '../assets/tokens/AVAX.svg'
import AaveIcon from '../assets/tokens/AAVE.e.png'
import ApeXIcon from '../assets/tokens/Ape-X.png'
import ApeinIcon from '../assets/tokens/APEIN.png'
import BifiIcon from '../assets/tokens/BIFI.png'
import BlizzIcon from '../assets/tokens/BLIZZ.png'
import BnbIcon from '../assets/tokens/BNB.png'
import BoofiIcon from '../assets/tokens/BOOFI.png'
import ChartIcon from '../assets/tokens/CHART.png'
import DaiEIcon from '../assets/tokens/USDT.e.png'
import DreggIcon from '../assets/tokens/DREGG.png'
import EleIcon from '../assets/tokens/ELE.png'
import ElkIcon from '../assets/tokens/ELK.png'
import FraxIcon from '../assets/tokens/FRAX.png'
import GbIcon from '../assets/tokens/GB.png'
import HatIcon from '../assets/tokens/HAT.png'
import HuskyIcon from '../assets/tokens/HUSKY.png'
import IceIcon from '../assets/tokens/ICE.png'
import JoeIcon from '../assets/tokens/JOE.png'
import KloIcon from '../assets/tokens/KLO.png'
import LinkEIcon from '../assets/tokens/LINK.e.png'
import MainIcon from '../assets/tokens/MAI.png'
import MimIcon from '../assets/tokens/MIM.svg'
import MYakIcon from '../assets/tokens/mYAK.png'
import OliveIcon from '../assets/tokens/OLIVE.png'
import PefiIcon from '../assets/tokens/PEFI.png'
import PngIcon from '../assets/tokens/PNG.png'
import QiIcon from '../assets/tokens/QI.png'
import RelayIcon from '../assets/tokens/RELAY.png'
import SherpaIcon from '../assets/tokens/SHERPA.png'
import ShibxIcon from '../assets/tokens/SHIBX.png'
import SingIcon from '../assets/tokens/SING.png'
import SnobIcon from '../assets/tokens/SNOB.png'
import SpellIcon from '../assets/tokens/SPELL.png'
import SushiEIcon from '../assets/tokens/SUSHI.e.png'
import SynIcon from '../assets/tokens/SYN.png'
import TeddyIcon from '../assets/tokens/TEDDY.png'
import TimeIcon from '../assets/tokens/TIME.svg'
import TsdIcon from '../assets/tokens/TSD.png'
import UsdcEIcon from '../assets/tokens/USDC.e.png'
import UsdtEIcon from '../assets/tokens/USDT.e.png'
import VsoIcon from '../assets/tokens/VSO.png'
import WavaxIcon from '../assets/tokens/WAVAX.png'
import WBtcIcon from '../assets/tokens/WBTC.e.png'
import WetIcon from '../assets/tokens/WET.png'
import WethEIcon from '../assets/tokens/WETH.e.png'
import XavaIcon from '../assets/tokens/XAVA.png'
import YakIcon from '../assets/tokens/YAK.png'

export interface IToken {
  name: string
  address: string
  img: string
  isAvax?: boolean
  decimals: number
}

export const avax: IToken = {
  name: 'AVAX',
  isAvax: true,
  img: AvaxIcon,
  address: '0xE8f92E15e97F3F475B3563069ED239B6AC2532B5',
  decimals: 18,
}

const dai: IToken = {
  name: 'USDT.e',
  address: '0xd35864a288dca894b3aa9009F4CF7848520bF781',
  img: '',
  decimals: 18,
}

const frax: IToken = {
  name: 'FRAX',
  address: '0x5dAFbe5488bb7d6118812e4fca2466e7cB112AdA',
  img: '',
  decimals: 18,
}

export default [avax, dai, frax]
