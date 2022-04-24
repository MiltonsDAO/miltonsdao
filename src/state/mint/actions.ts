import { createAction } from '@reduxjs/toolkit'

export enum Field {
  CURRENCY_A = 'PMLS',
  CURRENCY_B = 'USDT',
  INPUT='INPUT',
  OUTPUT='OUTPUT'
}

export const typeInput = createAction<{ field: Field; typedValue: string; noLiquidity: boolean }>('mint/typeInputMint')
export const resetMintState = createAction<void>('mint/resetMintState')
