import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const PRONOUN_OPTIONS = ['', 'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'ze/zir', 'any/all']
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const ZODIAC = [
  { sign: 'Aries',       symbol: '♈', emoji: '🐏', start: [3,21], end: [4,19] },
  { sign: 'Taurus',      symbol: '♉', emoji: '🐂', start: [4,20], end: [5,20] },
  { sign: 'Gemini',      symbol: '♊', emoji: '👯', start: [5,21], end: [6,20] },
  { sign: 'Cancer',      symbol: '♋', emoji: '🦀', start: [6,21], end: [7,22] },
  { sign: 'Leo',         symbol: '♌', emoji: '🦁', start: [7,23], end: [8,22] },
  { sign: 'Virgo',       symbol: '♍', emoji: '🌾', start: [8,23], end: [9,22] },
  { sign: 'Libra',       symbol: '♎', emoji: '⚖️', start: [9,23], end: [10,22] },
  { sign: 'Scorpio',     symbol: '♏', emoji: '🦂', start: [10,23], end: [11,21] },
  { sign: 'Sagittarius', symbol: '♐', emoji: '🏹', start: [11,22], end: [12,21] },
  { sign: 'Capricorn',   symbol: '♑', emoji: '🐐', start: [12,22], end: [1,19] },
  { sign: 'Aquarius',    symbol: '♒', emoji: '🏺', start: [1,20],  end: [2,18] },
  { sign: 'Pisces',      symbol: '♓', emoji: '🐟', start: [2,19],  end: [3,20] },
]

function getZodiacSign(month, day) {
  const m = parseInt(month)
  const d = parseInt(day)
  if (!m || !d) return null
  return ZODIAC.find(z => {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    if (sm <= em) return (m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)
    return (m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em
  }) || null
}

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram',  prefix: '@', placeholder: 'username' },
  { key: 'twitter',   label: 'Twitter / X', prefix: '@', placeholder: 'username' },
  { key: 'tiktok',    label: 'TikTok',      prefix: '@', placeholder: 'username' },
  { key: 'facebook',  label: 'Facebook',    prefix: '',  placeholder: 'profile name or URL' },
  { key: 'linkedin',  label: 'LinkedIn',    prefix: '',  placeholder: 'linkedin.com/in/…' },
]

const THEME_OPTIONS = [
  { value: 'dark',   icon: '🌙', label: 'Dark' },
  { value: 'light',  icon: '☀️', label: 'Light' },
  { value: 'system', icon: '💻', label: 'System' },
]

export default function Settings() {
  const { state, dispatch } = useApp()
  const { theme, setTheme } = useTheme()
  const profile = state.profile

  const set = (fields) => dispatch({ type: 'UPDATE_PROFILE', profile: fields })
  const setSocial = (fields) => dispatch({ type: 'UPDATE_SOCIAL', social: fields })

  const zodiac = getZodiacSign(profile.birthMonth, profile.birthDay)

  const currentYear = new Date().getFullYear()
  const age = profile.birthYear && profile.birthMonth && profile.birthDay
    ? currentYear - parseInt(profile.birthYear) - (
        new Date() < new Date(currentYear, parseInt(profile.birthMonth) - 1, parseInt(profile.birthDay)) ? 1 : 0
      )
    : null

  return (
    <div className="page-content">
      <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 24 }}>Settings</h1>

      {/* ── Profile ── */}
      <div className="section-header">Profile</div>

      <div className="card">
        <Field label="Display Name">
          <input
            type="text"
            placeholder="What should we call you?"
            value={profile.displayName}
            onChange={e => set({ displayName: e.target.value })}
          />
        </Field>

        <Field label="Pronouns">
          <select
            value={profile.pronouns}
            onChange={e => set({ pronouns: e.target.value })}
            style={{ width: '100%' }}
          >
            {PRONOUN_OPTIONS.map(p => (
              <option key={p} value={p}>{p || '— select —'}</option>
            ))}
          </select>
        </Field>

        <Field label="Birthday">
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={profile.birthMonth}
              onChange={e => set({ birthMonth: e.target.value })}
              style={{ flex: 2 }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i === 0 ? '' : String(i)}>{m || '— month —'}</option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Day"
              maxLength={2}
              value={profile.birthDay}
              onChange={e => set({ birthDay: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              style={{ flex: 1 }}
            />
          </div>
        </Field>

        <Field label="Birth Year">
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1995"
            maxLength={4}
            value={profile.birthYear}
            onChange={e => set({ birthYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          />
        </Field>

        <Field label="Email" last>
          <input
            type="text"
            inputMode="email"
            placeholder="you@example.com"
            value={profile.email}
            onChange={e => set({ email: e.target.value })}
          />
        </Field>
      </div>

      {/* ── Astrology ── */}
      {zodiac && (
        <>
          <div className="section-header">Astrology</div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>{zodiac.emoji}</div>
            <div>
              <div style={{ fontSize: 16, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontWeight: 600 }}>
                {zodiac.sign} {zodiac.symbol}
              </div>
              {age !== null && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'Space Mono, monospace' }}>
                  {age} years old
                </div>
              )}
            </div>
            {profile.pronouns && (
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent-amethyst)', background: 'var(--surface-raised)', padding: '3px 10px', borderRadius: 12 }}>
                {profile.pronouns}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Appearance ── */}
      <div className="section-header">Appearance</div>
      <div className="card">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Theme</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 10,
                border: theme === opt.value ? '1px solid var(--accent-amethyst)' : '1px solid var(--border)',
                background: theme === opt.value ? 'var(--surface-raised)' : 'transparent',
                color: theme === opt.value ? 'var(--accent-amethyst)' : 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 18 }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Social ── */}
      <div className="section-header">Social</div>
      <div className="card">
        {SOCIAL_FIELDS.map((field, i) => (
          <Field key={field.key} label={field.label} last={i === SOCIAL_FIELDS.length - 1}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {field.prefix && (
                <span style={{
                  padding: '10px 10px 10px 12px',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  fontSize: 13,
                  color: 'var(--text-ghost)',
                  lineHeight: 1,
                }}>
                  {field.prefix}
                </span>
              )}
              <input
                type="text"
                placeholder={field.placeholder}
                value={profile.social[field.key]}
                onChange={e => setSocial({ [field.key]: e.target.value })}
                style={{
                  borderRadius: field.prefix ? '0 10px 10px 0' : 10,
                  flex: 1,
                }}
              />
            </div>
          </Field>
        ))}
      </div>

      {/* ── About ── */}
      <div className="section-header">About</div>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>
          Kieran's LifeTrkr
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--text-ghost)', letterSpacing: '0.06em' }}>
          v3.0 · the fourth hill
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-ghost)', letterSpacing: '0.06em' }}>
          Ralph · Vyrle · Jamie · Kieran
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  )
}

function Field({ label, children, last }) {
  return (
    <div style={{
      marginBottom: last ? 0 : 14,
      paddingBottom: last ? 0 : 14,
      borderBottom: last ? 'none' : '0.5px solid var(--border-subtle)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
