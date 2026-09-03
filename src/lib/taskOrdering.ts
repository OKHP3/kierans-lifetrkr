import type { Task, TaskStatus } from '../types'

/**
 * Give legacy tasks a stable position without changing their persisted shape.
 * Existing array order is the only reliable ordering signal for old records.
 */
export function normalizeTaskOrder(tasks: Task[]): Task[] {
  const nextByStatus: Record<TaskStatus, number> = { backlog: 0, today: 0, done: 0 }
  return tasks.map(task => {
    const order = Number.isFinite(task.sortOrder) ? task.sortOrder! : nextByStatus[task.status]
    nextByStatus[task.status] = Math.max(nextByStatus[task.status], order + 1)
    return { ...task, sortOrder: order }
  })
}

export function sortTasksByOrder(tasks: Task[]): Task[] {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => (a.task.sortOrder ?? a.index) - (b.task.sortOrder ?? b.index) || a.index - b.index)
    .map(({ task }) => task)
}

export function nextTaskOrder(tasks: Task[], status: TaskStatus): number {
  return tasks
    .filter(task => task.status === status)
    .reduce((max, task) => Math.max(max, task.sortOrder ?? -1), -1) + 1
}

export function reorderTasks(tasks: Task[], status: TaskStatus, orderedIds: string[]): Task[] {
  const positions = new Map(orderedIds.map((id, index) => [id, index]))
  return tasks.map(task => task.status === status && positions.has(task.id)
    ? { ...task, sortOrder: positions.get(task.id) }
    : task)
}