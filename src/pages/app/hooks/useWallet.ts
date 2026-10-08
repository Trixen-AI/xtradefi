import { useAccount } from 'wagmi'
import { ethereumChain } from '../wallet/chain'

/** Account state from wagmi (works with or without AppKit initialised). */
export function useWallet() {
  const { address, isConnected, chainId, status } = useAccount()
  return {
    address,
    isConnected,
    onChain: isConnected && chainId === ethereumChain.id,
    wrongChain: isConnected && chainId !== ethereumChain.id,
    busy: status === 'connecting' || status === 'reconnecting',
  }
}
