import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import GoogleConnectButton from '../components/GoogleConnectButton'
import { storage } from '../lib/storage'

const PRONOUNS = ['', 'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'ze/zir', 'any', 'ask me']
const ZODIAC = [
  { sign: 'Capricorn', symbol: '♑', emoji: '🐐', start: [12,22], end: [1,19] },
  { sign: 'Aquarius',  symbol: '♒', emoji: '🏺', start: [1,20],  end: [2,18] },
  { sign: 'Pisces',    symbol: '♓', emoji: '🐟', start: [2,19],  end: [3,20] },
  { sign: 'Aries',     symbol: '♈', emoji: '🐏', start: [3,21],  end: [4,19] },
  { sign: 'Taurus',    symbol: '♉', emoji: '🐂', start: [4,20],  end: [5,20] },
  { sign: 'Gemini',    symbol: '♊', emoji: '👯', start: [5,21],  end: [6,20] },
  { sign: 'Cancer',    symbol: '♋', emoji: '🦀', start: [6,21],  end: [7,22] },
  { sign: 'Leo',       symbol: '♌', emoji: '🦁', start: [7,23],  end: [8,22] },
  { sign: 'Virgo',     symbol: '♍', emoji: '🌾', start: [8,23],  end: [9,22] },
  { sign: 'Libra',     symbol: '♎', emoji: '⚖️', start: [9,23],  end: [10,22] },
  { sign: 'Scorpio',   symbol: '♏', emoji: '🦂', start: [10,23], end: [11,21] },
  { sign: 'Sagittarius',symbol:'♐', emoji: '🏹', start: [11,22], end: [12,21] },
  { sign: 'Capricorn', symbol: '♑', emoji: '🐐', start: [12,22], end: [12,31] },
]

function getZodiac(month: number, day: number) {
  return ZODIAC.find(z => {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    if (sm === em) return month === sm && day >= sd && day <= ed
    if (month === sm) return day >= sd
    if (month === em) return day <= ed
    return false
  })
}

const THEME_OPTS = [
  { value: 'dark' as const, label: 'Dark' },
  { value: 'light' as const, label: 'Light' },
  { value: 'system' as const, label: 'Auto' },
]

export default function Settings() {
  const { state, dispatch } = useApp()
  const { theme, setTheme } = useTheme()
  const s = state.settings

  function update(patch: Partial<typeof s>) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch })
  }

  function updateSocial(key: keyof typeof s.social, val: string) {
    update({ social: { ...s.social, [key]: val } })
  }

  const bMonth = parseInt(s.birthMonth) || 0
  const bDay = parseInt(s.birthDay) || 0
  const bYear = parseInt(s.birthYear) || 0
  const zodiac = bMonth && bDay ? getZodiac(bMonth, bDay) : null

  let age: number | null = null
  if (bYear && bMonth && bDay) {
    const now = new Date()
    age = now.getFullYear() - bYear
    if (now.getMonth() + 1 < bMonth || (now.getMonth() + 1 === bMonth && now.getDate() < bDay)) age--
  }

  function clearAllData() {
    if (!confirm('Clear all local app data? This cannot be undone. Your Google account will remain connected.')) return
    storage.clear()
    dispatch({ type: 'CLEAR_ALL_DATA' })
  }

  return (
    <div className="page-content">
      <h1 className="page-title" style={{ marginBottom: 24 }}>Settings</h1>

      {/* Profile */}
      <p className="section-label">PROFILE</p>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {state.profile?.picture && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={state.profile.picture} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{state.profile.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '2px 0 0' }}>{state.profile.email}</p>
            </div>
          </div>
        )}

        <div>
          <label className="input-label">Display name</label>
          <input className="input-field" value={s.displayName} onChange={e => update({ displayName: e.target.value })} placeholder="Your name" />
        </div>
        <div>
          <label className="input-label">Pronouns</label>
          <select className="input-field" value={s.pronouns} onChange={e => update({ pronouns: e.target.value })}>
            {PRONOUNS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Birthday</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" style={{ flex: 1 }} placeholder="MM" maxLength={2} value={s.birthMonth} onChange={e => update({ birthMonth: e.target.value.replace(/\D/g, '') })} />
            <input className="input-field" style={{ flex: 1 }} placeholder="DD" maxLength={2} value={s.birthDay} onChange={e => update({ birthDay: e.target.value.replace(/\D/g, '') })} />
            <input className="input-field" style={{ flex: 2 }} placeholder="YYYY" maxLength={4} value={s.birthYear} onChange={e => update({ birthYear: e.target.value.replace(/\D/g, '') })} />
          </div>
        </div>
      </div>

      {/* Zodiac / Age */}
      {zodiac && (
        <div className="card" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{zodiac.emoji}</span>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{zodiac.sign} {zodiac.symbol}</p>
            {age !== null && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{age} years old</p>}
          </div>
        </div>
      )}

      {/* Google Account */}
      <p className="section-label" style={{ marginTop: 24 }}>GOOGLE ACCOUNT</p>
      <div className="card">
        <GoogleConnectButton />

        {state.isGoogleConnected && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--border-subtle)' }}>
            <p className="input-label" style={{ marginBottom: 10 }}>CALENDAR</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Google Calendar events</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Days ahead:</span>
              {[7, 14, 30, 60].map(d => (
                <button key={d} onClick={() => update({ calendarDaysAhead: d })} style={{ padding: '3px 10px', borderRadius: 20, border: s.calendarDaysAhead === d ? 'none' : '0.5px solid var(--border)', background: s.calendarDaysAhead === d ? 'var(--accent-amethyst)' : 'transparent', color: s.calendarDaysAhead === d ? 'var(--bg)' : 'var(--text-ghost)', fontSize: 12, cursor: 'pointer' }}>{d}</button>
              ))}
            </div>

            <p className="input-label" style={{ marginTop: 14, marginBottom: 10 }}>TASKS</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Google Tasks</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={s.showGoogleTasks} onChange={e => update({ showGoogleTasks: e.target.checked })} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Appearance */}
      <p className="section-label" style={{ marginTop: 24 }}>APPEARANCE</p>
      <div className="card">
        <div style={{ display: 'flex', gap: 8 }}>
          {THEME_OPTS.map(opt => (
            <button key={opt.value} onClick={() => setTheme(opt.value)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: theme === opt.value ? '1.5px solid var(--accent-amethyst)' : '0.5px solid var(--border)', background: theme === opt.value ? 'var(--surface-raised)' : 'transparent', color: theme === opt.value ? 'var(--accent-amethyst)' : 'var(--text-ghost)', fontSize: 13, cursor: 'pointer' }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Social */}
      <p className="section-label" style={{ marginTop: 24 }}>SOCIAL</p>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(['instagram', 'twitter', 'tiktok', 'facebook', 'linkedin'] as const).map(platform => (
          <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-ghost)', width: 72, flexShrink: 0, textTransform: 'capitalize' }}>{platform}</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface-raised)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <span style={{ padding: '0 8px', fontSize: 13, color: 'var(--text-ghost)' }}>@</span>
              <input
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '8px 8px 8px 0', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
                placeholder={`your${platform}`}
                value={(s.social || {})[platform] || ''}
                onChange={e => updateSocial(platform, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* App / Danger zone */}
      <p className="section-label" style={{ marginTop: 24 }}>APP</p>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Timezone</span>
          <span style={{ fontSize: 12, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>{s.timezone}</span>
        </div>
        <button onClick={clearAllData} style={{ marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 10, border: '0.5px solid #e07070', background: 'transparent', color: '#e07070', fontSize: 13, cursor: 'pointer' }}>
          Clear all app data
        </button>
      </div>

      {/* About */}
      <p className="section-label" style={{ marginTop: 24 }}>ABOUT</p>
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text-primary)', margin: '0 0 4px' }}>Kieran's LifeTrkr</p>
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: 0, fontFamily: 'Space Mono, monospace' }}>v0.1.0 · MIT License</p>
        <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '8px 0 0' }}>Built on Father's Day, Summer Solstice 2026</p>
        <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '4px 0 0' }}>Jamie + Kieran Hill ✦</p>
        <p style={{ fontSize: 10, color: 'var(--text-ghost)', margin: '8px 0 0', fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em' }}>Ralph v0.0 · Vyrle v1.0 · Jamie v2.0 · Rylee v0.1.0</p>
      </div>

      <div style={{ height: 40 }} />
    </div>
  )
}
