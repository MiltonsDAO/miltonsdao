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
  address: '0x8fE7bCA2ED58a7C5038c6FB5C75df9A003cB3693',
  decimals: 18,
}

const usdt: IToken = {
  name: 'USDT',
  address: '0x329f06E35fFC02aBe8Af1fae78D2D1a821dC07FB',
  img: '',
  decimals: 18,
}

const pmls: IToken = {
  name: 'PMLS',
  address: '0xEfF46346a988b1D80010702eb232Fc077EEfF452',
  img: '',
  decimals: 18,
}

export default [mls, usdt, pmls]
