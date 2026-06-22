import type { RoutineDayOfWeek } from '../types'
import { DAYS_OF_WEEK, SEASONAL_DATES, DAILY_QUOTES } from '../constants'

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDayOfWeek(): RoutineDayOfWeek {
  return DAYS_OF_WEEK[new Date().getDay()] as RoutineDayOfWeek
}

export function getDayOfWeekFull(date: Date = new Date()): RoutineDayOfWeek {
  return DAYS_OF_WEEK[date.getDay()] as RoutineDayOfWeek
}

export function getSeasonalBadge(): string | null {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return SEASONAL_DATES[`${mm}-${dd}`] || null
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getDailyQuote(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const doy = Math.floor(diff / 86400000)
  return DAILY_QUOTES[doy % DAILY_QUOTES.length]
}

export function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatEventTime(isoString: string, allDay: boolean): string {
  if (allDay) return 'All day'
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatEventDate(isoString: string, allDay: boolean): string {
  const date = allDay
    ? new Date(isoString + 'T00:00:00')
    : new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function isToday(isoDate: string): boolean {
  return isoDate === getTodayISO()
}

export function isTodayOrFuture(isoDate: string): boolean {
  return isoDate >= getTodayISO()
}
