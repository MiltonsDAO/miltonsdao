export const getMainnetURI = (mainnet): string => {
  if (mainnet == 56) {
    return 'https://bsc-dataseed.binance.org/'
  } else if (mainnet == 97) {
    return 'https://data-seed-prebsc-1-s2.binance.org:8545/'
  } else if (mainnet == 31337){
    return "http://127.0.0.1:8545"
  }
}
