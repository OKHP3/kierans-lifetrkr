import type { TaskList, GoogleTask } from '../types'

export async function fetchTaskLists(token: string): Promise<TaskList[]> {
  const res = await fetch(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=20',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Tasks API error: ${res.status}`)
  const data = await res.json()
  return (data.items || []).map((list: Record<string, string>) => ({
    id: list.id,
    title: list.title,
  }))
}

export async function fetchTasks(
  token: string,
  taskListId: string = '@default'
): Promise<GoogleTask[]> {
  const url = new URL(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`
  )
  url.searchParams.set('showCompleted', 'false')
  url.searchParams.set('showHidden', 'false')
  url.searchParams.set('maxResults', '100')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Tasks fetch error: ${res.status}`)
  const data = await res.json()

  return (data.items || []).map((task: Record<string, unknown>) => ({
    id: task.id as string,
    title: task.title as string,
    notes: (task.notes as string) || null,
    due: (task.due as string) || null,
    status: task.status as 'needsAction' | 'completed',
    source: 'google_tasks' as const,
  }))
}
