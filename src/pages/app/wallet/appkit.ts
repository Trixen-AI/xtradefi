import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'
import { ethereumChain } from './chain'

/** Reown project ID from the environment. Without it the dashboard still reads chain data but cannot connect. */
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID?.trim() ?? ''
export const hasProjectId = projectId.length > 0

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [ethereumChain]

// ssr: true makes wagmi reconnect the stored wallet in an effect instead of during render, which otherwise
// triggers React's "cannot update a component while rendering a different component" warning.
export const wagmiAdapter = new WagmiAdapter({ networks, projectId: projectId || 'missing-project-id', ssr: true })

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2 } },
})

// Created once per app load, at module level (as Reown requires). Only real EVM wallets: no email, social,
// swaps or on-ramp. Note: the Reown dashboard's remote config can override these feature flags, so the same
// switches should be off in the project's dashboard settings too.
if (hasProjectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork: ethereumChain,
    projectId,
    metadata: {
      name: 'QuiverFi',
      description: 'On-chain options on tokenized stocks',
      url: window.location.origin,
      icons: [`${window.location.origin}/brand/logo-500.png`],
    },
    themeMode: 'dark',
    themeVariables: {
      '--apkt-accent': '#19e3a0',
      '--apkt-color-mix': '#0a0b0d',
      '--apkt-color-mix-strength': 20,
      '--apkt-font-family': "'Space Grotesk', Arial, sans-serif",
      '--apkt-border-radius-master': '2px',
      '--apkt-z-index': 1000,
    },
    features: { email: false, socials: false, swaps: false, onramp: false, send: false, history: false, analytics: false },
    defaultAccountTypes: { eip155: 'eoa' },
  })
}
