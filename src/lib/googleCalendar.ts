import type { CalendarEvent } from '../types'

export class GoogleApiError extends Error {
  constructor(
    message: string,
    readonly service: 'calendar' | 'tasks' | 'profile',
    readonly status: number,
  ) {
    super(message)
    this.name = 'GoogleApiError'
  }
}

export async function fetchCalendarEvents(
  token: string,
  daysAhead: number = 14,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): Promise<CalendarEvent[]> {
  const now = new Date().toISOString()
  const cutoff = new Date(Date.now() + Math.max(1, daysAhead) * 86400000).toISOString()

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', now)
  url.searchParams.set('timeMax', cutoff)
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '2500')
  url.searchParams.set('timeZone', timezone)

  const events: CalendarEvent[] = []
  let pageToken: string | undefined
  do {
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new GoogleApiError(`Calendar API error: ${res.status}`, 'calendar', res.status)
    const data = await res.json() as { items?: Record<string, unknown>[]; nextPageToken?: string }
    for (const item of data.items ?? []) {
      const start = item.start as Record<string, string> | undefined
      if (!item.id || !start?.dateTime && !start?.date) continue
      const end = item.end as Record<string, string> | undefined
      events.push({
        id: String(item.id),
        title: typeof item.summary === 'string' && item.summary ? item.summary : '(no title)',
        start: (start.dateTime || start.date)!,
        end: end?.dateTime || end?.date,
        allDay: !start.dateTime,
        location: typeof item.location === 'string' ? item.location : null,
        description: typeof item.description === 'string' ? item.description : null,
        colorId: typeof item.colorId === 'string' ? item.colorId : null,
        source: 'google',
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)

  return events
}

export async function createGoogleEvent(
  token: string,
  event: {
    title: string
    start: string
    end?: string
    allDay: boolean
    location?: string | null
    description?: string | null
  }
): Promise<string> {
  const body: Record<string, unknown> = {
    summary: event.title,
    ...(event.location ? { location: event.location } : {}),
    ...(event.description ? { description: event.description } : {}),
    start: event.allDay
      ? { date: event.start }
      : { dateTime: event.start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: event.allDay
      ? { date: event.end ?? event.start }
      : { dateTime: event.end ?? event.start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  }
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) throw new GoogleApiError(`Create event error: ${res.status}`, 'calendar', res.status)
  const data = await res.json()
  return data.id as string
}

export async function deleteGoogleEvent(token: string, googleEventId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new GoogleApiError(`Delete event error: ${res.status}`, 'calendar', res.status)
  }
}

export async function fetchGoogleProfile(token: string): Promise<{
  sub: string; name: string; email: string; picture: string
}> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new GoogleApiError(`Profile fetch error: ${res.status}`, 'profile', res.status)
  return res.json()
}
