import type { RoutineDayOfWeek } from '../types'
import { DAYS_OF_WEEK, SEASONAL_DATES, DAILY_QUOTES } from '../constants'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

function datePartsInTimeZone(date: Date, timezone = DEFAULT_TIMEZONE): { year: number; month: number; day: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date)
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return { year: Number(value('year')), month: Number(value('month')), day: Number(value('day')), weekday: weekdays[value('weekday')] ?? 0 }
}

export function getTodayISO(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  const parts = datePartsInTimeZone(now, timezone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export function getDayOfWeek(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): RoutineDayOfWeek {
  return DAYS_OF_WEEK[datePartsInTimeZone(now, timezone).weekday] as RoutineDayOfWeek
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

export type RecurrenceFrequency =
  | 'none' | 'daily' | 'weekdays' | 'weekends' | 'specific_days'
  | 'weekly' | 'monthly' | 'custom'

export type SimpleRecurrencePattern = {
  frequency: RecurrenceFrequency
  daysOfWeek?: number[]  // 0=Sun…6=Sat
}

import type { RecurrenceRule } from '../types'

function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

const DAY_NUMBERS: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

/** Evaluate a stored recurrence rule against a calendar date without local-DST drift. */
export function recurrenceOccursOnDate(rule: RecurrenceRule | undefined, date: string): boolean {
  if (!rule || rule.frequency === 'none' || !rule.startDate || date < rule.startDate) return false
  if (rule.exceptions?.includes(date)) return false
  if (rule.end.mode === 'onDate' && date > rule.end.date) return false

  const interval = Math.max(1, Math.floor(rule.interval || 1))
  const start = new Date(dayNumber(rule.startDate))
  const current = new Date(dayNumber(date))
  const days = Math.round((current.getTime() - start.getTime()) / 86400000)
  let occurrenceIndex = -1

  if (rule.frequency === 'daily') {
    if (days % interval !== 0) return false
    occurrenceIndex = days / interval
  } else if (rule.frequency === 'weekly') {
    const selected = (rule.daysOfWeek ?? []).map(day => DAY_NUMBERS[day]).filter(day => day !== undefined)
    if (selected.length > 0) {
      if (!selected.includes(current.getUTCDay())) return false
      const weeks = Math.floor(days / 7)
      if (weeks % interval !== 0) return false
      const ordered = [...new Set(selected)].sort((a, b) => a - b)
      occurrenceIndex = Math.floor(weeks / interval) * ordered.length + ordered.indexOf(current.getUTCDay())
    } else {
      if (days % (7 * interval) !== 0) return false
      occurrenceIndex = days / (7 * interval)
    }
  } else if (rule.frequency === 'monthly') {
    const months = (current.getUTCFullYear() - start.getUTCFullYear()) * 12 + current.getUTCMonth() - start.getUTCMonth()
    const dayOfMonth = rule.dayOfMonth ?? start.getUTCDate()
    if (months < 0 || months % interval !== 0 || current.getUTCDate() !== dayOfMonth) return false
    occurrenceIndex = months / interval
  } else if (rule.frequency === 'yearly') {
    const years = current.getUTCFullYear() - start.getUTCFullYear()
    if (years < 0 || years % interval !== 0 || current.getUTCMonth() !== start.getUTCMonth() || current.getUTCDate() !== start.getUTCDate()) return false
    occurrenceIndex = years / interval
  } else {
    return false
  }

  return rule.end.mode !== 'afterCount' || (rule.end.count > 0 && occurrenceIndex < rule.end.count)
}

/** Returns true if a recurrence pattern is active on the given date (defaults to today). */
export function isActiveToday(
  pattern: SimpleRecurrencePattern,
  date: Date = new Date(),
): boolean {
  if (pattern.frequency === 'none') return false
  const day = date.getDay()
  switch (pattern.frequency) {
    case 'daily':         return true
    case 'weekdays':      return day >= 1 && day <= 5
    case 'weekends':      return day === 0 || day === 6
    case 'specific_days': return (pattern.daysOfWeek ?? []).includes(day)
    case 'weekly':
    case 'monthly':
    case 'custom':        return true
    default:              return false
  }
}
