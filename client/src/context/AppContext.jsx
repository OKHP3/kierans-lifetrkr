import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { DAYS, todayKey } from '../utils.js'

const AppContext = createContext(null)

const initialProfile = {
  displayName: '',
  pronouns: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  email: '',
  social: {
    instagram: '',
    twitter: '',
    tiktok: '',
    facebook: '',
    linkedin: '',
  },
}

const initialState = {
  routines: {
    Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
  },
  routineCompletions: {},
  habits: [],
  habitCompletions: {},
  tasks: [],
  lastReset: null,
  profile: initialProfile,
}

function loadState() {
  try {
    const saved = localStorage.getItem('lifetrkr_state')
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return null
}

function saveState(state) {
  try {
    localStorage.setItem('lifetrkr_state', JSON.stringify(state))
  } catch (e) {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...initialState,
        ...action.payload,
        profile: { ...initialProfile, ...(action.payload.profile || {}), social: { ...initialProfile.social, ...((action.payload.profile || {}).social || {}) } },
      }

    case 'MIDNIGHT_RESET':
      return { ...state, lastReset: todayKey() }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.profile },
      }

    case 'UPDATE_SOCIAL':
      return {
        ...state,
        profile: {
          ...state.profile,
          social: { ...state.profile.social, ...action.social },
        },
      }

    case 'ADD_ROUTINE_ITEM': {
      const { day, item } = action
      return {
        ...state,
        routines: { ...state.routines, [day]: [...(state.routines[day] || []), item] }
      }
    }

    case 'REMOVE_ROUTINE_ITEM': {
      const { day, itemId } = action
      return {
        ...state,
        routines: { ...state.routines, [day]: state.routines[day].filter(i => i.id !== itemId) }
      }
    }

    case 'REORDER_ROUTINE': {
      const { day, items } = action
      return { ...state, routines: { ...state.routines, [day]: items } }
    }

    case 'TOGGLE_ROUTINE_COMPLETION': {
      const { itemId, date } = action
      const key = `${itemId}_${date}`
      return {
        ...state,
        routineCompletions: { ...state.routineCompletions, [key]: !state.routineCompletions[key] }
      }
    }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }

    case 'REMOVE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.habitId) }

    case 'TOGGLE_HABIT_COMPLETION': {
      const { habitId, date } = action
      const key = `${habitId}_${date}`
      return {
        ...state,
        habitCompletions: { ...state.habitCompletions, [key]: !state.habitCompletions[key] }
      }
    }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] }

    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) }

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== action.taskId) return t
          return { ...t, status: t.status === 'Done' ? 'Today' : 'Done', completedDate: t.status !== 'Done' ? todayKey() : null }
        })
      }

    case 'PROMOTE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id !== action.taskId ? t : { ...t, status: 'Today', dueDate: todayKey() })
      }

    case 'DEMOTE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id !== action.taskId ? t : { ...t, status: 'Backlog', dueDate: null })
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadState()
    if (saved) dispatch({ type: 'LOAD_STATE', payload: saved })
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const checkMidnight = () => {
      const today = todayKey()
      if (state.lastReset !== today) dispatch({ type: 'MIDNIGHT_RESET' })
    }
    checkMidnight()
    const interval = setInterval(checkMidnight, 60000)
    return () => clearInterval(interval)
  }, [state.lastReset])

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
