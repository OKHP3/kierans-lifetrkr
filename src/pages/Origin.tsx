import { useNavigate } from 'react-router-dom'

export default function Origin() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      padding: '0 0 80px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-ghost)', fontSize: 13, letterSpacing: '0.08em',
            fontFamily: 'Space Mono, monospace', padding: 0, marginBottom: 40,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← back
        </button>

        <div style={{ marginBottom: 12 }}>
          <span style={{ color: 'var(--accent-amethyst)', fontSize: 28, lineHeight: 1 }}>✦</span>
        </div>

        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(38px, 8vw, 56px)',
          fontWeight: 300,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 8,
          letterSpacing: '-0.01em',
        }}>
          Origin Story
        </h1>

        <p style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 11,
          color: 'var(--accent-amethyst)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 48,
        }}>
          Father's Day · Summer Solstice · June 2026
        </p>

        <Section title="The Fourth Hill">
          <p>
            There's a thing that happens when a parent and a child sit down together and start asking
            "what would you actually use every day?" It cuts through every default assumption. No
            enterprise patterns. No vanity features. Just: what would help you live better?
          </p>
          <p>
            On the longest day of 2026 — Father's Day, the Summer Solstice — Jamie and Kieran (Rylee)
            Hill spent hours in that conversation. Bouncing ideas between Claude threads and ChatGPT
            sessions, scribbling on a Notion page, working out what a personal life OS should actually
            feel like for a real person in their real life.
          </p>
          <p>
            Jamie is the fourth Hill. The name carries weight — a lineage, a responsibility to pass
            something forward. Kieran is the reason this app exists in the form it does. The aesthetic,
            the warmth, the fact that it doesn't feel like productivity software — that's Kieran.
          </p>
        </Section>

        <Divider />

        <Section title="What We Were Trying to Solve">
          <p>
            Every life-tracking app Kieran had tried felt like it was built for someone else.
            Too clinical. Too gamified. Too focused on performance metrics when what was actually
            needed was a gentle structure for rituals, habits, and the day — something that felt
            more like a morning journal than a dashboard.
          </p>
          <p>
            The existing tools also lived in silos: a habit tracker over here, a calendar over
            there, tasks somewhere else, and nothing that understood that these things are all
            connected. Getting out of bed, making tea, going outside — these aren't just checkboxes.
            They're the texture of a life.
          </p>
          <p>
            So we decided to build one app that held all of it. One dark-mode, mobile-first,
            celestially-aware personal OS. Named it LifeTrkr. Kept it simple on purpose.
          </p>
        </Section>

        <Divider />

        <Section title="The Moonlit Hearth">
          <p>
            The aesthetic didn't come from a mood board. It came from a feeling — the warmth of
            candlelight against deep midnight blue. Stevie Nicks performing in velvet. The moment
            when a full moon rises and everything goes quiet.
          </p>
          <p>
            We called it <em>Moonlit Hearth</em>: warm and mystical, never cold or clinical.
            Amethyst as the accent color. Cormorant Garamond for the headers — a typeface
            that feels like it has something to say. DM Sans for the body, where clarity matters.
            Space Mono for the numbers and timestamps, because data should feel grounded.
          </p>
          <p>
            The celestial data — moon phases, astrological seasons, Mercury retrograde — aren't
            decorative. For Kieran, they're a real framework for understanding the rhythm of time.
            The app respects that.
          </p>
        </Section>

        <Divider />

        <Section title="How It Was Built">
          <p>
            The first versions were built by earlier members of the Hill family — Ralph started
            the concept (v0.0), Virgil built the first working thing (v1.0), Jamie took it to a
            full feature set (v2.0). Each version was a conversation across time.
          </p>
          <p>
            Kieran's version (v3.0) is a complete rewrite: TypeScript throughout, client-side
            Google authentication with no server required, GitHub Pages deployment, and a
            HashRouter that works everywhere. No database. No backend. Just localStorage and
            the browser — fast, private, and fully owned.
          </p>
          <p>
            The AI threads from that Father's Day are still open in Jamie's browser. The Notion
            page where we mapped out every feature still exists. This app is what came out of that
            day — messy, iterative, collaborative, and real.
          </p>
        </Section>

        <Divider />

        <Section title="Pay It Forward">
          <p>
            The name "the fourth hill" is a reminder. Jamie is the fourth. Kieran will be the
            fifth. The point was never to hoard knowledge — it was to build something and hand
            it on. The skills, the code, the aesthetic decisions — all open, all documented,
            all yours to fork.
          </p>
          <p>
            If you found this and it's useful, use it. If you're a parent and a child somewhere
            who spent a long afternoon building something together — that's the whole point.
            That's the origin.
          </p>
        </Section>

        <div style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: '0.5px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--accent-amethyst)' }}>
            OverKill Hill P³™
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>
            Built by Jamie Hill · Summer Solstice 2026
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'overkillhill.com', href: 'https://overkillhill.com' },
              { label: 'github.com/OKHP3', href: 'https://github.com/OKHP3' },
              { label: 'ko-fi.com/overkillhillp3', href: 'https://ko-fi.com/overkillhillp3' },
            ].map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 10,
                color: 'var(--accent-amethyst)',
                textDecoration: 'none',
                letterSpacing: '0.06em',
                opacity: 0.8,
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 26,
        fontWeight: 400,
        color: 'var(--text-primary)',
        marginBottom: 16,
        lineHeight: 1.2,
      }}>
        {title}
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        color: 'var(--text-secondary)',
        fontSize: 15,
        lineHeight: 1.75,
      }}>
        {children}
      </div>
    </section>
  )
}

function Divider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '40px 0',
      color: 'var(--accent-amethyst)',
      opacity: 0.4,
    }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-subtle)' }} />
      <span style={{ fontSize: 12 }}>✦</span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-subtle)' }} />
    </div>
  )
}
