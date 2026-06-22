import { createContext, useContext, useState, useEffect } from 'react'

type ThemeValue = 'dark' | 'light' | 'system'

interface ThemeCtx {
  theme: ThemeValue
  setTheme: (t: ThemeValue) => void
  effectiveTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeCtx | null>(null)

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadThemePref(): ThemeValue {
  try { return (localStorage.getItem('lifetrkr_theme') as ThemeValue) || 'system' }
  catch { return 'system' }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>(loadThemePref)
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }, [effectiveTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: ThemeValue) => {
    setThemeState(t)
    try { localStorage.setItem('lifetrkr_theme', t) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
