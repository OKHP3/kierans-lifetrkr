import type { Habit, HabitCompletion } from '../types'

export function habitTarget(habit: Pick<Habit, 'timesPerDay'>): number {
  return Math.max(1, Math.floor(habit.timesPerDay || 1))
}

export function completionCount(
  completions: HabitCompletion[],
  habitId: string,
  date: string,
): number {
  return new Set(
    completions
      .filter(completion => completion.habitId === habitId && completion.date === date)
      .map(completion => completion.completionIndex ?? 0),
  ).size
}

export function isHabitComplete(
  habit: Pick<Habit, 'id' | 'timesPerDay'>,
  completions: HabitCompletion[],
  date: string,
): boolean {
  return completionCount(completions, habit.id, date) >= habitTarget(habit)
}