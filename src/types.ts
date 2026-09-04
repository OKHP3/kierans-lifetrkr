// ─── Zodiac ────────────────────────────────────────────────────────────────

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces'

// ─── Celestial ─────────────────────────────────────────────────────────────

export type MoonPhaseName =
  | 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous'
  | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent'

export type MoonPhase = {
  name: MoonPhaseName
  emoji: string
  illumination: number   // 0.0 to 1.0
  daysUntilNext: number
}

export type AstroSeason = {
  sign: ZodiacSign
  emoji: string
  element: 'Fire' | 'Earth' | 'Air' | 'Water'
  dates: string          // e.g. "Jun 21 – Jul 22"
}

// ─── Oracle ────────────────────────────────────────────────────────────────

export type TarotCard = {
  name: string
  name_short: string
  type: string           // 'major' | 'minor'
  suit?: string
  value?: string
  meaning_up: string
  meaning_rev: string
  desc: string
}

export type OracleReading = {
  date: string           // YYYY-MM-DD
  tarotCard: TarotCard
  moonPhase: MoonPhase
  astroSeason: AstroSeason
  message: string        // Claude-generated oracle text
  horoscope?: string     // from freehoroscopeapi.com if birth sign set
}

// ─── Identity ──────────────────────────────────────────────────────────────

export type GoogleProfile = {
  sub: string
  name: string
  email: string
  picture: string
}

export type UserSettings = {
  displayName: string
  email: string
  timezone: string
  googleConnected: boolean
  // Calendar
  calendarDaysAhead: number
  showGoogleCalendar: boolean
  showMoonPhaseOnCalendar: boolean
  // Tasks
  selectedTaskLists: string[]
  showGoogleTasks: boolean
  showTasksDueToday: boolean
  showCompletedTasks: boolean
  // Oracle
  birthSign: ZodiacSign | null
  oracleEnabled: boolean
  showMercuryBanner: boolean
  // Profile extras
  pronouns: string
  birthMonth: string
  birthDay: string
  birthYear: string
  social: {
    instagram: string
    twitter: string
    tiktok: string
    facebook: string
    linkedin: string
  }
  theme: 'dark' | 'light' | 'system'
}

// ─── Routines ──────────────────────────────────────────────────────────────

/** Uppercase day-of-week used by RoutineTemplate. */
export type RoutineDayOfWeek =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'
  | 'Thursday' | 'Friday' | 'Saturday'

export type RoutineItem = {
  id: string
  title: string
  time?: string
  description?: string
  optional?: boolean
  /** When present, the item is due only when this rule and its parent occur. */
  recurrence?: RecurrenceRule
  sortOrder: number
}

export type RoutineTemplate = {
  id: string
  dayOfWeek: RoutineDayOfWeek
  name: string
  items: RoutineItem[]
  // v2 fields
  description?: string
  categoryId?: string
  tags?: string[]
  recurrence?: RecurrenceRule
}

export type RoutineCompletion = {
  date: string
  routineTemplateId: string
  completedItemIds: string[]
}

export type RoutineItemScheduleStatus = 'inherited' | 'due' | 'skipped'

export type RoutinePreviewItem = {
  item: RoutineItem
  status: RoutineItemScheduleStatus
}

export type RoutineSchedulePreviewDate = {
  date: string
  items: RoutinePreviewItem[]
}

// ─── Habits ────────────────────────────────────────────────────────────────

export type Habit = {
  id: string
  name: string
  description?: string
  colorTag?: string
  active: boolean
  createdAt: string
  /** Daily target. Missing legacy values mean one completion per day. */
  timesPerDay?: number
  // v2 fields (optional for backward compat)
  recurrence?: RecurrenceRule
  categoryId?: string
  tags?: string[]
  updatedAt?: string
}

export type HabitCompletion = {
  habitId: string
  date: string
  completionIndex?: number   // 0-based, for habits with timesPerDay > 1
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export type TaskStatus = 'backlog' | 'today' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'
export type TaskSource = 'manual' | 'google_tasks'

export type Task = {
  id: string
  title: string
  notes?: string
  status: TaskStatus
  priority: TaskPriority
  category?: string
  dueDate?: string
  createdAt: string
  completedAt?: string
  source: TaskSource
  /** Position within the task's status bucket; missing legacy values are migrated on load. */
  sortOrder?: number
  googleTaskId?: string
  googleTaskListId?: string
}

// ─── Google Tasks (read-only source) ───────────────────────────────────────

export type TaskList = {
  id: string
  title: string
}

export type GoogleTask = {
  id: string
  title: string
  notes: string | null
  due: string | null
  status: 'needsAction' | 'completed'
  source: 'google_tasks'
}

// ─── Calendar ──────────────────────────────────────────────────────────────

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end?: string
  allDay: boolean
  location: string | null
  description: string | null
  colorId: string | null
  source: 'google' | 'manual' | 'mock' | 'cosmic' | 'birthday'
  // v2 fields (optional for backward compat)
  recurrence?: RecurrenceRule
  categoryId?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// ─── App State ─────────────────────────────────────────────────────────────

export type AppState = {
  profile: GoogleProfile | null
  settings: UserSettings
  routineTemplates: RoutineTemplate[]
  routineCompletions: RoutineCompletion[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  tasks: Task[]
  calendarEvents: CalendarEvent[]
  googleTasks: GoogleTask[]
  taskLists: TaskList[]
  oracle: OracleReading | null
  isGoogleConnected: boolean
  isLoadingCalendar: boolean
  isLoadingTasks: boolean
  isLoadingOracle: boolean
  lastGoogleSync: string | null
}

// ─── Recurrence ────────────────────────────────────────────────────────────

export type RecurrenceFrequency =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'specific_days'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom'

/** Lowercase day-of-week used by RecurrenceRule. */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type RecurrenceEnd =
  | { mode: 'never' }
  | { mode: 'onDate'; date: string }
  | { mode: 'afterCount'; count: number }

export type RecurrenceRule = {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: DayOfWeek[]
  dayOfMonth?: number | null
  startDate: string
  end: RecurrenceEnd
  exceptions?: string[]
}

// ─── Categories & Tags ─────────────────────────────────────────────────────

export type CategoryRealm =
  | 'body'
  | 'mind'
  | 'home'
  | 'school'
  | 'social'
  | 'health'
  | 'magic'
  | 'creative'
  | 'calendar'
  | 'other'

export type LifeTrkrCategory = {
  id: string
  label: string
  emoji: string
  realm: CategoryRealm
  description?: string
}

export type TaggedMetadata = {
  description?: string
  categoryId?: string
  tags: string[]
}

// ─── Ritual (v2 shape) ─────────────────────────────────────────────────────

export type Ritual = {
  id: string
  title: string
  description?: string
  steps?: RoutineItem[]
  startTime?: string | null
  endTime?: string | null
  recurrence?: RecurrenceRule
  categoryId?: string
  tags?: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

// ─── Cosmic Events ─────────────────────────────────────────────────────────

export type CosmicEventType = 'moon_phase' | 'seasonal' | 'daily_card' | 'daily_wisdom'

export type CosmicEvent = {
  id: string
  title: string
  description?: string
  date: string
  type: CosmicEventType
  emoji?: string
  source: 'local' | 'external'
}
