import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEveningWrapUpSummary } from '../src/lib/eveningWrapUp.ts'
import type { AppState } from '../src/types.ts'

const emptyState: Pick<AppState, 'routineTemplates' | 'routineCompletions' | 'habits' | 'habitCompletions' | 'tasks'> = {
  routineTemplates: [],
  routineCompletions: [],
  habits: [],
  habitCompletions: [],
  tasks: [],
}

test('empty evening review stays a read-only clean slate', () => {
  const summary = buildEveningWrapUpSummary(emptyState, '2026-09-04')
  assert.deepEqual(summary, {
    date: '2026-09-04',
    rituals: { total: 0, completed: 0, open: [] },
    habits: { total: 0, completed: 0, open: [] },
    tasks: { total: 0, completed: 0, open: [] },
    totalTracked: 0,
    totalCompleted: 0,
  })
})

test('incomplete review summarizes due rituals, habit repetitions, and task records', () => {
  const state = {
    routineTemplates: [{
      id: 'friday',
      dayOfWeek: 'Friday' as const,
      name: 'Friday rituals',
      items: [
        { id: 'journal', title: 'Journal', sortOrder: 0 },
        { id: 'walk', title: 'Walk', optional: true, sortOrder: 1 },
      ],
    }],
    routineCompletions: [{
      date: '2026-09-04',
      routineTemplateId: 'friday',
      completedItemIds: ['journal'],
    }],
    habits: [{
      id: 'water',
      name: 'Drink water',
      active: true,
      createdAt: '2026-09-01',
      timesPerDay: 2,
    }],
    habitCompletions: [{
      habitId: 'water',
      date: '2026-09-04',
      completionIndex: 0,
    }],
    tasks: [
      {
        id: 'open-task',
        title: 'Pack bag',
        status: 'today' as const,
        priority: 'normal' as const,
        createdAt: '2026-09-04',
        source: 'manual' as const,
      },
      {
        id: 'done-task',
        title: 'Send note',
        status: 'done' as const,
        priority: 'normal' as const,
        createdAt: '2026-09-03',
        completedAt: '2026-09-04',
        source: 'manual' as const,
      },
      {
        id: 'old-done-task',
        title: 'Old work',
        status: 'done' as const,
        priority: 'normal' as const,
        createdAt: '2026-09-03',
        completedAt: '2026-09-03',
        source: 'manual' as const,
      },
    ],
  }

  const summary = buildEveningWrapUpSummary(state, '2026-09-04')
  assert.equal(summary.rituals.total, 2)
  assert.equal(summary.rituals.completed, 1)
  assert.deepEqual(summary.rituals.open, [{ id: 'walk', title: 'Walk', detail: 'Optional' }])
  assert.equal(summary.habits.total, 2)
  assert.equal(summary.habits.completed, 1)
  assert.deepEqual(summary.habits.open, [{ id: 'water', title: 'Drink water', detail: '1 repetition left' }])
  assert.equal(summary.tasks.total, 2)
  assert.equal(summary.tasks.completed, 1)
  assert.deepEqual(summary.tasks.open, [{ id: 'open-task', title: 'Pack bag' }])
  assert.equal(summary.totalTracked, 6)
  assert.equal(summary.totalCompleted, 3)
})

test('review projection does not mutate completion records or include other account data', () => {
  const state = {
    ...emptyState,
    habits: [{
      id: 'habit-a',
      name: 'Read',
      active: true,
      createdAt: '2026-09-01',
    }],
    habitCompletions: [{ habitId: 'habit-a', date: '2026-09-04', completionIndex: 0 }],
  }
  const before = structuredClone(state)
  const summary = buildEveningWrapUpSummary(state, '2026-09-04')
  assert.equal(summary.totalCompleted, 1)
  assert.deepEqual(state, before)
  assert.equal('oracle' in summary, false)
  assert.equal('googleTasks' in summary, false)
})

test('reloaded records keep the same summary while another account stays separate', () => {
  const accountA = {
    ...emptyState,
    tasks: [{
      id: 'a-task',
      title: 'Account A task',
      status: 'done' as const,
      priority: 'normal' as const,
      createdAt: '2026-09-03',
      completedAt: '2026-09-04',
      source: 'manual' as const,
    }],
  }
  const accountB = {
    ...emptyState,
    tasks: [{
      id: 'b-task',
      title: 'Account B task',
      status: 'today' as const,
      priority: 'normal' as const,
      createdAt: '2026-09-04',
      source: 'manual' as const,
    }],
  }

  const reloadedA = JSON.parse(JSON.stringify(accountA))
  assert.deepEqual(
    buildEveningWrapUpSummary(reloadedA, '2026-09-04'),
    buildEveningWrapUpSummary(accountA, '2026-09-04'),
  )
  assert.deepEqual(
    buildEveningWrapUpSummary(accountA, '2026-09-04').tasks.open,
    [],
  )
  assert.deepEqual(
    buildEveningWrapUpSummary(accountB, '2026-09-04').tasks.open,
    [{ id: 'b-task', title: 'Account B task' }],
  )
})