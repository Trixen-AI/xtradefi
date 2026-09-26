import { defineChain } from '@reown/appkit/networks'
import { NETWORK } from '@/config/network'

const rpc = import.meta.env.VITE_RPC_URL || NETWORK.rpcUrl

/** Robinhood Chain mainnet (Arbitrum Orbit L2, ETH gas). Multicall3 is deployed at the canonical address, so
 *  wagmi batches every read into one eth_call. */
export const robinhoodChain = defineChain({
  id: NETWORK.chainId,
  caipNetworkId: `eip155:${NETWORK.chainId}`,
  chainNamespace: 'eip155',
  name: NETWORK.name,
  nativeCurrency: { name: 'Ether', symbol: NETWORK.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
  blockExplorers: { default: { name: 'Blockscout', url: NETWORK.explorerUrl } },
  contracts: { multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11' } },
})

export const explorer = {
  address: (a: string) => `${NETWORK.explorerUrl}/address/${a}`,
  token: (a: string) => `${NETWORK.explorerUrl}/token/${a}`,
}
