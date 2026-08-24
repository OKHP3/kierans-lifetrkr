import type { TaskList, GoogleTask } from '../types'
import { GoogleApiError } from './googleCalendar'

export async function fetchTaskLists(token: string): Promise<TaskList[]> {
  const lists: TaskList[] = []
  let pageToken: string | undefined
  do {
    const url = new URL('https://tasks.googleapis.com/tasks/v1/users/@me/lists')
    url.searchParams.set('maxResults', '100')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new GoogleApiError(`Tasks API error: ${res.status}`, 'tasks', res.status)
    const data = await res.json() as { items?: Record<string, string>[]; nextPageToken?: string }
    lists.push(...(data.items ?? []).filter(list => list.id && list.title).map(list => ({ id: list.id, title: list.title })))
    pageToken = data.nextPageToken
  } while (pageToken)
  return lists
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

  const tasks: GoogleTask[] = []
  let pageToken: string | undefined
  do {
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new GoogleApiError(`Tasks fetch error: ${res.status}`, 'tasks', res.status)
    const data = await res.json() as { items?: Record<string, unknown>[]; nextPageToken?: string }
    tasks.push(...(data.items ?? []).filter(task => task.id && task.title).map(task => ({
      id: String(task.id),
      title: String(task.title),
      notes: typeof task.notes === 'string' ? task.notes : null,
      due: typeof task.due === 'string' ? task.due : null,
      status: task.status === 'completed' ? 'completed' as const : 'needsAction' as const,
      source: 'google_tasks' as const,
    })))
    pageToken = data.nextPageToken
  } while (pageToken)
  return tasks
}
