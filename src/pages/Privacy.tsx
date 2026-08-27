import { Link } from 'react-router-dom'
import {
  GOOGLE_OAUTH_ORIGINS,
  GOOGLE_OAUTH_SCOPES,
  APP_VERSION,
  PRIVACY_URL,
  PUBLIC_APP_URL,
  SUPPORT_EMAIL,
} from '../constants'

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 26,
        fontWeight: 400,
        lineHeight: 1.2,
        color: 'var(--text-primary)',
        marginBottom: 12,
      }}>
        {title}
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: 'var(--text-secondary)',
        fontSize: 14,
        lineHeight: 1.7,
      }}>
        {children}
      </div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  )
}

export default function Privacy() {
  return (
    <main className="page-content">
      <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 24 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-ghost)',
            fontFamily: 'Space Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.08em',
            textDecoration: 'none',
            marginBottom: 28,
          }}
        >
          ← LifeTrkr
        </Link>

        <p className="section-label" style={{ marginTop: 0 }}>PRIVACY · {APP_VERSION}</p>
        <h1 className="page-title" style={{ fontSize: 'clamp(36px, 9vw, 52px)', marginBottom: 10 }}>
          Privacy, plainly.
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 18,
        }}>
          LifeTrkr is a client-side personal life OS. Your records live in your
          browser, not in a LifeTrkr publisher database. Google connection is
          optional, read-only, and happens directly between your browser and Google.
        </p>

        <div className="card" style={{
          borderColor: 'var(--accent-amethyst)',
          background: 'var(--surface-raised)',
          marginBottom: 4,
        }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            <strong>In short:</strong> LifeTrkr does not sell personal data, create a
            publisher account, or send your tasks, habits, calendar records, or profile
            to its optional oracle worker.
          </p>
        </div>

        <PolicySection title="What is stored">
          <p>
            LifeTrkr stores routines, routine completions, habits, habit completions,
            tasks, local calendar events, settings, and cached oracle content in your
            browser&apos;s <code>localStorage</code>. These records are namespaced by
            your Google subject when you connect Google, or by <code>guest</code> when
            you use the app without Google.
          </p>
          <p>
            When Google is connected, the app also stores the profile information
            needed to show the connection, such as your name, email, picture, and
            Google subject, in this browser. Google Calendar events, Google Tasks, and
            task lists are held in app memory while the connected session is active
            unless the browser or app explicitly caches them.
          </p>
          <p>
            Clearing this site&apos;s browser data can remove local records. Settings
            includes <strong>Clear all app data</strong> for the current local
            namespace. That action does not revoke Google access; use Disconnect and
            Google&apos;s account controls for that.
          </p>
        </PolicySection>

        <PolicySection title="Google access is read-only">
          <p>
            If you choose Connect Google Account, Google Identity Services grants a
            short-lived browser access token for these exact scopes:
          </p>
          <div className="card" style={{ margin: 0, fontFamily: 'Space Mono, monospace', fontSize: 11, lineHeight: 1.7 }}>
            {GOOGLE_OAUTH_SCOPES.map(scope => <div key={scope}>{scope}</div>)}
          </div>
          <p>
            The app uses those permissions to read Google Calendar events, read Google
            Tasks lists and tasks, and show the connected profile. It does not create,
            edit, complete, or delete Google Calendar events or Google Tasks. Manual
            records and local task actions stay in this browser.
          </p>
          <p>
            The access token is kept in browser <code>sessionStorage</code> and is sent
            only to Google APIs from the browser. The LifeTrkr publisher does not
            receive or store it. Disconnect clears the browser session token and
            requests token revocation through Google.
          </p>
        </PolicySection>

        <PolicySection title="Third-party browser services">
          <p>
            The app can contact third-party services from your browser. Their own
            privacy policies and network logs apply to those requests:
          </p>
          <BulletList items={[
            'Google Identity Services, Google Calendar, Google Tasks, and Google userinfo for optional account and read-only integration.',
            'Google Fonts for the app typefaces.',
            'Google Analytics for deployment page-view measurement when the analytics script is available. LifeTrkr sends the page path and title for that event, not your local records.',
            'tarotapi.dev for an optional daily tarot card and freehoroscopeapi.com for an optional horoscope based on the sun sign you select.',
          ]} />
          <p>
            Network services can see ordinary request information such as an IP
            address, browser information, and referrer according to their own
            policies. The app does not add your personal profile, tasks, habits, or
            calendar entries to tarot or horoscope requests.
          </p>
        </PolicySection>

        <PolicySection title="Oracle boundaries and fallback">
          <p>
            Tarot and celestial calculations work locally, and the tarot meaning is
            the fallback when an online service is unavailable. If the optional
            oracle worker is configured, it receives only the day, moon and season
            summary, tarot card meaning, Mercury status, and the optional sun sign
            you selected.
          </p>
          <p>
            Your name, email, picture, Google subject, routines, tasks, habits,
            calendar entries, and other profile records are not included in the
            oracle worker request. If the worker is missing, unavailable, rate-limited,
            or returns invalid data, LifeTrkr falls back to the local tarot meaning.
          </p>
        </PolicySection>

        <PolicySection title="Your choices">
          <BulletList items={[
            'Use LifeTrkr without connecting Google.',
            'Turn off Google Calendar, Google Tasks, or the Daily Oracle in Settings.',
            'Disconnect Google in Settings and revoke the grant from your Google account.',
            'Clear the app data in Settings or through your browser site-data controls.',
            'Block third-party requests with your browser settings, understanding that fonts, analytics, Google integration, and online oracle wording may then be unavailable.',
          ]} />
        </PolicySection>

        <PolicySection title="Contact and support">
          <p>
            For privacy questions, support, or a request about this app, email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent-amethyst)' }}>
              {SUPPORT_EMAIL}
            </a>
            . Include only the minimum detail needed. Do not send access tokens,
            passwords, or private Google records.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-ghost)' }}>
            This policy is published at{' '}
            <a href={PRIVACY_URL} style={{ color: 'var(--accent-amethyst)' }}>{PRIVACY_URL}</a>.
            The app homepage is <a href={PUBLIC_APP_URL} style={{ color: 'var(--accent-amethyst)' }}>{PUBLIC_APP_URL}</a>.
          </p>
        </PolicySection>

        <div className="card" style={{ marginTop: 36, fontSize: 12, color: 'var(--text-ghost)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Scope of this notice</strong>
          <p style={{ margin: '6px 0 0' }}>
            This notice describes the current {APP_VERSION} personal-use implementation.
            It is not a claim that Google OAuth production verification is complete,
            that the app has been approved for unrestricted public users, or that
            third-party providers guarantee availability.
          </p>
          <p style={{ margin: '8px 0 0' }}>
            Current authorized JavaScript origins are {GOOGLE_OAUTH_ORIGINS.join(' and ')}.
          </p>
        </div>
      </div>
    </main>
  )
}