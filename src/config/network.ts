// Robinhood Chain parameters shared by the docs and the dashboard.
// Verified 2026-09-26 against the chain RPC and docs.robinhood.com/chain/connecting.
export const NETWORK = {
  name: 'Robinhood Chain',
  chainId: 4663,
  nativeSymbol: 'ETH',
  /** Public endpoint: rate-limited, fine for the app's reads. Override with VITE_RPC_URL for production traffic. */
  rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
  explorerUrl: 'https://robinhoodchain.blockscout.com',
}
