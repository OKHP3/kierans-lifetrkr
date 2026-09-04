import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import type {
  AppState, RoutineTemplate, RoutineCompletion, Habit, HabitCompletion,
  Task, CalendarEvent, GoogleTask, TaskList, GoogleProfile, UserSettings,
  RoutineDayOfWeek, RoutineItem, OracleReading,
} from '../types'
import { storage } from '../lib/storage'
import { getDetectedTimezone, getTodayISO, normalizeTimezone, routineItemOccursOnDate } from '../lib/date'
import { DAYS_OF_WEEK } from '../constants'
import { normalizeTaskOrder, nextTaskOrder, reorderTasks } from '../lib/taskOrdering'

// ─── Initial State ──────────────────────────────────────────────────────────

const defaultSettings: UserSettings = {
  displayName: '',
  email: '',
  timezone: getDetectedTimezone(),
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

const defaultTemplates: RoutineTemplate[] = ([...DAYS_OF_WEEK] as string[]).map(day => ({
  id: day.toLowerCase(),
  dayOfWeek: day as RoutineDayOfWeek,
  name: `${day} Rituals`,
  items: [],
}))

export const initialState: AppState = {
  profile: null,
  settings: defaultSettings,
  routineTemplates: defaultTemplates,
  routineCompletions: [],
  habits: [],
  habitCompletions: [],
  tasks: [],
  calendarEvents: [],
  googleTasks: [],
  taskLists: [],
  oracle: null,
  isGoogleConnected: false,
  isLoadingCalendar: false,
  isLoadingTasks: false,
  isLoadingOracle: false,
  lastGoogleSync: null,
}

// ─── Action Types ───────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_PROFILE'; payload: GoogleProfile }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_GOOGLE_CONNECTED'; payload: boolean }
  | { type: 'SET_CALENDAR_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_CALENDAR_EVENT'; payload: string }
  | { type: 'SET_GOOGLE_TASKS'; payload: GoogleTask[] }
  | { type: 'SET_TASK_LISTS'; payload: TaskList[] }
  | { type: 'SET_LOADING_CALENDAR'; payload: boolean }
  | { type: 'SET_LOADING_TASKS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: string }
  | { type: 'SET_ORACLE'; payload: OracleReading }
  | { type: 'CLEAR_ORACLE' }
  | { type: 'SET_LOADING_ORACLE'; payload: boolean }
  | { type: 'ADD_ROUTINE_ITEM'; payload: { templateId: string; item: RoutineItem } }
  | { type: 'UPDATE_ROUTINE_ITEM'; payload: { templateId: string; item: RoutineItem } }
  | { type: 'REMOVE_ROUTINE_ITEM'; payload: { templateId: string; itemId: string } }
  | { type: 'REORDER_ROUTINE'; payload: { templateId: string; items: RoutineItem[] } }
  | { type: 'TOGGLE_ROUTINE_ITEM'; payload: { templateId: string; itemId: string; date: string } }
  | { type: 'UPDATE_ROUTINE_TEMPLATE'; payload: { id: string } & Partial<RoutineTemplate> }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'REMOVE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT'; payload: { habitId: string; date: string } }
  | { type: 'TOGGLE_HABIT_COMPLETION'; payload: { habitId: string; date: string; completionIndex: number } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASK_STATUS'; payload: { taskId: string; status: Task['status'] } }
  | { type: 'REORDER_TASKS'; payload: { status: Task['status']; orderedIds: string[] } }
  | { type: 'CLEAR_ALL_DATA' }

// ─── Reducer ────────────────────────────────────────────────────────────────

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      const loadedSettings = {
        ...defaultSettings,
        ...(action.payload.settings || {}),
        timezone: normalizeTimezone(action.payload.settings?.timezone ?? defaultSettings.timezone),
      }
      return {
        ...state,
        ...action.payload,
        // A profile switch must replace, not merge, user-owned collections.
        // Missing values mean the new namespace is empty.
        routineCompletions: action.payload.routineCompletions ?? [],
        habits: action.payload.habits ?? [],
        habitCompletions: action.payload.habitCompletions ?? [],
        tasks: action.payload.tasks ?? [],
        calendarEvents: action.payload.calendarEvents ?? [],
        googleTasks: [],
        taskLists: [],
        lastGoogleSync: null,
        oracle: null,
        settings: loadedSettings,
        routineTemplates: action.payload.routineTemplates?.length
          ? action.payload.routineTemplates
          : defaultTemplates,
        // Restore isGoogleConnected from persisted settings or presence of profile
        isGoogleConnected: loadedSettings.googleConnected || action.payload.profile != null,
      }
    }

    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        isGoogleConnected: true,
        settings: {
          ...state.settings,
          displayName: state.settings.displayName || action.payload.name,
          email: action.payload.email,
          googleConnected: true,
        },
      }

    case 'CLEAR_PROFILE':
      return {
        ...state,
        profile: null,
        isGoogleConnected: false,
        settings: { ...state.settings, googleConnected: false },
        calendarEvents: [],
        googleTasks: [],
        taskLists: [],
        lastGoogleSync: null,
      }

    case 'UPDATE_SETTINGS': {
      const nextSettings = { ...state.settings, ...action.payload }
      return {
        ...state,
        settings: { ...nextSettings, timezone: normalizeTimezone(nextSettings.timezone) },
      }
    }

    case 'SET_GOOGLE_CONNECTED':
      return { ...state, isGoogleConnected: action.payload }

    case 'SET_CALENDAR_EVENTS':
      // Preserve manual events; replace google/mock events from the incoming payload
      return {
        ...state,
        calendarEvents: [
          ...state.calendarEvents.filter(e => e.source === 'manual'),
          ...action.payload.filter(e => e.source !== 'manual'),
        ],
        isLoadingCalendar: false,
      }

    case 'ADD_CALENDAR_EVENT':
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] }

    case 'UPDATE_CALENDAR_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.map(e => e.id === action.payload.id ? action.payload : e) }

    case 'DELETE_CALENDAR_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) }

    case 'SET_GOOGLE_TASKS':
      return { ...state, googleTasks: action.payload, isLoadingTasks: false }

    case 'SET_TASK_LISTS':
      return { ...state, taskLists: action.payload }

    case 'SET_LOADING_CALENDAR':
      return { ...state, isLoadingCalendar: action.payload }

    case 'SET_LOADING_TASKS':
      return { ...state, isLoadingTasks: action.payload }

    case 'SET_LAST_SYNC':
      return { ...state, lastGoogleSync: action.payload }

    case 'SET_ORACLE':
      return { ...state, oracle: action.payload, isLoadingOracle: false }

    case 'CLEAR_ORACLE':
      return { ...state, oracle: null }

    case 'SET_LOADING_ORACLE':
      return { ...state, isLoadingOracle: action.payload }

    case 'ADD_ROUTINE_ITEM':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.templateId
            ? { ...t, items: [...t.items, action.payload.item] }
            : t
        ),
      }

    case 'UPDATE_ROUTINE_ITEM':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.templateId
            ? { ...t, items: t.items.map(item => item.id === action.payload.item.id ? action.payload.item : item) }
            : t
        ),
      }

    case 'REMOVE_ROUTINE_ITEM':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.templateId
            ? { ...t, items: t.items.filter(i => i.id !== action.payload.itemId) }
            : t
        ),
      }

    case 'REORDER_ROUTINE':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.templateId
            ? { ...t, items: action.payload.items }
            : t
        ),
      }

    case 'TOGGLE_ROUTINE_ITEM': {
      const { templateId, itemId, date } = action.payload
      const template = state.routineTemplates.find(t => t.id === templateId)
      const item = template?.items.find(i => i.id === itemId)
      if (!template || !item || !routineItemOccursOnDate(template, item, date)) return state
      const existing = state.routineCompletions.find(
        c => c.routineTemplateId === templateId && c.date === date
      )
      if (existing) {
        const has = existing.completedItemIds.includes(itemId)
        return {
          ...state,
          routineCompletions: state.routineCompletions.map(c =>
            c === existing
              ? {
                  ...c,
                  completedItemIds: has
                    ? c.completedItemIds.filter(id => id !== itemId)
                    : [...c.completedItemIds, itemId],
                }
              : c
          ),
        }
      }
      return {
        ...state,
        routineCompletions: [
          ...state.routineCompletions,
          { date, routineTemplateId: templateId, completedItemIds: [itemId] },
        ],
      }
    }

    case 'UPDATE_ROUTINE_TEMPLATE':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] }

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h),
      }

    case 'REMOVE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
        habitCompletions: state.habitCompletions.filter(c => c.habitId !== action.payload),
      }

    case 'TOGGLE_HABIT': {
      const { habitId, date } = action.payload
      const target = Math.max(1, Math.floor(state.habits.find(h => h.id === habitId)?.timesPerDay || 1))
      const completionIndex = 0
      const exists = state.habitCompletions.some(c =>
        c.habitId === habitId && c.date === date && (c.completionIndex ?? 0) === completionIndex
      )
      return {
        ...state,
        habitCompletions: exists
          ? state.habitCompletions.filter(c => !(c.habitId === habitId && c.date === date && (c.completionIndex ?? 0) === completionIndex))
          : [...state.habitCompletions, { habitId, date, completionIndex: Math.min(completionIndex, target - 1) }],
      }
    }

    case 'TOGGLE_HABIT_COMPLETION': {
      const { habitId, date, completionIndex } = action.payload
      const target = Math.max(1, Math.floor(state.habits.find(h => h.id === habitId)?.timesPerDay || 1))
      const index = Math.max(0, Math.min(Math.floor(completionIndex), target - 1))
      const exists = state.habitCompletions.some(c =>
        c.habitId === habitId && c.date === date && (c.completionIndex ?? 0) === index
      )
      return {
        ...state,
        habitCompletions: exists
          ? state.habitCompletions.filter(c => !(c.habitId === habitId && c.date === date && (c.completionIndex ?? 0) === index))
          : [...state.habitCompletions, { habitId, date, completionIndex: index }],
      }
    }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { ...action.payload, sortOrder: action.payload.sortOrder ?? nextTaskOrder(state.tasks, action.payload.status) },
        ],
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id
          ? { ...action.payload, sortOrder: action.payload.sortOrder ?? t.sortOrder ?? nextTaskOrder(state.tasks, action.payload.status) }
          : t),
      }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }

    case 'SET_TASK_STATUS': {
      const { taskId, status } = action.payload
      const task = state.tasks.find(t => t.id === taskId)
      const movedStatus = task?.status !== status
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                status,
                sortOrder: movedStatus ? nextTaskOrder(state.tasks, status) : t.sortOrder,
                completedAt: status === 'done' ? getTodayISO(state.settings.timezone) : undefined,
              }
            : t
        ),
      }
    }

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: reorderTasks(state.tasks, action.payload.status, action.payload.orderedIds),
      }

    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        profile: state.profile,
        isGoogleConnected: state.isGoogleConnected,
        settings: {
          ...defaultSettings,
          email: state.settings.email,
          displayName: state.settings.displayName,
          googleConnected: state.isGoogleConnected,
        },
        routineTemplates: defaultTemplates,
      }

    default:
      return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AppCtx {
  state: AppState
  dispatch: React.Dispatch<Action>
  storageWarning: boolean
  retryStorage: () => void
}

const AppContext = createContext<AppCtx | null>(null)

// ─── Persisted keys ─────────────────────────────────────────────────────────

const PERSIST_KEYS: Array<keyof AppState> = [
  'settings', 'routineTemplates', 'routineCompletions',
  'habits', 'habitCompletions', 'tasks', 'calendarEvents',
]

const HABIT_DEFAULTS: Habit = {
  id: '', name: '', active: true, createdAt: '',
  tags: [], description: undefined, colorTag: undefined,
  categoryId: undefined, recurrence: undefined, updatedAt: undefined,
}

const ROUTINE_TEMPLATE_DEFAULTS: RoutineTemplate = {
  id: '', dayOfWeek: 'Sunday', name: '', items: [],
  description: undefined, categoryId: undefined, tags: [], recurrence: undefined,
}

const CALENDAR_EVENT_DEFAULTS: CalendarEvent = {
  id: '', title: '', start: '', allDay: false,
  location: null, description: null, colorId: null,
  source: 'manual',
  recurrence: undefined, categoryId: undefined, tags: [],
  createdAt: undefined, updatedAt: undefined,
}

function loadPersistedState(): Partial<AppState> {
  const result: Partial<AppState> = {}
  for (const key of PERSIST_KEYS) {
    if (key === 'habits') {
      const habits = storage.getList<Habit>(key, HABIT_DEFAULTS)
      if (habits.length > 0) result.habits = habits
    } else if (key === 'routineTemplates') {
      const templates = storage.getList<RoutineTemplate>(key, ROUTINE_TEMPLATE_DEFAULTS).map(template => ({
        ...template,
        items: template.items.map((item, index) => ({
          ...item,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        })),
      }))
      if (templates.length > 0) result.routineTemplates = templates
    } else if (key === 'calendarEvents') {
      // Only restore persisted manual events; Google events are fetched fresh each session
      const events = storage.getList<CalendarEvent>(key, CALENDAR_EVENT_DEFAULTS)
        .filter(e => e.source === 'manual')
      if (events.length > 0) result.calendarEvents = events
    } else if (key === 'tasks') {
      const tasks = storage.getList<Task>(key, {
        id: '', title: '', status: 'backlog', priority: 'normal', createdAt: '', source: 'manual',
      })
      if (tasks.length > 0) result.tasks = normalizeTaskOrder(tasks)
    } else {
      const val = storage.get<unknown>(key)
      if (val !== null) (result as Record<string, unknown>)[key] = val
    }
  }
  const profile = storage.getProfile()
  if (profile) result.profile = profile
  return result
}

export function persistState(state: AppState): boolean {
  let success = true
  for (const key of PERSIST_KEYS) {
    if (key === 'calendarEvents') {
      // Only persist manual events; Google events come from the API each session
      success = storage.set(key, (state.calendarEvents as CalendarEvent[]).filter(e => e.source === 'manual')) && success
    } else {
      success = storage.set(key, state[key]) && success
    }
  }
  return success
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [storageWarning, setStorageWarning] = useState(false)
  const hydrated = useRef(false)
  const pendingUser = useRef<string | null>(null)

  // Initial hydration runs before persistence is allowed, preventing an empty
  // initial state from overwriting a returning user's saved data.
  useEffect(() => {
    const saved = loadPersistedState()
    if (!storage.canWrite()) setStorageWarning(true)
    dispatch({ type: 'LOAD_STATE', payload: saved })
  }, [])

  // A profile switch changes the namespace used by storage. Load that
  // namespace before allowing the new state to be written there.
  useEffect(() => {
    if (!hydrated.current) return
    const userId = state.profile?.sub ?? 'guest'
    pendingUser.current = userId
    dispatch({ type: 'LOAD_STATE', payload: loadPersistedState() })
  }, [state.profile?.sub])

  useEffect(() => {
    const userId = state.profile?.sub ?? 'guest'
    // Do not persist the previous user's in-memory snapshot into the new
    // namespace while the profile-switch LOAD_STATE is still being applied.
    if (pendingUser.current) {
      if (pendingUser.current === userId) pendingUser.current = null
      return
    }
    if (!hydrated.current) {
      // The first persistence effect runs with the reducer's empty initial
      // state; let the queued LOAD_STATE render happen first.
      hydrated.current = true
      return
    }
    // Do not create a guest namespace before first launch is acknowledged.
    // The welcome flow records its completion before the app becomes active.
    if (!storage.hasSavedData()) return
    setStorageWarning(!persistState(state))
  }, [state])

  function retryStorage() {
    setStorageWarning(!persistState(state))
  }

  return (
    <AppContext.Provider value={{ state, dispatch, storageWarning, retryStorage }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10)
}
