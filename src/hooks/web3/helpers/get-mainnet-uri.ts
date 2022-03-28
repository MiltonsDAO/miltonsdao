export const getMainnetURI = (mainnet): string => {
  if (mainnet) {
    return 'https://bsc-dataseed4.ninicoin.io/'
  } else {
    return 'https://data-seed-prebsc-1-s2.binance.org:8545/'
  }
}
