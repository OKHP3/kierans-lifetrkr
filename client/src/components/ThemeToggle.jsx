import React from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function SystemIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
}

const OPTIONS = [
  { value: 'dark',   Icon: MoonIcon,   label: 'Dark' },
  { value: 'light',  Icon: SunIcon,    label: 'Light' },
  { value: 'system', Icon: SystemIcon, label: 'System' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-toggle-float" style={{
      position: 'fixed',
      top: 12,
      right: 'max(12px, calc(50% - 240px + 12px))',
      background: 'var(--surface-raised)',
      border: '0.5px solid var(--border)',
      borderRadius: 20,
      padding: '2px',
      gap: 1,
      zIndex: 150,
    }}>
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            title={label}
            onClick={() => setTheme(value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--accent-amethyst)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--text-ghost)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
