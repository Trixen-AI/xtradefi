import { useState } from 'react'
import type { Address } from 'viem'
import { useWatchAsset } from 'wagmi'
import { useWallet } from '../hooks/useWallet'

/** Asks the connected wallet to track a token (EIP-747 wallet_watchAsset). */
export function AddTokenButton({ address, symbol, decimals }: { address: Address; symbol: string; decimals: number }) {
  const { isConnected } = useWallet()
  const { watchAssetAsync, isPending } = useWatchAsset()
  const [state, setState] = useState<'idle' | 'added' | 'failed'>('idle')
  if (!isConnected) return null
  const label = state === 'added' ? 'Added' : state === 'failed' ? 'Not added' : 'Add to wallet'
  return (
    <button
      type="button"
      className="dbtn dbtn--ghost dbtn--sm"
      disabled={isPending || state === 'added'}
      onClick={async () => {
        try {
          const ok = await watchAssetAsync({ type: 'ERC20', options: { address, symbol, decimals } })
          setState(ok ? 'added' : 'failed')
        } catch {
          setState('failed')
        }
      }}
    >
      {isPending ? 'Check wallet…' : label}
    </button>
  )
}
