import AvaxIcon from '../assets/tokens/AVAX.svg'


export interface IToken {
  name: string
  address: string
  img: string
  isAvax?: boolean
  decimals: number
}

export const mls: IToken = {
  name: 'MLS',
  isAvax: true,
  img: AvaxIcon,
  address: '0x7027Be050ad3c6Bd0f8c77374aF102D7f2947903',
  decimals: 9,
}

const usdt: IToken = {
  name: 'USDT',
  address: '0x55d398326f99059fF775485246999027B3197955',
  img: '',
  decimals: 18,
}

const pmls: IToken = {
  name: 'PMLS',
  address: '0x88BA9E740FF0d0Ca12123EE87695aC775bF69361',
  img: '',
  decimals: 18,
}

export default [mls, usdt, pmls]
