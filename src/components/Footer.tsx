export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <span className="app-footer-copy">
        © {year} OverKill Hill P³™. All rights reserved.
      </span>
      <span className="app-footer-built">
        Built with{' '}
        <a
          href="https://replit.com/refer/overkillhillp3/"
          target="_blank"
          rel="noopener noreferrer"
          className="app-footer-replit"
        >
          Replit
        </a>
      </span>
    </footer>
  )
}
