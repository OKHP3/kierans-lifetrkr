/*
 * Kieran's LifeTrkr
 * ─────────────────
 * v3.0 — Kieran
 * v2.0 — Jamie
 * v1.0 — Vyrle
 * v0.0 — Ralph
 *
 * Built with love. The fourth Hill.
 */

import React, { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import SideNav from './components/SideNav.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import Home from './pages/Home.jsx'
import Rituals from './pages/Rituals.jsx'
import Habits from './pages/Habits.jsx'
import Calendar from './pages/Calendar.jsx'
import Today from './pages/Today.jsx'
import Archive from './pages/Archive.jsx'
import Settings from './pages/Settings.jsx'

const PAGES = {
  home: Home,
  rituals: Rituals,
  habits: Habits,
  calendar: Calendar,
  today: Today,
  archive: Archive,
  settings: Settings,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  const PageComponent = PAGES[activeTab] || Home

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="app-container">
          <SideNav active={activeTab} onTabChange={setActiveTab} />
          <div className="main-area">
            {activeTab !== 'settings' && <ThemeToggle />}
            <PageComponent onTabChange={setActiveTab} />
            <BottomNav active={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  )
}
