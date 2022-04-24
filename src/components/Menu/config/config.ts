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
 
  {
    label: 'Stake',
    href: '/stake',
    icon: NftIcon,
    fillIcon: NftFillIcon,
    showItemsOnMobile: false,
    items: [
    ],
  },
  {
    label: t('Mint'),
    href: '/mints',
    icon: EarnIcon,
    fillIcon: EarnFillIcon,
    showItemsOnMobile: false,
    items: [
      
    ],
  },
  {
    label: 'Honor',
    href: '/add/0x89e0ca90Fd8a3CAeF18c915A8E9b3afa591Ea075/0xc362B3ed5039447dB7a06F0a3d0bd9238E74d57c',
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    showItemsOnMobile: false,
    items: [
    ],
  },
]

export default config
