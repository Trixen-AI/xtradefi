import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import Home from '@/pages/Home'

// Docs and the dashboard are separate chunks: the landing page never downloads wallet libraries.
const Docs = lazy(() => import('@/pages/docs/Docs'))
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))

/** Plain <a href="/..."> links stay semantic but navigate client-side. */
function useInternalLinks() {
  const navigate = useNavigate()
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href')
      if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target || a.hasAttribute('download')) return
      e.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])
}

/** New page, new scroll position (hash targets are handled by the page itself). */
function useScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
}

function RouteFallback() {
  return <div className="route-fallback" aria-busy="true" />
}

export default function App() {
  useInternalLinks()
  useScrollToTop()
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/app/*" element={<Dashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
