import { useSelector, useDispatch } from "react-redux";
import useBonds from "../hooks/bonds";
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { AppDispatch, AppState } from '../state'
import { calcBondDetails } from "../store/slices/bond-slice";
import { loadAppDetails, IAppSlice } from "../store/slices/app-slice";
import { loadAccountDetails } from "../store/slices/account-slice";

export function useApp() {
    const { bonds } = useBonds();
    const dispatch = useDispatch<AppDispatch>()

    const {account, chainId, library } = useWeb3React()

    const loadAccount = useCallback(
        () => {
          dispatch(loadAccountDetails({ networkID: chainId, address:account, provider: library }))
        },
        [account],
      )
    const loadApp = useCallback(
        () => {
          dispatch(loadAppDetails({ networkID: chainId, provider: library }))
          bonds.map((bond) => {
            dispatch(calcBondDetails({ bond, value: null, provider: library, networkID: chainId }))
          })
          // tokens.map((token) => {
          //   dispatch(calculateUserTokenDetails({ address: '', token, networkID: chainId, provider }))
          // })
        },
        [account],
      )
    return {loadApp, loadAccount}
}