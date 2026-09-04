import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addCalendarDays,
  formatEventDate,
  formatEventTime,
  getCalendarDate,
  getDayOfWeek,
  getDayOfWeekForDate,
  getTodayISO,
  recurrenceOccursOnDate,
  routineItemOccursOnDate,
} from '../src/lib/date.ts'
import { getLocalHour, isEveningWrapUpAvailable } from '../src/lib/eveningWrapUp.ts'

const instantNearUtcMidnight = new Date('2026-09-03T01:30:00Z')

function rule(
  frequency: 'daily' | 'weekdays' | 'weekends' | 'specific_days' | 'weekly' | 'monthly' | 'yearly' | 'custom',
  startDate = '2026-08-24',
  extra: Record<string, unknown> = {},
) {
  return {
    frequency,
    interval: 1,
    startDate,
    end: { mode: 'never' as const },
    ...extra,
  }
}

test('configured timezone controls the local date and weekday near midnight', () => {
  assert.equal(getTodayISO('America/Los_Angeles', instantNearUtcMidnight), '2026-09-02')
  assert.equal(getDayOfWeek('America/Los_Angeles', instantNearUtcMidnight), 'Wednesday')
  assert.equal(getTodayISO('Asia/Tokyo', instantNearUtcMidnight), '2026-09-03')
  assert.equal(getDayOfWeek('Asia/Tokyo', instantNearUtcMidnight), 'Thursday')
})

test('calendar-day offsets cross DST without losing or duplicating a date', () => {
  assert.equal(addCalendarDays('2026-03-07', 1), '2026-03-08')
  assert.equal(addCalendarDays('2026-03-08', 1), '2026-03-09')
  assert.equal(addCalendarDays('2026-11-01', -1), '2026-10-31')
  assert.equal(getDayOfWeekForDate('2026-03-08'), 'Sunday')
})

test('weekday recurrence is inactive on Saturday and active on Monday', () => {
  const weekday = rule('weekdays')
  assert.equal(recurrenceOccursOnDate(weekday, '2026-08-29'), false)
  assert.equal(recurrenceOccursOnDate(weekday, '2026-08-24'), true)
})

test('specific-day recurrence is inactive on Tuesday and active on Wednesday', () => {
  const specificDays = rule('specific_days', '2026-08-24', {
    daysOfWeek: ['monday', 'wednesday', 'friday'],
  })
  assert.equal(recurrenceOccursOnDate(specificDays, '2026-08-25'), false)
  assert.equal(recurrenceOccursOnDate(specificDays, '2026-08-26'), true)
})

test('weekly, monthly, yearly, and custom recurrence use calendar dates', () => {
  const weekly = rule('weekly', '2026-08-24', { daysOfWeek: ['monday', 'wednesday', 'friday'] })
  assert.equal(recurrenceOccursOnDate(weekly, '2026-08-31'), true)
  assert.equal(recurrenceOccursOnDate(weekly, '2026-08-25'), false)

  const everyOtherWeek = rule('weekly', '2026-08-24', { interval: 2, daysOfWeek: ['monday'] })
  assert.equal(recurrenceOccursOnDate(everyOtherWeek, '2026-08-31'), false)
  assert.equal(recurrenceOccursOnDate(everyOtherWeek, '2026-09-07'), true)

  const monthly = rule('monthly', '2026-01-31')
  assert.equal(recurrenceOccursOnDate(monthly, '2026-02-28'), false)
  assert.equal(recurrenceOccursOnDate(monthly, '2026-03-31'), true)

  const yearly = rule('yearly', '2024-02-29')
  assert.equal(recurrenceOccursOnDate(yearly, '2025-02-28'), false)
  assert.equal(recurrenceOccursOnDate(yearly, '2028-02-29'), true)

  const custom = rule('custom', '2026-08-24', { interval: 3 })
  assert.equal(recurrenceOccursOnDate(custom, '2026-08-27'), true)
  assert.equal(recurrenceOccursOnDate(custom, '2026-08-28'), false)
})

test('routine item overrides intersect the parent schedule and honor date exceptions', () => {
  const mondayTemplate = { dayOfWeek: 'Monday' as const }
  const inheritedItem = {}
  const dailyOverride = { recurrence: rule('daily') }
  const skippedMonday = { recurrence: { ...rule('daily'), exceptions: ['2026-08-31'] } }
  const neverItem = { recurrence: { ...rule('daily'), frequency: 'none' as const } }

  assert.equal(routineItemOccursOnDate(mondayTemplate, inheritedItem, '2026-08-31'), true)
  assert.equal(routineItemOccursOnDate(mondayTemplate, inheritedItem, '2026-09-01'), false)
  assert.equal(routineItemOccursOnDate(mondayTemplate, dailyOverride, '2026-08-31'), true)
  assert.equal(routineItemOccursOnDate(mondayTemplate, dailyOverride, '2026-09-01'), false)
  assert.equal(routineItemOccursOnDate(mondayTemplate, skippedMonday, '2026-08-31'), false)
  assert.equal(routineItemOccursOnDate(mondayTemplate, neverItem, '2026-08-31'), false)
})

test('event date and time labels use configured timezone while date-only records stay stable', () => {
  const event = '2026-09-03T01:30:00Z'
  assert.equal(getCalendarDate(event, 'America/Los_Angeles'), '2026-09-02')
  assert.equal(formatEventDate(event, false, 'America/Los_Angeles'), 'Sep 2')
  assert.equal(formatEventTime(event, false, 'America/Los_Angeles'), '6:30 PM')
  assert.equal(formatEventDate('2026-09-03', true, 'America/Los_Angeles'), 'Sep 3')
  assert.equal(formatEventTime('2026-09-03T06:30:00', false, 'Asia/Tokyo'), '6:30 AM')
})

test('evening wrap-up availability follows the configured local hour', () => {
  const beforeEvening = new Date('2026-09-03T22:59:59Z')
  const evening = new Date('2026-09-03T23:00:00Z')
  assert.equal(getLocalHour('America/Chicago', beforeEvening), 17)
  assert.equal(getLocalHour('America/Chicago', evening), 18)
  assert.equal(isEveningWrapUpAvailable('America/Chicago', beforeEvening), false)
  assert.equal(isEveningWrapUpAvailable('America/Chicago', evening), true)

  const tokyoMorning = new Date('2026-09-03T09:00:00Z')
  assert.equal(getLocalHour('Asia/Tokyo', tokyoMorning), 18)
  assert.equal(isEveningWrapUpAvailable('Asia/Tokyo', tokyoMorning), true)
})