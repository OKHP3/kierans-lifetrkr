/*
 * Kieran's LifeTrkr
 * ─────────────────
 * v0.1.0 — Kieran
 * v2.0 — Jamie
 * v1.0 — Virgil
 * v0.0 — Ralph
 *
 * Built with love on Father's Day, Summer Solstice 2026.
 * The fourth hill.
 */

import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import ThemeToggle from './components/ThemeToggle'
import TokenExpiryBanner from './components/TokenExpiryBanner'
import Home from './pages/Home'
import Rituals from './pages/Rituals'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Today from './pages/Today'
import Archive from './pages/Archive'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AppProvider>
          <TokenExpiryBanner />
          <div className="app-container">
            <SideNav />
            <div className="main-area">
              <ThemeToggle />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rituals" element={<Rituals />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/today" element={<Today />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
              <BottomNav />
            </div>
          </div>
        </AppProvider>
      </ThemeProvider>
    </HashRouter>
  )
}
