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
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import MobileHeader from './components/MobileHeader'
import SideNav from './components/SideNav'
import ThemeToggle from './components/ThemeToggle'
import TokenExpiryBanner from './components/TokenExpiryBanner'
import Home from './pages/Home'
import Rituals from './pages/Rituals'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Today from './pages/Today'
import Someday from './pages/Someday'
import Settings from './pages/Settings'
import Origin from './pages/Origin'
import Footer from './components/Footer'
import { usePageTracking } from './hooks/usePageTracking'
import WelcomeScreen, { getWelcomeResetEventName, shouldShowWelcome } from './components/WelcomeScreen'

function AppShellContent() {
  usePageTracking()
  return (
    <>
      <TokenExpiryBanner />
      <div className="app-container">
        <SideNav />
        <div className="main-area">
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

  useEffect(() => {
    const handleWelcomeReset = () => setShowWelcome(true)
    const eventName = getWelcomeResetEventName()
    window.addEventListener(eventName, handleWelcomeReset)
    return () => window.removeEventListener(eventName, handleWelcomeReset)
  }, [])

  if (showWelcome) {
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
