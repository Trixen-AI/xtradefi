import { useEffect } from 'react'
import { setPageMeta } from '@/lib/seo'
import { Route, Routes } from 'react-router'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient, wagmiAdapter } from './wallet/appkit'
import { DashLayout } from './components/Layout'
import Overview from './views/Overview'
import Markets from './views/Markets'
import MarketDetail from './views/MarketDetail'
import Trade from './views/Trade'
import Vault from './views/Vault'
import Positions from './views/Positions'
import './app.css'

/** /app: wallet providers live only here, so the website never loads them. */
export default function Dashboard() {
  useEffect(() => {
    setPageMeta({ title: 'App · QuiverFi', description: 'Connect an EVM wallet to write covered calls, sell puts, take binary positions and use the yield vault on Ethereum.', path: '/app', noindex: true })
    return () => setPageMeta({})
  }, [])
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<DashLayout />}>
            <Route index element={<Overview />} />
            <Route path="markets" element={<Markets />} />
            <Route path="markets/:ticker" element={<MarketDetail />} />
            <Route path="trade" element={<Trade />} />
            <Route path="vault" element={<Vault />} />
            <Route path="positions" element={<Positions />} />
            <Route path="*" element={<Overview />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
