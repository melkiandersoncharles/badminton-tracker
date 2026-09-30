import { currentMonthKey, formatMonthLabel, isWeekday, monthBounds, todayISO, weekdaysInRange } from './dates'
import { attendanceDaysForPlayerInMonth } from './stats'
import type { Match } from './types'

export const MONTHLY_COURT_FEE = 1700

export type CourtUtilization = {
  month: string
  monthLabel: string
  fee: number
  usedWeekdays: number
  weekdaysSoFar: number
  totalWeekdaysInMonth: number
  weekdaysRemaining: number
  utilizationSoFarPct: number
  utilizationMonthPct: number
  costPerUsedDay: number | null
  isCurrentMonth: boolean
}

export function formatRupee(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function playerWeekdayDaysInMonth(playerId: string, matches: Match[], month: string): number {
  let count = 0
  for (const day of attendanceDaysForPlayerInMonth(playerId, matches, month)) {
    if (isWeekday(day.slice(0, 10))) count += 1
  }
  return count
}

export function playerCourtUtilizationForMonth(
  playerId: string,
  matches: Match[],
  month: string,
  today = todayISO(),
): CourtUtilization {
  const bounds = monthBounds(month)
  const isCurrentMonth = month === currentMonthKey()
  const capEnd = isCurrentMonth && today < bounds.end ? today : bounds.end

  const totalWeekdaysInMonth = weekdaysInRange(bounds.start, bounds.end).length
  const weekdaysSoFar = weekdaysInRange(bounds.start, capEnd).length
  const usedWeekdays = playerWeekdayDaysInMonth(playerId, matches, month)
  const weekdaysRemaining = Math.max(0, totalWeekdaysInMonth - weekdaysSoFar)

  return {
    month,
    monthLabel: formatMonthLabel(month),
    fee: MONTHLY_COURT_FEE,
    usedWeekdays,
    weekdaysSoFar,
    totalWeekdaysInMonth,
    weekdaysRemaining,
    utilizationSoFarPct:
      weekdaysSoFar === 0 ? 0 : Math.round((usedWeekdays / weekdaysSoFar) * 100),
    utilizationMonthPct:
      totalWeekdaysInMonth === 0 ? 0 : Math.round((usedWeekdays / totalWeekdaysInMonth) * 100),
    costPerUsedDay: usedWeekdays > 0 ? Math.round(MONTHLY_COURT_FEE / usedWeekdays) : null,
    isCurrentMonth,
  }
}
