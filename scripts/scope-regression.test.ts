import assert from 'node:assert/strict'
import test from 'node:test'
import type { Habit, HabitCompletion, Task } from '../src/types.ts'
import { completionCount, habitTarget, isHabitComplete } from '../src/lib/habitCompletion.ts'
import { nextTaskOrder, normalizeTaskOrder, reorderTasks, sortTasksByOrder } from '../src/lib/taskOrdering.ts'

const task = (id: string, status: Task['status'], sortOrder?: number): Task => ({
  id, title: id, status, priority: 'normal', createdAt: '2026-09-03', source: 'manual', sortOrder,
})

test('legacy tasks receive stable per-bucket positions and can be reordered', () => {
  const legacy = [task('today-a', 'today'), task('backlog-a', 'backlog'), task('today-b', 'today')]
  const normalized = normalizeTaskOrder(legacy)
  assert.deepEqual(normalized.map(item => item.sortOrder), [0, 0, 1])
  assert.equal(nextTaskOrder(normalized, 'today'), 2)

  const reordered = reorderTasks(normalized, 'today', ['today-b', 'today-a'])
  assert.deepEqual(sortTasksByOrder(reordered.filter(item => item.status === 'today')).map(item => item.id), ['today-b', 'today-a'])
  assert.equal(reordered.find(item => item.id === 'backlog-a')?.sortOrder, 0)
})

test('habit repetitions are independently completable and legacy completions count as first repetition', () => {
  const habit: Habit = {
    id: 'hydrate', name: 'Hydrate', active: true, createdAt: '2026-09-03', timesPerDay: 2,
  }
  const legacyCompletion: HabitCompletion = { habitId: habit.id, date: '2026-09-03' }
  assert.equal(habitTarget(habit), 2)
  assert.equal(completionCount([legacyCompletion], habit.id, '2026-09-03'), 1)
  assert.equal(isHabitComplete(habit, [legacyCompletion], '2026-09-03'), false)
  const complete = [legacyCompletion, { habitId: habit.id, date: '2026-09-03', completionIndex: 1 }]
  assert.equal(completionCount(complete, habit.id, '2026-09-03'), 2)
  assert.equal(isHabitComplete(habit, complete, '2026-09-03'), true)
})

test('single-target habits retain the original one-toggle completion contract', () => {
  const habit: Habit = { id: 'walk', name: 'Walk', active: true, createdAt: '2026-09-03' }
  assert.equal(habitTarget(habit), 1)
  assert.equal(isHabitComplete(habit, [{ habitId: habit.id, date: '2026-09-03', completionIndex: 0 }], '2026-09-03'), true)
})