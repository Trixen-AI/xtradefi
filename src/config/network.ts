// Ethereum mainnet parameters shared by the docs and the dashboard.
// Verified 2026-10-08: eth_chainId = 0x1 and eth_call answered on the RPC below.
export const NETWORK = {
  name: 'Ethereum',
  chainId: 1,
  nativeSymbol: 'ETH',
  /** Public endpoint (publicnode): rate-limited, fine for the app's reads. Set VITE_RPC_URL for production traffic. */
  rpcUrl: 'https://ethereum-rpc.publicnode.com',
  explorerUrl: 'https://etherscan.io',
}
