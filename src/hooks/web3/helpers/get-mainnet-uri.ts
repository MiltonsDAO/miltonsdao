export const getMainnetURI = (mainnet): string => {
  if (mainnet == 56) {
    return 'https://icy-weathered-violet.bsc.quiknode.pro/0617462be53bb10061e99025fa2cd12893fb6efb/'
  } else if (mainnet == 97) {
    return 'https://data-seed-prebsc-1-s2.binance.org:8545/'
  } else if (mainnet == 31337){
    return "http://127.0.0.1:8545"
  }
}
