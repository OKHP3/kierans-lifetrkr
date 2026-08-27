import GoogleConnectButton from './GoogleConnectButton'

const WELCOME_KEY = 'lifetrkr:welcomed'
const WELCOME_RESET_EVENT = 'lifetrkr:welcome-reset'

function markWelcomeComplete() {
  try {
    localStorage.setItem(WELCOME_KEY, 'true')
  } catch {
    // The app can still continue when browser storage is unavailable.
  }
}

export function resetWelcome() {
  try {
    localStorage.removeItem(WELCOME_KEY)
  } catch {
    // The next clean load will still evaluate the available browser state.
  }
  window.dispatchEvent(new Event(WELCOME_RESET_EVENT))
}

export function getWelcomeResetEventName() {
  return WELCOME_RESET_EVENT
}

export function shouldShowWelcome(): boolean {
  try {
    if (localStorage.getItem(WELCOME_KEY) === 'true') return false

    const hasExistingLifeTrkrData = Object.keys(localStorage).some(key =>
      key.startsWith('lifetrkr:') &&
      key !== WELCOME_KEY &&
      !key.startsWith('lifetrkr:public:'),
    )

    return !hasExistingLifeTrkrData
  } catch {
    // If storage is blocked, keep the first-launch explanation available.
    return true
  }
}

export default function WelcomeScreen({ onDismiss }: { onDismiss: () => void }) {
  function continueAsGuest() {
    markWelcomeComplete()
    onDismiss()
  }

  return (
    <main className="welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-card">
        <div className="welcome-glyph" aria-hidden="true">✦</div>
        <p className="welcome-kicker">A quieter way to keep track</p>
        <h1 id="welcome-title">Kieran's LifeTrkr</h1>
        <p className="welcome-tagline">Your day. Your rituals. Your rules.</p>

        <div className="welcome-copy">
          <p>LifeTrkr is a personal, browser-based life OS for the small things that make a day yours.</p>
          <p>Your records stay in this browser. Google is optional and read-only, used only for Calendar and Tasks.</p>
        </div>

        <div className="welcome-actions">
          <GoogleConnectButton
            onComplete={() => {
              markWelcomeComplete()
              onDismiss()
            }}
          />
          <button className="welcome-guest" onClick={continueAsGuest}>
            Use without Google
          </button>
        </div>
      </div>
    </main>
  )
}
