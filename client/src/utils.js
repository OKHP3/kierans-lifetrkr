export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function todayKey() {
  return new Date().toISOString().split('T')[0]
}
