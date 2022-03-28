import {
  MenuItemsType,
  DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  NftIcon,
  NftFillIcon,
  MoreIcon,
  menuStatus,
} from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { nftsBaseUrl } from 'views/Nft/market/constants'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('IDO'),
    icon: EarnIcon,
    fillIcon: EarnFillIcon,
    href: '/ido',
    showItemsOnMobile: false,
    items: [
    
    ],
  },
  // {
  //   label: t('Mint'),
  //   href: '/mints',
  //   icon: EarnIcon,
  //   fillIcon: EarnFillIcon,
  //   items: [
      
  //   ],
  // },
 
  {
    label: 'Stake',
    href: '/stake',
    icon: NftIcon,
    fillIcon: NftFillIcon,
    items: [
    ],
  },
  {
    label: 'Honor',
    href: '/liquidity',
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    items: [
    ],
  },
]

export default config
