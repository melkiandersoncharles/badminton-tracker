export function todayISO(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function currentMonthKey(): string {
  return monthKey(todayISO())
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDayLong(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function isRestDay(date = new Date()): boolean {
  const weekday = date.getDay()
  return weekday === 0 || weekday === 6
}

/** Monday–Friday of the current week (the sessions that just finished on a rest day). */
export function lastPlayingWeek(date = new Date()): { start: string; end: string } {
  const weekday = date.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysFromMonday)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { start: todayISO(monday), end: todayISO(friday) }
}

export function formatDayRange(start: string, end: string): string {
  return `${formatDay(start)} – ${formatDay(end)}`
}
