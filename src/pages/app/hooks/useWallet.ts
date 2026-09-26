import { useAccount } from 'wagmi'
import { robinhoodChain } from '../wallet/chain'

/** Account state from wagmi (works with or without AppKit initialised). */
export function useWallet() {
  const { address, isConnected, chainId, status } = useAccount()
  return {
    address,
    isConnected,
    onChain: isConnected && chainId === robinhoodChain.id,
    wrongChain: isConnected && chainId !== robinhoodChain.id,
    busy: status === 'connecting' || status === 'reconnecting',
  }
}
