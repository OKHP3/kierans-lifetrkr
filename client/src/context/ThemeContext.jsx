import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadThemePref() {
  try {
    return localStorage.getItem('lifetrkr_theme') || 'system'
  } catch {
    return 'system'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadThemePref)

  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }, [effectiveTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute(
        'data-theme',
        mq.matches ? 'dark' : 'light'
      )
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setAndSave = (t) => {
    setTheme(t)
    try { localStorage.setItem('lifetrkr_theme', t) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndSave, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
