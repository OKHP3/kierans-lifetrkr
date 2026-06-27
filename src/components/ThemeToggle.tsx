import { useTheme } from '../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'

const OPTIONS = [
  { value: 'dark' as const, label: 'Dark', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  { value: 'light' as const, label: 'Light', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
  { value: 'system' as const, label: 'System', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const onSettings = location.pathname === '/settings'

  return (
    <div
      className="theme-toggle-float"
      style={{
        position: 'fixed',
        top: 12,
        right: 14,
        background: 'var(--surface-raised)',
        border: '0.5px solid var(--border)',
        borderRadius: 20,
        padding: '3px 4px',
        alignItems: 'center',
        gap: 2,
        zIndex: 150,
      }}
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          title={label}
          onClick={() => setTheme(value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            background: theme === value ? 'var(--accent-amethyst)' : 'transparent',
            color: theme === value ? 'var(--bg)' : 'var(--text-ghost)',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          {icon}
        </button>
      ))}

      <div style={{ width: '0.5px', height: 16, background: 'var(--border)', margin: '0 3px', flexShrink: 0 }} />

      <button
        title="Settings"
        onClick={() => navigate(onSettings ? (-1 as any) : '/settings')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 16,
          border: 'none',
          cursor: 'pointer',
          background: onSettings ? 'var(--accent-amethyst)' : 'transparent',
          color: onSettings ? 'var(--bg)' : 'var(--text-ghost)',
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  )
}
