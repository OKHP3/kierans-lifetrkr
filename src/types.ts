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
  calendarDaysAhead: number
  selectedTaskLists: string[]
  showGoogleTasks: boolean
  showCompletedTasks: boolean
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

export type DayOfWeek =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'
  | 'Thursday' | 'Friday' | 'Saturday'

export type RoutineItem = {
  id: string
  title: string
  time?: string
  optional?: boolean
  sortOrder: number
}

export type RoutineTemplate = {
  id: string
  dayOfWeek: DayOfWeek
  name: string
  items: RoutineItem[]
}

export type RoutineCompletion = {
  date: string
  routineTemplateId: string
  completedItemIds: string[]
}

// ─── Habits ────────────────────────────────────────────────────────────────

export type Habit = {
  id: string
  name: string
  description?: string
  colorTag?: string
  active: boolean
  createdAt: string
}

export type HabitCompletion = {
  habitId: string
  date: string
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
  source: 'google' | 'manual'
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
  isGoogleConnected: boolean
  isLoadingCalendar: boolean
  isLoadingTasks: boolean
  lastGoogleSync: string | null
}
