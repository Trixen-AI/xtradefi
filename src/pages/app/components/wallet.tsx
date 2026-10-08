import { useAppKit } from '@reown/appkit/react'
import { useBalance, useSwitchChain } from 'wagmi'
import { useWallet } from '../hooks/useWallet'
import { ethereumChain } from '../wallet/chain'
import { hasProjectId } from '../wallet/appkit'
import { fmtNum, shortAddr } from '../lib/format'

// AppKit hooks may only run after createAppKit(), i.e. when a project ID is configured. These components are
// rendered through the wrappers below, which pick a no-project fallback otherwise.

function AppKitAccountButton() {
  const { open } = useAppKit()
  const { address, isConnected, busy } = useWallet()
  const eth = useBalance({ address, chainId: ethereumChain.id, query: { enabled: !!address, refetchInterval: 30_000 } })
  if (!isConnected) {
    return (
      <button type="button" className="dbtn dbtn--primary" onClick={() => open({ view: 'Connect', namespace: 'eip155' })} disabled={busy}>
        {busy ? 'Connecting…' : 'Connect wallet'}
      </button>
    )
  }
  return (
    <button type="button" className="dwallet" onClick={() => open({ view: 'Account' })} aria-label="Wallet account">
      <span className="dwallet__dot" aria-hidden="true" />
      <span className="dwallet__addr">{shortAddr(address)}</span>
      <span className="dwallet__bal">{eth.data ? `${fmtNum(Number(eth.data.value) / 1e18, 4)} ETH` : '…'}</span>
    </button>
  )
}

function AppKitConnectCta({ label = 'Connect wallet', className = '' }: { label?: string; className?: string }) {
  const { open } = useAppKit()
  return (
    <button type="button" className={`dbtn dbtn--primary ${className}`} onClick={() => open({ view: 'Connect', namespace: 'eip155' })}>
      {label}
    </button>
  )
}

function MissingProjectButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" className={`dbtn ${className}`} disabled title="Set VITE_REOWN_PROJECT_ID to enable wallet connection">
      Wallet setup needed
    </button>
  )
}

export function AccountButton() {
  return hasProjectId ? <AppKitAccountButton /> : <MissingProjectButton />
}

export function ConnectCta(props: { label?: string; className?: string }) {
  return hasProjectId ? <AppKitConnectCta {...props} /> : <MissingProjectButton className={props.className} />
}

export function SwitchChainButton({ className = '' }: { className?: string }) {
  const { switchChain, isPending } = useSwitchChain()
  return (
    <button type="button" className={`dbtn dbtn--primary ${className}`} disabled={isPending} onClick={() => switchChain({ chainId: ethereumChain.id })}>
      {isPending ? 'Check your wallet…' : `Switch to ${ethereumChain.name}`}
    </button>
  )
}
