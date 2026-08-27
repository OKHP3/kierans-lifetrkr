import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Apply the saved preference before React mounts so returning light/system users
// do not see a dark-mode flash. A new browser intentionally starts dark.
try {
  const saved = localStorage.getItem('lifetrkr_theme')
  const theme = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark'
  const effective = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  document.documentElement.setAttribute('data-theme', effective)
} catch {
  document.documentElement.setAttribute('data-theme', 'dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
