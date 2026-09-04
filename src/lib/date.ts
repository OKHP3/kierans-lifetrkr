import type {
  RecurrenceRule,
  RoutineDayOfWeek,
  RoutineItem,
  RoutineSchedulePreviewDate,
  RoutineTemplate,
} from '../types'
import { DAYS_OF_WEEK, SEASONAL_DATES, DAILY_QUOTES } from '../constants'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

/** Return whether a value is a usable IANA timezone for Intl date formatting. */
export function isValidTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== 'string' || !timezone) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format()
    return true
  } catch {
    return false
  }
}

/** Recover invalid persisted timezone values without allowing date views to throw. */
export function normalizeTimezone(timezone: unknown): string {
  return isValidTimezone(timezone) ? timezone : getDetectedTimezone()
}

/** Common IANA zones for users who want to override the browser default. */
export const PRACTICAL_TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const

export function getDetectedTimezone(): string {
  return isValidTimezone(DEFAULT_TIMEZONE) ? DEFAULT_TIMEZONE : 'UTC'
}

/** Include the browser zone and a saved zone even when they are not in the common list. */
export function getTimezoneOptions(currentTimezone?: string): string[] {
  return [...new Set([
    getDetectedTimezone(),
    isValidTimezone(currentTimezone) ? currentTimezone : undefined,
    ...PRACTICAL_TIMEZONES,
  ].filter((timezone): timezone is string => Boolean(timezone)))]
}

export type CalendarDateParts = {
  year: number
  month: number
  day: number
  weekday: number
}

export function getCalendarDateParts(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

function datePartsInTimeZone(date: Date, timezone = DEFAULT_TIMEZONE): CalendarDateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: normalizeTimezone(timezone),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date)
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return { year: Number(value('year')), month: Number(value('month')), day: Number(value('day')), weekday: weekdays[value('weekday')] ?? 0 }
}

/** Return the configured timezone's calendar date for an instant. */
export function getTodayISO(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  const parts = datePartsInTimeZone(now, timezone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

/** Return the configured timezone's weekday for an instant. */
export function getDayOfWeek(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): RoutineDayOfWeek {
  return DAYS_OF_WEEK[datePartsInTimeZone(now, timezone).weekday] as RoutineDayOfWeek
}

/** Return the weekday for a stored calendar date without host-timezone conversion. */
export function getDayOfWeekForDate(date: string): RoutineDayOfWeek {
  return DAYS_OF_WEEK[weekdayNumber(date)] as RoutineDayOfWeek
}

export function getSeasonalBadge(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): string | null {
  const date = getTodayISO(timezone, now)
  const [, month, day] = date.split('-')
  const mm = month
  const dd = day
  return SEASONAL_DATES[`${mm}-${dd}`] || null
}

export function getGreeting(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: normalizeTimezone(timezone),
    hour: 'numeric',
    hour12: false,
  }).format(now))
  const h = hour === 24 ? 0 : hour
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getDailyQuote(timezone = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  const date = getTodayISO(timezone, now)
  const [year] = date.split('-').map(Number)
  const doy = calendarDayDifference(`${year}-01-01`, date)
  return DAILY_QUOTES[doy % DAILY_QUOTES.length]
}

/** Format a stored calendar date using UTC only as a neutral calendar renderer. */
export function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(calendarDateToUTC(isoDate))
}

function formatClock(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

function hasExplicitTimezone(isoString: string): boolean {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoString)
}

export function formatEventTime(
  isoString: string,
  allDay: boolean,
  timezone = DEFAULT_TIMEZONE,
): string {
  if (allDay) return 'All day'
  if (!hasExplicitTimezone(isoString)) {
    const match = isoString.match(/T(\d{2}):(\d{2})/)
    if (match) return formatClock(Number(match[1]), Number(match[2]))
  }
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: normalizeTimezone(timezone),
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatEventDate(
  isoString: string,
  allDay: boolean,
  timezone = DEFAULT_TIMEZONE,
): string {
  const date = allDay || !hasExplicitTimezone(isoString)
    ? calendarDateToUTC(getCalendarDate(isoString, timezone))
    : new Date(isoString)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: allDay || !hasExplicitTimezone(isoString) ? 'UTC' : normalizeTimezone(timezone),
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function isToday(isoDate: string, timezone = DEFAULT_TIMEZONE, now: Date = new Date()): boolean {
  return isoDate === getTodayISO(timezone, now)
}

export function isTodayOrFuture(isoDate: string, timezone = DEFAULT_TIMEZONE, now: Date = new Date()): boolean {
  return isoDate >= getTodayISO(timezone, now)
}

export type RecurrenceFrequency =
  | 'none' | 'daily' | 'weekdays' | 'weekends' | 'specific_days'
  | 'weekly' | 'monthly' | 'yearly' | 'custom'

export type SimpleRecurrencePattern = {
  frequency: RecurrenceFrequency
  daysOfWeek?: number[]  // 0=Sun…6=Sat
}

function calendarDateToUTC(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function weekdayNumber(date: string): number {
  return calendarDateToUTC(date).getUTCDay()
}

export function calendarDayDifference(start: string, end: string): number {
  return Math.round((calendarDateToUTC(end).getTime() - calendarDateToUTC(start).getTime()) / 86400000)
}

/** Add calendar days without passing through local time or DST. */
export function addCalendarDays(date: string, days: number): string {
  const result = calendarDateToUTC(date)
  result.setUTCDate(result.getUTCDate() + days)
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, '0')}-${String(result.getUTCDate()).padStart(2, '0')}`
}

/** Extract a configured-local calendar date from a date-only or timestamp value. */
export function getCalendarDate(isoString: string, timezone = DEFAULT_TIMEZONE): string {
  if (!isoString.includes('T') || !hasExplicitTimezone(isoString)) return isoString.slice(0, 10)
  return getTodayISO(timezone, new Date(isoString))
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
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
  const days = calendarDayDifference(rule.startDate, date)
  const currentWeekday = weekdayNumber(date)
  let occurrenceIndex = -1

  if (rule.frequency === 'daily') {
    if (days % interval !== 0) return false
    occurrenceIndex = days / interval
  } else if (rule.frequency === 'weekdays') {
    if (currentWeekday < 1 || currentWeekday > 5) return false
    occurrenceIndex = days
  } else if (rule.frequency === 'weekends') {
    if (currentWeekday !== 0 && currentWeekday !== 6) return false
    occurrenceIndex = days
  } else if (rule.frequency === 'specific_days') {
    const selected = (rule.daysOfWeek ?? []).map(day => DAY_NUMBERS[day]).filter(day => day !== undefined)
    if (!selected.includes(currentWeekday)) return false
    occurrenceIndex = days
  } else if (rule.frequency === 'weekly') {
    const selected = (rule.daysOfWeek ?? []).map(day => DAY_NUMBERS[day]).filter(day => day !== undefined)
    if (selected.length > 0) {
      if (!selected.includes(currentWeekday)) return false
      const weeks = Math.floor(days / 7)
      if (weeks % interval !== 0) return false
      const ordered = [...new Set(selected)].sort((a, b) => a - b)
      occurrenceIndex = Math.floor(weeks / interval) * ordered.length + ordered.indexOf(currentWeekday)
    } else {
      if (days % (7 * interval) !== 0) return false
      occurrenceIndex = days / (7 * interval)
    }
  } else if (rule.frequency === 'monthly') {
    const [startYear, startMonth, startDay] = rule.startDate.split('-').map(Number)
    const [year, month, day] = date.split('-').map(Number)
    const months = (year - startYear) * 12 + month - startMonth
    const dayOfMonth = rule.dayOfMonth ?? startDay
    if (months < 0 || months % interval !== 0 || day !== dayOfMonth) return false
    occurrenceIndex = months / interval
  } else if (rule.frequency === 'yearly') {
    const [startYear, startMonth, startDay] = rule.startDate.split('-').map(Number)
    const [year, month, day] = date.split('-').map(Number)
    const years = year - startYear
    if (years < 0 || years % interval !== 0 || month !== startMonth || day !== startDay) return false
    occurrenceIndex = years / interval
  } else if (rule.frequency === 'custom') {
    if (days % interval !== 0) return false
    occurrenceIndex = days / interval
  } else {
    return false
  }

  return rule.end.mode !== 'afterCount' || (rule.end.count > 0 && occurrenceIndex < rule.end.count)
}

/** Evaluate the existing day-of-week template plus its optional recurrence rule. */
export function routineTemplateOccursOnDate(
  template: Pick<RoutineTemplate, 'dayOfWeek' | 'recurrence'>,
  date: string,
): boolean {
  if (getDayOfWeekForDate(date) !== template.dayOfWeek) return false
  // A missing or "does not repeat" template rule preserves the legacy
  // day-of-week schedule. An item override can use "none" to opt out.
  return !template.recurrence || template.recurrence.frequency === 'none'
    ? true
    : recurrenceOccursOnDate(template.recurrence, date)
}

/** An item inherits its parent schedule unless it has an explicit override. */
export function routineItemOccursOnDate(
  template: Pick<RoutineTemplate, 'dayOfWeek' | 'recurrence'>,
  item: Pick<RoutineItem, 'recurrence'>,
  date: string,
): boolean {
  if (!routineTemplateOccursOnDate(template, date)) return false
  return item.recurrence ? recurrenceOccursOnDate(item.recurrence, date) : true
}

/**
 * Expand a selected ritual template into upcoming configured-local calendar dates.
 * The parent and item evaluators above remain the only source of scheduling truth.
 */
export function getUpcomingRoutineSchedule(
  template: Pick<RoutineTemplate, 'dayOfWeek' | 'recurrence' | 'items'>,
  startDate: string,
  lookAheadDays = 366,
  maxDates = 5,
): RoutineSchedulePreviewDate[] {
  if (lookAheadDays <= 0 || maxDates <= 0) return []

  const preview: RoutineSchedulePreviewDate[] = []
  for (let offset = 0; offset < lookAheadDays && preview.length < maxDates; offset += 1) {
    const date = addCalendarDays(startDate, offset)
    if (!routineTemplateOccursOnDate(template, date)) continue

    preview.push({
      date,
      items: template.items.map(item => ({
        item,
        status: item.recurrence
          ? routineItemOccursOnDate(template, item, date) ? 'due' : 'skipped'
          : 'inherited',
      })),
    })
  }
  return preview
}

/** Returns true if a recurrence pattern is active on the given date (defaults to today). */
export function isActiveToday(
  pattern: SimpleRecurrencePattern,
  date: Date = new Date(),
  timezone = DEFAULT_TIMEZONE,
): boolean {
  if (pattern.frequency === 'none') return false
  const day = datePartsInTimeZone(date, timezone).weekday
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
