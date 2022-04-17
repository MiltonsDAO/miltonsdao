import { SvgIcon } from '@material-ui/core'
import MimImg from 'assets/tokens/MIM.svg'
import { IAllBondData } from 'hooks/bonds'
import { dai } from './bond'

export const priceUnits = (bond: IAllBondData) => {
  // if (bond.name === dai.name)
  //   return <SvgIcon component={MimImg} viewBox="0 0 32 32" style={{ height: '15px', width: '15px' }} />

  return '$'
}
