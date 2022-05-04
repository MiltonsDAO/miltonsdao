import { ResetCSS } from '@pancakeswap/uikit'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import BigNumber from 'bignumber.js'
import GlobalCheckClaimStatus from 'components/GlobalCheckClaimStatus'
import FixedSubgraphHealthIndicator from 'components/SubgraphHealthIndicator'
import { ToastListener } from 'contexts/ToastsContext'
import useEagerConnect from 'hooks/useEagerConnect'
import { useInactiveListener } from 'hooks/useInactiveListener'
import useUserAgent from 'hooks/useUserAgent'
import useSentryUser from 'hooks/useSentryUser'
import { useApp } from "hooks/useApp"

import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState, useCallback, Fragment } from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { useStore, persistor, AppState,AppDispatch } from 'state'
import { usePollBlockNumber } from 'state/block/hooks'
import { NextPage } from 'next'
import { useWeb3React } from '@web3-react/core';
import { getBalances } from 'store/slices/account-slice'
import { useDispatch, useSelector } from 'react-redux'
import { Blocklist, Updaters } from '..'
import ErrorBoundary from '../components/ErrorBoundary'
import Menu from '../components/Menu'
import Providers from '../Providers'
import GlobalStyle from '../style/Global'
import "./ido.scss";
import "./index.scss";
import "./bond.scss";
import "./bondSettings.scss";
import "./zapin.scss";
import "./choose-token.scss";


// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 0,
})

function GlobalHooks() {
  usePollBlockNumber()
  useEagerConnect()
  // usePollCoreFarmData()
  useUserAgent()
  useInactiveListener()
  useSentryUser()
  const { account, chainId, library } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const { loadApp, loadAccount } = useApp()

  useEffect(() => {
    if (account) {
      loadApp()
      loadAccount()
      dispatch(getBalances({networkID: chainId, address:account, provider: library}))
    }
  }, [account])
  return null
}

function MyApp(props: AppProps) {
  const { pageProps } = props
  const store = useStore(pageProps.initialReduxState)

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1FC7D4" />
        <title>MiltonsDAO</title>
      </Head>
      <Providers store={store}>
        <Blocklist>
          <GlobalHooks />
          <Updaters />
          <ResetCSS />
          <GlobalStyle />
          <GlobalCheckClaimStatus excludeLocations={[]} />
          <PersistGate loading={null} persistor={persistor}>
            <App {...props} />
          </PersistGate>
        </Blocklist>
      </Providers>
    </>
  )
}

type NextPageWithLayout = NextPage & {
  Layout?: React.FC
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? ErrorBoundary : Fragment

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const Layout = Component.Layout || Fragment

  return (
    <ProductionErrorBoundary>
      <Menu>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Menu>
      <ToastListener />
      <FixedSubgraphHealthIndicator />
    </ProductionErrorBoundary>
  )
}

export default MyApp
