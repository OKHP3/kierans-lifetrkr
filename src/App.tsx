/*
 * Kieran's LifeTrkr
 * ─────────────────
 * Built on Father's Day, Summer Solstice 2026.
 * Jamie + Kieran Hill.
 *
 * v3.0 — Kieran
 * v2.0 — Jamie
 * v1.0 — Vyrle
 * v0.0 — Ralph
 *
 * The fourth Hill. Pay it forward.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import BottomNav from './components/BottomNav'
import MobileHeader from './components/MobileHeader'
import SideNav from './components/SideNav'
import ThemeToggle from './components/ThemeToggle'
import TokenExpiryBanner from './components/TokenExpiryBanner'
import StorageWarning from './components/StorageWarning'
import Home from './pages/Home'
import Rituals from './pages/Rituals'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Today from './pages/Today'
import Someday from './pages/Someday'
import Settings from './pages/Settings'
import Origin from './pages/Origin'
import Privacy from './pages/Privacy'
import Footer from './components/Footer'
import { usePageTracking } from './hooks/usePageTracking'
import WelcomeScreen, { getWelcomeResetEventName, shouldShowWelcome } from './components/WelcomeScreen'
import { AppProvider } from './context/AppContext'

function AppShellContent() {
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  )

  usePageTracking()

  useEffect(() => {
    const updateNetworkStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  return (
    <>
      <TokenExpiryBanner />
      <StorageWarning />
      <div className="app-container">
        <SideNav />
        <div className="main-area">
          {isOffline && (
            <div className="offline-banner" role="status" aria-live="polite">
              Offline — local records remain available. Google sync is paused; optional
              online oracle wording will resume when you reconnect.
            </div>
          )}
          <MobileHeader />
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rituals" element={<Rituals />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/today" element={<Today />} />
            <Route path="/someday" element={<Someday />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/origin" element={<Origin />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
          <Footer />
          <BottomNav />
        </div>
      </div>
    </>
  )
}

function WelcomeGate({ children }: { children: ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome)
  const location = useLocation()

  useEffect(() => {
    const handleWelcomeReset = () => setShowWelcome(true)
    const eventName = getWelcomeResetEventName()
    window.addEventListener(eventName, handleWelcomeReset)
    return () => window.removeEventListener(eventName, handleWelcomeReset)
  }, [])

  // The privacy notice must be directly readable from its published URL,
  // including before a visitor has completed first-launch onboarding.
  if (showWelcome && location.pathname !== '/privacy') {
    return (
      <WelcomeScreen
        onDismiss={() => setShowWelcome(false)}
      />
    )
  }

  return <>{children}</>
}

function AppShell() {
  return (
    <ThemeProvider>
      <AppProvider>
        <WelcomeGate>
          <AppShellContent />
        </WelcomeGate>
      </AppProvider>
    </ThemeProvider>
  )
}
export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
