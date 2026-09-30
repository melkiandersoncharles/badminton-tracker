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

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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

export type CalendarCell = {
  date: string | null
  day: number | null
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

export function calendarCellsForMonth(key: string): CalendarCell[] {
  const [y, m] = key.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const lastDay = new Date(y, m, 0).getDate()
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1

  const cells: CalendarCell[] = []
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null })
  for (let day = 1; day <= lastDay; day++) {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ date, day })
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null })
  return cells
}

export function yesterdayISO(date = new Date()): string {
  const previous = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
  return todayISO(previous)
}

function mondayOfContainingWeek(date: Date): Date {
  const weekday = date.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysFromMonday)
}

/** Monday–Friday of the week that contains the given date. */
export function currentPlayingWeek(date = new Date()): { start: string; end: string } {
  const monday = mondayOfContainingWeek(date)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { start: todayISO(monday), end: todayISO(friday) }
}

/** Monday–Friday of the week before the current playing week. */
export function previousPlayingWeek(date = new Date()): { start: string; end: string } {
  const monday = mondayOfContainingWeek(date)
  monday.setDate(monday.getDate() - 7)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { start: todayISO(monday), end: todayISO(friday) }
}

/** Monday–Friday of the playing week that just finished. */
export function lastPlayingWeek(date = new Date()): { start: string; end: string } {
  const weekday = date.getDay()
  const monday = mondayOfContainingWeek(date)
  if (weekday === 1) monday.setDate(monday.getDate() - 7)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { start: todayISO(monday), end: todayISO(friday) }
}

export function formatDayRange(start: string, end: string): string {
  return `${formatDay(start)} – ${formatDay(end)}`
}

export type RecapPeriod = {
  kind: 'yesterday' | 'week' | 'today' | 'month' | 'day'
  start: string
  end: string
  label: string
}

export function isWeekday(isoDate: string): boolean {
  const [y, m, d] = isoDate.split('-').map(Number)
  const weekday = new Date(y, m - 1, d).getDay()
  return weekday >= 1 && weekday <= 5
}

export function weekdaysInRange(start: string, end: string): string[] {
  const [sy, sm, sd] = start.split('-').map(Number)
  const cursor = new Date(sy, sm - 1, sd)
  const [ey, em, ed] = end.split('-').map(Number)
  const endDate = new Date(ey, em - 1, ed)
  const days: string[] = []

  while (cursor <= endDate) {
    const iso = todayISO(cursor)
    if (isWeekday(iso)) days.push(iso)
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function monthBounds(key: string): { start: string; end: string } {
  const [y, m] = key.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return {
    start: `${key}-01`,
    end: `${key}-${String(lastDay).padStart(2, '0')}`,
  }
}

/** Sat/Sun/Mon → last week. Tue–Fri → yesterday. */
export function todayRecapPeriod(date = new Date()): RecapPeriod {
  const weekday = date.getDay()
  if (weekday === 0 || weekday === 1 || weekday === 6) {
    const week = lastPlayingWeek(date)
    return {
      kind: 'week',
      start: week.start,
      end: week.end,
      label: `Last week · ${formatDayRange(week.start, week.end)}`,
    }
  }
  const yesterday = yesterdayISO(date)
  return {
    kind: 'yesterday',
    start: yesterday,
    end: yesterday,
    label: `Yesterday · ${formatDay(yesterday)}`,
  }
}
