import assert from 'node:assert/strict'
import test from 'node:test'
import { storage } from '../src/lib/storage.ts'
import type { GoogleProfile, HabitCompletion, RoutineCompletion, RoutineTemplate, UserSettings } from '../src/types.ts'

type ProfileCase = {
  label: string
  profile: GoogleProfile | null
  initialTimezone: string
  updatedTimezone: string
  routineTemplates: RoutineTemplate[]
  routineCompletions: RoutineCompletion[]
  habitCompletions: HabitCompletion[]
}

const defaultSettings: UserSettings = {
  displayName: '',
  email: '',
  timezone: 'UTC',
  googleConnected: false,
  calendarDaysAhead: 14,
  showGoogleCalendar: true,
  showMoonPhaseOnCalendar: true,
  selectedTaskLists: [],
  showGoogleTasks: true,
  showTasksDueToday: true,
  showCompletedTasks: false,
  birthSign: null,
  oracleEnabled: true,
  showMercuryBanner: true,
  pronouns: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  social: { instagram: '', twitter: '', tiktok: '', facebook: '', linkedin: '' },
  theme: 'dark',
}

const profiles: ProfileCase[] = [
  {
    label: 'guest',
    profile: null,
    initialTimezone: 'America/Los_Angeles',
    updatedTimezone: 'Asia/Tokyo',
    routineTemplates: [{
      id: 'guest-morning',
      dayOfWeek: 'Monday',
      name: 'Guest morning',
      items: [{
        id: 'stretch',
        title: 'Stretch',
        sortOrder: 0,
        recurrence: {
          frequency: 'daily',
          interval: 1,
          startDate: '2026-08-24',
          end: { mode: 'never' },
          exceptions: ['2026-09-07'],
        },
      }],
    }],
    routineCompletions: [{ date: '2026-08-31', routineTemplateId: 'guest-morning', completedItemIds: ['stretch'] }],
    habitCompletions: [{ date: '2026-09-01', habitId: 'guest-water', completionIndex: 0 }],
  },
  {
    label: 'subject-a',
    profile: { sub: 'subject-a', name: 'Test A', email: 'subject-a@example.test', picture: '' },
    initialTimezone: 'Europe/London',
    updatedTimezone: 'Australia/Sydney',
    routineTemplates: [{
      id: 'a-evening',
      dayOfWeek: 'Wednesday',
      name: 'A evening',
      items: [{
        id: 'journal',
        title: 'Journal',
        sortOrder: 0,
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          startDate: '2026-07-15',
          daysOfWeek: ['wednesday'],
          end: { mode: 'never' },
        },
      }],
    }],
    routineCompletions: [{ date: '2026-07-15', routineTemplateId: 'a-evening', completedItemIds: ['journal'] }],
    habitCompletions: [{ date: '2026-07-16', habitId: 'a-read', completionIndex: 0 }],
  },
  {
    label: 'subject-b',
    profile: { sub: 'subject-b', name: 'Test B', email: 'subject-b@example.test', picture: '' },
    initialTimezone: 'America/New_York',
    updatedTimezone: 'Pacific/Auckland',
    routineTemplates: [{
      id: 'b-school',
      dayOfWeek: 'Wednesday',
      name: 'B school',
      items: [{
        id: 'pack',
        title: 'Pack',
        sortOrder: 0,
        recurrence: {
          frequency: 'daily',
          interval: 2,
          startDate: '2026-06-10',
          end: { mode: 'never' },
        },
      }],
    }],
    routineCompletions: [{ date: '2026-06-10', routineTemplateId: 'b-school', completedItemIds: ['pack'] }],
    habitCompletions: [{ date: '2026-06-11', habitId: 'b-walk', completionIndex: 0 }],
  },
]

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value))
  }
}

const browserStorage = new MemoryStorage()
globalThis.localStorage = browserStorage

function activateProfile(profile: GoogleProfile | null) {
  if (profile) {
    assert.equal(storage.setProfile(profile), true)
  } else {
    assert.equal(storage.clearProfile(), true)
  }
}

function saveSettings(timezone: string, profile: GoogleProfile | null) {
  assert.equal(storage.set('settings', {
    ...defaultSettings,
    timezone,
    googleConnected: profile !== null,
    email: profile?.email ?? '',
  }), true)
}

function seedProfiles() {
  browserStorage.clear()
  for (const profileCase of profiles) {
    activateProfile(profileCase.profile)
    saveSettings(profileCase.initialTimezone, profileCase.profile)
    assert.equal(storage.set('routineTemplates', profileCase.routineTemplates), true)
    assert.equal(storage.set('routineCompletions', profileCase.routineCompletions), true)
    assert.equal(storage.set('habitCompletions', profileCase.habitCompletions), true)
  }
}

test('guest and Google-subject namespaces preserve historical dates through timezone changes and reload reads', () => {
  seedProfiles()

  for (const profileCase of profiles) {
    activateProfile(profileCase.profile)

    const beforeTimezoneChange = {
      routineCompletions: storage.get<RoutineCompletion[]>('routineCompletions'),
      routineTemplates: storage.get<RoutineTemplate[]>('routineTemplates'),
      habitCompletions: storage.get<HabitCompletion[]>('habitCompletions'),
    }
    assert.deepEqual(beforeTimezoneChange.routineTemplates, profileCase.routineTemplates, `${profileCase.label} template seed`)
    assert.deepEqual(beforeTimezoneChange.routineCompletions, profileCase.routineCompletions, `${profileCase.label} seed`)
    assert.deepEqual(beforeTimezoneChange.habitCompletions, profileCase.habitCompletions, `${profileCase.label} seed`)

    saveSettings(profileCase.updatedTimezone, profileCase.profile)

    // A reload is represented by fresh storage reads after the settings write.
    assert.equal(storage.get<UserSettings>('settings')?.timezone, profileCase.updatedTimezone, `${profileCase.label} timezone`)
    assert.deepEqual(storage.get<RoutineTemplate[]>('routineTemplates'), profileCase.routineTemplates, `${profileCase.label} recurrence reload`)
    assert.deepEqual(storage.get<RoutineCompletion[]>('routineCompletions'), profileCase.routineCompletions, `${profileCase.label} routine history`)
    assert.deepEqual(storage.get<HabitCompletion[]>('habitCompletions'), profileCase.habitCompletions, `${profileCase.label} habit history`)

    for (const otherProfile of profiles.filter(candidate => candidate.label !== profileCase.label)) {
      assert.notDeepEqual(storage.get<RoutineCompletion[]>('routineCompletions'), otherProfile.routineCompletions, `${profileCase.label} routine isolation`)
      assert.notDeepEqual(storage.get<RoutineTemplate[]>('routineTemplates'), otherProfile.routineTemplates, `${profileCase.label} recurrence isolation`)
      assert.notDeepEqual(storage.get<HabitCompletion[]>('habitCompletions'), otherProfile.habitCompletions, `${profileCase.label} habit isolation`)
    }
  }
})

test('the persisted keys remain separate for guest and both Google subjects', () => {
  seedProfiles()

  const expectedKeys = [
    'lifetrkr:guest:routineTemplates',
    'lifetrkr:guest:routineCompletions',
    'lifetrkr:guest:habitCompletions',
    'lifetrkr:subject-a:routineTemplates',
    'lifetrkr:subject-a:routineCompletions',
    'lifetrkr:subject-a:habitCompletions',
    'lifetrkr:subject-b:routineTemplates',
    'lifetrkr:subject-b:routineCompletions',
    'lifetrkr:subject-b:habitCompletions',
  ]

  for (const key of expectedKeys) {
    assert.notEqual(browserStorage.getItem(key), null, `missing ${key}`)
  }

  assert.deepEqual(
    Array.from({ length: browserStorage.length }, (_, index) => browserStorage.key(index))
      .filter(key => key.includes('routineTemplates') || key.includes('routineCompletions') || key.includes('habitCompletions'))
      .sort(),
    expectedKeys.sort(),
  )
})