import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { APP_VERSION } from '../constants'

const tabs = [
  { to: '/',          label: 'Home',     Icon: HomeIcon },
  { to: '/calendar',  label: 'Calendar', Icon: CalendarIcon },
  { to: '/today',     label: 'Today',    Icon: TodayIcon },
  { to: '/someday',   label: 'Someday',  Icon: SomedayIcon },
  { to: '/rituals',   label: 'Rituals',  Icon: RitualsIcon },
  { to: '/habits',    label: 'Habits',   Icon: HabitsIcon },
  { to: '/settings',  label: 'Settings', Icon: SettingsIcon },
]


export default function SideNav() {
  const { state } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const displayName = state.settings.displayName || state.profile?.name
  const pronouns = state.settings.pronouns
  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="side-nav">
      <div className="side-nav-logo">
        <span style={{ color: 'var(--accent-amethyst)', fontSize: 18, lineHeight: 1 }}>✦</span>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.2, letterSpacing: '0.04em' }}>Kieran's</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.1 }}>LifeTrkr</div>
          <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>personal life OS</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 10px', overflowY: 'auto' }}>
        {tabs.map(({ to, label, Icon }) => {
          const active = isActive(to)
          return (
            <NavLink key={to} to={to} end={to === '/'} className={`side-nav-item${active ? ' active' : ''}`}>
              <Icon active={active} />
              <span>{label}</span>
            </NavLink>
          )
        })}

        <div style={{ marginTop: 'auto', paddingTop: 16, paddingLeft: 6 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.08em', opacity: 0.6 }}>
            {APP_VERSION} · the fourth hill
          </div>
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {displayName && (
          <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {state.profile?.picture ? (
              <img src={state.profile.picture} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent-amethyst)', flexShrink: 0 }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              {pronouns && <div style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{pronouns}</div>}
            </div>
          </div>
        )}

        <div style={{ padding: '10px 14px 8px', borderTop: '0.5px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 9, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', opacity: 0.7, marginBottom: 6 }}>
            Agent Skills
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <a
              href="https://github.com/OKHP3/skillz/tree/main/lifetrkr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px', fontSize: 11, color: 'var(--text-ghost)', textDecoration: 'none', borderRadius: 4, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-amethyst)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-ghost)')}
            >
              <span style={{ fontSize: 13 }}>🧰</span>
              <span>LifeTrkr skills on GitHub</span>
              <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 10 }}>→</span>
            </a>
            <button
              onClick={() => navigate('/origin')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px', fontSize: 11, color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, textAlign: 'left', width: '100%', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-amethyst)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-ghost)')}
            >
              <span style={{ fontSize: 13 }}>🏛️</span>
              <span>Origin story</span>
              <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 10 }}>→</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '10px 14px 16px', borderTop: '0.5px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'var(--accent-amethyst)', opacity: 0.85, marginBottom: 6, letterSpacing: '0.02em' }}>
            OverKill Hill P³™
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { emoji: '🌐', label: 'overkillhill.com', href: 'https://overkillhill.com' },
              { emoji: '⌨️', label: 'github.com/OKHP3', href: 'https://github.com/OKHP3' },
              { emoji: '✉️', label: 'contact@overkillhill.com', href: 'mailto:contact@overkillhill.com' },
              { emoji: '☕', label: 'ko-fi.com/overkillhillp3', href: 'https://ko-fi.com/overkillhillp3' },
            ].map(({ emoji, label, href }) => (
              <a
                key={href}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 2px', fontSize: 10, color: 'var(--text-ghost)', textDecoration: 'none', borderRadius: 4, letterSpacing: '0.02em', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-amethyst)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-ghost)')}
              >
                <span style={{ fontSize: 11, flexShrink: 0 }}>{emoji}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function RitualsIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> }
function HabitsIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function CalendarIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function TodayIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg> }
function SomedayIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg> }
function SettingsIcon({ active }: { active: boolean }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
