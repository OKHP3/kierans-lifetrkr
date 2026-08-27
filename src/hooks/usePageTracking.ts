import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare function gtag(...args: unknown[]): void

function resolveTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/':         'Home',
    '/rituals':  'Rituals',
    '/habits':   'Habits',
    '/calendar': 'Calendar',
    '/today':    'Today',
    '/someday':  'Someday',
    '/settings': 'Settings',
    '/privacy':  'Privacy',
  }
  for (const [prefix, label] of Object.entries(titles)) {
    if (pathname === prefix) return label
    if (prefix.endsWith('*') && pathname.startsWith(prefix.slice(0, -1))) return label
  }
  return pathname
}

export function usePageTracking(): void {
  const location = useLocation()
  useEffect(() => {
    if (typeof gtag !== 'function') return
    gtag('event', 'page_view', {
      page_path:     location.pathname,
      page_title:    resolveTitle(location.pathname),
      page_location: window.location.href,
    })
  }, [location.pathname])
}
