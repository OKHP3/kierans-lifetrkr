import assert from 'node:assert/strict'
import test from 'node:test'
import { getDetectedTimezone, getTimezoneOptions, getTodayISO } from '../src/lib/date.ts'
import { initialState, persistState, reducer } from '../src/context/AppContext.tsx'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  get length(): number {
    return this.values.size
  }
}

test('timezone selector choices include the detected zone and required practical zones', () => {
  const options = getTimezoneOptions()
  assert.equal(options[0], getDetectedTimezone())
  assert.ok(options.includes('America/Los_Angeles'))
  assert.ok(options.includes('Asia/Tokyo'))
})

test('timezone changes persist without rewriting stored completion dates', () => {
  const localStorage = new MemoryStorage()
  Object.assign(globalThis, { localStorage })

  const storedRoutineCompletions = [{
    date: '2026-09-02',
    routineTemplateId: 'wednesday',
    completedItemIds: ['stretch'],
  }]
  const storedHabitCompletions = [{
    habitId: 'water',
    date: '2026-09-02',
    completionIndex: 0,
  }]
  const before = {
    ...initialState,
    settings: { ...initialState.settings, timezone: 'America/Los_Angeles' },
    routineCompletions: storedRoutineCompletions,
    habitCompletions: storedHabitCompletions,
  }
  const after = reducer(before, { type: 'UPDATE_SETTINGS', payload: { timezone: 'Asia/Tokyo' } })

  assert.equal(after.settings.timezone, 'Asia/Tokyo')
  assert.deepEqual(after.routineCompletions, storedRoutineCompletions)
  assert.deepEqual(after.habitCompletions, storedHabitCompletions)
  assert.equal(persistState(after), true)

  const savedSettings = JSON.parse(localStorage.getItem('lifetrkr:guest:settings')!)
  const savedRoutineCompletions = JSON.parse(localStorage.getItem('lifetrkr:guest:routineCompletions')!)
  const savedHabitCompletions = JSON.parse(localStorage.getItem('lifetrkr:guest:habitCompletions')!)
  assert.equal(savedSettings.timezone, 'Asia/Tokyo')
  assert.deepEqual(savedRoutineCompletions, storedRoutineCompletions)
  assert.deepEqual(savedHabitCompletions, storedHabitCompletions)
  assert.equal(getTodayISO('America/Los_Angeles', new Date('2026-09-03T01:30:00Z')), '2026-09-02')
  assert.equal(getTodayISO('Asia/Tokyo', new Date('2026-09-03T01:30:00Z')), '2026-09-03')
})