import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import GoogleConnectButton from '../components/GoogleConnectButton'
import { getMoonPhase, getAstroSeason, getMercuryStatus } from '../lib/celestial'
import { storage } from '../lib/storage'
import { APP_VERSION } from '../constants'
import type { ZodiacSign } from '../types'

const PRONOUNS = ['', 'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'ze/zir', 'any', 'ask me']

const ZODIAC_SIGNS: { sign: ZodiacSign; symbol: string; emoji: string }[] = [
  { sign: 'Capricorn',   symbol: '♑', emoji: '🐐' },
  { sign: 'Aquarius',    symbol: '♒', emoji: '🏺' },
  { sign: 'Pisces',      symbol: '♓', emoji: '🐟' },
  { sign: 'Aries',       symbol: '♈', emoji: '🐏' },
  { sign: 'Taurus',      symbol: '♉', emoji: '🐂' },
  { sign: 'Gemini',      symbol: '♊', emoji: '👯' },
  { sign: 'Cancer',      symbol: '♋', emoji: '🦀' },
  { sign: 'Leo',         symbol: '♌', emoji: '🦁' },
  { sign: 'Virgo',       symbol: '♍', emoji: '🌾' },
  { sign: 'Libra',       symbol: '♎', emoji: '⚖️' },
  { sign: 'Scorpio',     symbol: '♏', emoji: '🦂' },
  { sign: 'Sagittarius', symbol: '♐', emoji: '🏹' },
]

const ZODIAC_DATES: { sign: ZodiacSign; start: [number, number]; end: [number, number] }[] = [
  { sign: 'Capricorn',   start: [12,22], end: [1,19]  },
  { sign: 'Aquarius',    start: [1,20],  end: [2,18]  },
  { sign: 'Pisces',      start: [2,19],  end: [3,20]  },
  { sign: 'Aries',       start: [3,21],  end: [4,19]  },
  { sign: 'Taurus',      start: [4,20],  end: [5,20]  },
  { sign: 'Gemini',      start: [5,21],  end: [6,20]  },
  { sign: 'Cancer',      start: [6,21],  end: [7,22]  },
  { sign: 'Leo',         start: [7,23],  end: [8,22]  },
  { sign: 'Virgo',       start: [8,23],  end: [9,22]  },
  { sign: 'Libra',       start: [9,23],  end: [10,22] },
  { sign: 'Scorpio',     start: [10,23], end: [11,21] },
  { sign: 'Sagittarius', start: [11,22], end: [12,21] },
]

function getZodiacFromBirthday(month: number, day: number): ZodiacSign | null {
  const found = ZODIAC_DATES.find(z => {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    if (sm > em) return (month === sm && day >= sd) || (month === em && day <= ed)
    if (month === sm) return day >= sd
    if (month === em) return day <= ed
    return false
  })
  return found?.sign ?? null
}

const THEME_OPTS = [
  { value: 'dark'   as const, label: 'Dark'  },
  { value: 'light'  as const, label: 'Light' },
  { value: 'system' as const, label: 'Auto'  },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent-amethyst)' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  )
}

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
  const bDay   = parseInt(s.birthDay)   || 0
  const bYear  = parseInt(s.birthYear)  || 0

  const autoSign = bMonth && bDay ? getZodiacFromBirthday(bMonth, bDay) : null
  const zodiacInfo = ZODIAC_SIGNS.find(z => z.sign === (s.birthSign ?? autoSign))

  let age: number | null = null
  if (bYear && bMonth && bDay) {
    const now = new Date()
    age = now.getFullYear() - bYear
    if (now.getMonth() + 1 < bMonth || (now.getMonth() + 1 === bMonth && now.getDate() < bDay)) age--
  }

  // Celestial snapshot for the celestial info card
  const moon    = getMoonPhase()
  const season  = getAstroSeason()
  const mercury = getMercuryStatus()

  function clearAllData() {
    if (!confirm('Clear all local app data? This cannot be undone. Your Google account will remain connected.')) return
    storage.clear()
    dispatch({ type: 'CLEAR_ALL_DATA' })
  }

  return (
    <div className="page-content">
      <h1 className="page-title" style={{ marginBottom: 24 }}>Settings</h1>

      {/* ── Profile ────────────────────────────────────────────────────── */}
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
            <input className="input-field" style={{ flex: 1 }} placeholder="DD" maxLength={2} value={s.birthDay}   onChange={e => update({ birthDay: e.target.value.replace(/\D/g, '') })} />
            <input className="input-field" style={{ flex: 2 }} placeholder="YYYY" maxLength={4} value={s.birthYear} onChange={e => update({ birthYear: e.target.value.replace(/\D/g, '') })} />
          </div>
        </div>
      </div>

      {/* Zodiac / Age */}
      {zodiacInfo && (
        <div className="card" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{zodiacInfo.emoji}</span>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{zodiacInfo.sign} {zodiacInfo.symbol}</p>
            {age !== null && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{age} years old</p>}
          </div>
        </div>
      )}

      {/* ── Oracle & Celestial ─────────────────────────────────────────── */}
      <p className="section-label" style={{ marginTop: 24 }}>ORACLE & CELESTIAL</p>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Celestial snapshot */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-raised)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid var(--border-subtle)' }}>
            {moon.emoji} {moon.name}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-raised)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid var(--border-subtle)' }}>
            {season.emoji} {season.sign}
          </span>
          {mercury.retrograde && (
            <span style={{ fontSize: 12, color: '#f4a261', background: 'rgba(244,162,97,0.12)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid rgba(244,162,97,0.35)' }}>
              ☿ Rx until {mercury.endDate}
            </span>
          )}
        </div>

        {/* Oracle enabled */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Daily Oracle</p>
            <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '2px 0 0' }}>Tarot card + moon message each day</p>
          </div>
          <Toggle checked={s.oracleEnabled} onChange={v => update({ oracleEnabled: v })} />
        </div>

        {/* Mercury retrograde banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Mercury Rx banner</p>
            <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '2px 0 0' }}>Show warning when Mercury is retrograde</p>
          </div>
          <Toggle checked={s.showMercuryBanner} onChange={v => update({ showMercuryBanner: v })} />
        </div>

        {/* Moon phase on calendar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Moon phase on calendar</p>
            <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '2px 0 0' }}>Show moon emoji on calendar days</p>
          </div>
          <Toggle checked={s.showMoonPhaseOnCalendar} onChange={v => update({ showMoonPhaseOnCalendar: v })} />
        </div>

        {/* Birth sign override */}
        <div>
          <label className="input-label">Sun sign (for horoscope)</label>
          <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '0 0 8px' }}>
            {autoSign ? `Auto-detected: ${autoSign}` : 'Enter your birthday above or pick manually'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ZODIAC_SIGNS.map(z => {
              const active = s.birthSign === z.sign || (!s.birthSign && autoSign === z.sign)
              return (
                <button
                  key={z.sign}
                  onClick={() => update({ birthSign: s.birthSign === z.sign ? null : z.sign })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 20, border: active ? 'none' : '0.5px solid var(--border)',
                    background: active ? 'var(--accent-amethyst)' : 'transparent',
                    color: active ? 'var(--bg)' : 'var(--text-ghost)',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {z.emoji} {z.sign}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Google Account ─────────────────────────────────────────────── */}
      <p className="section-label" style={{ marginTop: 24 }}>GOOGLE ACCOUNT</p>
      <div className="card">
        <GoogleConnectButton />

        {state.isGoogleConnected && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="input-label" style={{ marginBottom: 4 }}>CALENDAR</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Google Calendar events</span>
              <Toggle checked={s.showGoogleCalendar} onChange={v => update({ showGoogleCalendar: v })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Days ahead:</span>
              {[7, 14, 30, 60].map(d => (
                <button key={d} onClick={() => update({ calendarDaysAhead: d })} style={{ padding: '3px 10px', borderRadius: 20, border: s.calendarDaysAhead === d ? 'none' : '0.5px solid var(--border)', background: s.calendarDaysAhead === d ? 'var(--accent-amethyst)' : 'transparent', color: s.calendarDaysAhead === d ? 'var(--bg)' : 'var(--text-ghost)', fontSize: 12, cursor: 'pointer' }}>{d}</button>
              ))}
            </div>

            <p className="input-label" style={{ marginTop: 6, marginBottom: 4 }}>TASKS</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show Google Tasks</span>
              <Toggle checked={s.showGoogleTasks} onChange={v => update({ showGoogleTasks: v })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show tasks due today</span>
              <Toggle checked={s.showTasksDueToday} onChange={v => update({ showTasksDueToday: v })} />
            </div>
          </div>
        )}
      </div>

      {/* ── Appearance ─────────────────────────────────────────────────── */}
      <p className="section-label" style={{ marginTop: 24 }}>APPEARANCE</p>
      <div className="card">
        <div style={{ display: 'flex', gap: 8 }}>
          {THEME_OPTS.map(opt => (
            <button key={opt.value} onClick={() => setTheme(opt.value)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: theme === opt.value ? '1.5px solid var(--accent-amethyst)' : '0.5px solid var(--border)', background: theme === opt.value ? 'var(--surface-raised)' : 'transparent', color: theme === opt.value ? 'var(--accent-amethyst)' : 'var(--text-ghost)', fontSize: 13, cursor: 'pointer' }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* ── Social ─────────────────────────────────────────────────────── */}
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

      {/* ── App / Danger zone ──────────────────────────────────────────── */}
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

      {/* ── About ──────────────────────────────────────────────────────── */}
      <p className="section-label" style={{ marginTop: 24 }}>ABOUT</p>
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text-primary)', margin: '0 0 4px' }}>Kieran's LifeTrkr</p>
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: 0, fontFamily: 'Space Mono, monospace' }}>{APP_VERSION} · MIT License</p>
        <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '8px 0 0' }}>Built on Father's Day, Summer Solstice 2026 ✦</p>
        <p style={{ fontSize: 10, color: 'var(--text-ghost)', margin: '8px 0 0', fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em' }}>
          Ralph · Vyrle · Jamie · Kieran
        </p>
      </div>

      <div style={{ height: 40 }} />
    </div>
  )
}
