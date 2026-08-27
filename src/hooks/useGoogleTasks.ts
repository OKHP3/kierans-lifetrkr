import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGoogleAuth } from './useGoogleAuth'
import { fetchTaskLists, fetchTasks } from '../lib/googleTasks'

/**
 * Load Google Tasks without exposing any write operations. The hook owns the
 * retry state so Today and Someday expose the same loading/error behavior.
 */
export function useGoogleTasks() {
  const { state, dispatch } = useApp()
  const { isConnected, getToken } = useGoogleAuth()
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const selectedTaskListsKey = state.settings.selectedTaskLists.join(',')
  const showGoogleTasks = state.settings.showGoogleTasks

  useEffect(() => {
    if (!isConnected || !showGoogleTasks) {
      dispatch({ type: 'SET_LOADING_TASKS', payload: false })
      return
    }

    let cancelled = false
    async function load() {
      dispatch({ type: 'SET_LOADING_TASKS', payload: true })
      setError(null)
      try {
        const token = await getToken()
        const lists = await fetchTaskLists(token)
        if (cancelled) return
        dispatch({ type: 'SET_TASK_LISTS', payload: lists })
        const selected = state.settings.selectedTaskLists.length > 0
          ? [...new Set(state.settings.selectedTaskLists)]
          : lists.map(list => list.id)
        const taskGroups = await Promise.all(selected.map(listId => fetchTasks(token, listId)))
        if (!cancelled) dispatch({ type: 'SET_GOOGLE_TASKS', payload: taskGroups.flat() })
      } catch {
        if (!cancelled) setError('Google Tasks could not be loaded.')
      } finally {
        if (!cancelled) dispatch({ type: 'SET_LOADING_TASKS', payload: false })
      }
    }
    load()
    return () => { cancelled = true }
  }, [dispatch, getToken, isConnected, refreshKey, selectedTaskListsKey, showGoogleTasks])

  const retry = useCallback(() => setRefreshKey(key => key + 1), [])

  return {
    loading: state.isLoadingTasks,
    error,
    retry,
  }
}