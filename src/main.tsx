import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/sections.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
