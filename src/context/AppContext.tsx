import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type {
  AppState, RoutineTemplate, RoutineCompletion, Habit, HabitCompletion,
  Task, CalendarEvent, GoogleTask, TaskList, GoogleProfile, UserSettings,
  DayOfWeek, RoutineItem,
} from '../types'
import { storage } from '../lib/storage'
import { getTodayISO } from '../lib/date'
import { DAYS_OF_WEEK } from '../constants'

// ─── Initial State ──────────────────────────────────────────────────────────

const defaultSettings: UserSettings = {
  displayName: '',
  email: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  googleConnected: false,
  calendarDaysAhead: 14,
  selectedTaskLists: [],
  showGoogleTasks: true,
  showCompletedTasks: false,
  pronouns: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  social: { instagram: '', twitter: '', tiktok: '', facebook: '', linkedin: '' },
  theme: 'system',
}

const defaultTemplates: RoutineTemplate[] = (DAYS_OF_WEEK as string[]).map(day => ({
  id: day.toLowerCase(),
  dayOfWeek: day as DayOfWeek,
  name: `${day} Rituals`,
  items: [],
}))

const initialState: AppState = {
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
  isGoogleConnected: false,
  isLoadingCalendar: false,
  isLoadingTasks: false,
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
  | { type: 'SET_GOOGLE_TASKS'; payload: GoogleTask[] }
  | { type: 'SET_TASK_LISTS'; payload: TaskList[] }
  | { type: 'SET_LOADING_CALENDAR'; payload: boolean }
  | { type: 'SET_LOADING_TASKS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: string }
  | { type: 'ADD_ROUTINE_ITEM'; payload: { templateId: string; item: RoutineItem } }
  | { type: 'REMOVE_ROUTINE_ITEM'; payload: { templateId: string; itemId: string } }
  | { type: 'REORDER_ROUTINE'; payload: { templateId: string; items: RoutineItem[] } }
  | { type: 'TOGGLE_ROUTINE_ITEM'; payload: { templateId: string; itemId: string; date: string } }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'REMOVE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT'; payload: { habitId: string; date: string } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASK_STATUS'; payload: { taskId: string; status: Task['status'] } }
  | { type: 'CLEAR_ALL_DATA' }

// ─── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
        settings: { ...defaultSettings, ...(action.payload.settings || {}) },
        routineTemplates: action.payload.routineTemplates?.length
          ? action.payload.routineTemplates
          : defaultTemplates,
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

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'SET_GOOGLE_CONNECTED':
      return { ...state, isGoogleConnected: action.payload }

    case 'SET_CALENDAR_EVENTS':
      return { ...state, calendarEvents: action.payload, isLoadingCalendar: false }

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

    case 'ADD_ROUTINE_ITEM':
      return {
        ...state,
        routineTemplates: state.routineTemplates.map(t =>
          t.id === action.payload.templateId
            ? { ...t, items: [...t.items, action.payload.item] }
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

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] }

    case 'REMOVE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
        habitCompletions: state.habitCompletions.filter(c => c.habitId !== action.payload),
      }

    case 'TOGGLE_HABIT': {
      const { habitId, date } = action.payload
      const exists = state.habitCompletions.some(
        c => c.habitId === habitId && c.date === date
      )
      return {
        ...state,
        habitCompletions: exists
          ? state.habitCompletions.filter(c => !(c.habitId === habitId && c.date === date))
          : [...state.habitCompletions, { habitId, date }],
      }
    }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }

    case 'SET_TASK_STATUS': {
      const { taskId, status } = action.payload
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                status,
                completedAt: status === 'done' ? getTodayISO() : undefined,
              }
            : t
        ),
      }
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
}

const AppContext = createContext<AppCtx | null>(null)

// ─── Persisted keys ─────────────────────────────────────────────────────────

const PERSIST_KEYS: Array<keyof AppState> = [
  'settings', 'routineTemplates', 'routineCompletions',
  'habits', 'habitCompletions', 'tasks',
]

function loadPersistedState(): Partial<AppState> {
  const result: Partial<AppState> = {}
  for (const key of PERSIST_KEYS) {
    const val = storage.get<unknown>(key)
    if (val !== null) (result as Record<string, unknown>)[key] = val
  }
  const profile = storage.getProfile()
  if (profile) result.profile = profile
  return result
}

function persistState(state: AppState) {
  for (const key of PERSIST_KEYS) {
    storage.set(key, state[key])
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadPersistedState()
    if (Object.keys(saved).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: saved })
    }
  }, [])

  useEffect(() => {
    persistState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
