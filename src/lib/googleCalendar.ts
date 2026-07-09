import type { CalendarEvent } from '../types'

export async function fetchCalendarEvents(
  token: string,
  daysAhead: number = 14
): Promise<CalendarEvent[]> {
  const now = new Date().toISOString()
  const cutoff = new Date(Date.now() + daysAhead * 86400000).toISOString()

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', now)
  url.searchParams.set('timeMax', cutoff)
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '50')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)

  const data = await res.json()

  return (data.items || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    title: (item.summary as string) || '(no title)',
    start: ((item.start as Record<string, string>)?.dateTime || (item.start as Record<string, string>)?.date) as string,
    end: ((item.end as Record<string, string>)?.dateTime || (item.end as Record<string, string>)?.date) as string | undefined,
    allDay: !(item.start as Record<string, string>)?.dateTime,
    location: (item.location as string) || null,
    description: (item.description as string) || null,
    colorId: (item.colorId as string) || null,
    source: 'google' as const,
  }))
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
  if (!res.ok) throw new Error(`Create event error: ${res.status}`)
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
    throw new Error(`Delete event error: ${res.status}`)
  }
}

export async function fetchGoogleProfile(token: string): Promise<{
  sub: string; name: string; email: string; picture: string
}> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Profile fetch error: ${res.status}`)
  return res.json()
}
