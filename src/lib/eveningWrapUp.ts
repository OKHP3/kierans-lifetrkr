import type { AppState } from '../types'
import { getDayOfWeekForDate, routineItemOccursOnDate } from './date'
import { completionCount, habitTarget } from './habitCompletion'

export const EVENING_WRAP_UP_START_HOUR = 18

export type EveningWrapUpEntry = {
  id: string
  title: string
  detail?: string
}

export type EveningWrapUpCategory = {
  total: number
  completed: number
  open: EveningWrapUpEntry[]
}

export type EveningWrapUpSummary = {
  date: string
  rituals: EveningWrapUpCategory
  habits: EveningWrapUpCategory
  tasks: EveningWrapUpCategory
  totalTracked: number
  totalCompleted: number
}

/** Return the configured timezone's current hour for a supplied instant. */
export function getLocalHour(timezone: string, now: Date = new Date()): number {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).format(now))
  return hour === 24 ? 0 : hour
}

/** Evening review is offered at 6 PM, using the user's configured timezone. */
export function isEveningWrapUpAvailable(
  timezone: string,
  now: Date = new Date(),
): boolean {
  return getLocalHour(timezone, now) >= EVENING_WRAP_UP_START_HOUR
}

function category(total: number, completed: number, open: EveningWrapUpEntry[]): EveningWrapUpCategory {
  return { total, completed, open }
}

/**
 * Build a review from the same date-only records used by the action surfaces.
 * This is intentionally a read-only projection: it never changes completion
 * records and does not include Google or oracle data.
 */
export function buildEveningWrapUpSummary(
  state: Pick<AppState, 'routineTemplates' | 'routineCompletions' | 'habits' | 'habitCompletions' | 'tasks'>,
  date: string,
): EveningWrapUpSummary {
  const template = state.routineTemplates.find(template =>
    template.dayOfWeek === getDayOfWeekForDate(date),
  )
  const dueItems = template?.items.filter(item =>
    template ? routineItemOccursOnDate(template, item, date) : false,
  ) ?? []
  const routineCompletion = state.routineCompletions.find(completion =>
    completion.routineTemplateId === template?.id && completion.date === date,
  )
  const completedRoutineIds = new Set(routineCompletion?.completedItemIds ?? [])
  const openRituals = dueItems
    .filter(item => !completedRoutineIds.has(item.id))
    .map(item => ({
      id: item.id,
      title: item.title,
      detail: item.optional ? 'Optional' : undefined,
    }))

  const activeHabits = state.habits.filter(habit => habit.active)
  const openHabits: EveningWrapUpEntry[] = []
  let completedHabitRepetitions = 0
  let totalHabitRepetitions = 0
  for (const habit of activeHabits) {
    const target = habitTarget(habit)
    const completed = Math.min(target, completionCount(state.habitCompletions, habit.id, date))
    totalHabitRepetitions += target
    completedHabitRepetitions += completed
    if (completed < target) {
      openHabits.push({
        id: habit.id,
        title: habit.name,
        detail: `${target - completed} repetition${target - completed === 1 ? '' : 's'} left`,
      })
    }
  }

  const openTasks = state.tasks
    .filter(task => task.status === 'today')
    .map(task => ({ id: task.id, title: task.title }))
  const completedTasks = state.tasks.filter(task =>
    task.status === 'done' && task.completedAt === date,
  ).length

  const rituals = category(dueItems.length, dueItems.length - openRituals.length, openRituals)
  const habits = category(totalHabitRepetitions, completedHabitRepetitions, openHabits)
  const tasks = category(openTasks.length + completedTasks, completedTasks, openTasks)

  return {
    date,
    rituals,
    habits,
    tasks,
    totalTracked: rituals.total + habits.total + tasks.total,
    totalCompleted: rituals.completed + habits.completed + tasks.completed,
  }
}