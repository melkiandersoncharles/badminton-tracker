import {
  currentMonthKey,
  currentPlayingWeek,
  formatDay,
  formatDayRange,
  formatMonthLabel,
  previousPlayingWeek,
  todayISO,
  yesterdayISO,
} from './dates'
import { monthKeysForPlayer, statsForPlayer, statsForPlayerInMonth, statsForPlayerInRange } from './stats'
import type { Match, PlayerStat } from './types'

export type PlayerPeriodRow = {
  id: string
  title: string
  subtitle?: string
  stats: PlayerStat
}

/** Month-by-month stats plus all time — used in Home and profile "More stats" tables. */
export function moreStatsPeriods(playerId: string, matches: Match[]): PlayerPeriodRow[] {
  const months = monthKeysForPlayer(playerId, matches)

  return [
    ...months.map((key) => ({
      id: key,
      title: formatMonthLabel(key),
      subtitle: key === currentMonthKey() ? 'Current month' : undefined,
      stats: statsForPlayerInMonth(playerId, matches, key),
    })),
    { id: 'all', title: 'Overall', stats: statsForPlayer(playerId, matches, 'all') },
  ]
}

/** Full stats for player profile — all periods including today, weeks, and each month. */
export function fullProfilePeriods(playerId: string, matches: Match[]): PlayerPeriodRow[] {
  const today = todayISO()
  const yesterday = yesterdayISO()
  const thisWeek = currentPlayingWeek()
  const lastWeek = previousPlayingWeek()
  const months = monthKeysForPlayer(playerId, matches)

  return [
    { id: 'all', title: 'All time', stats: statsForPlayer(playerId, matches, 'all') },
    {
      id: 'today',
      title: 'Today',
      subtitle: formatDay(today),
      stats: statsForPlayerInRange(playerId, matches, today, today),
    },
    {
      id: 'yesterday',
      title: 'Yesterday',
      subtitle: formatDay(yesterday),
      stats: statsForPlayerInRange(playerId, matches, yesterday, yesterday),
    },
    {
      id: 'this-week',
      title: 'This week',
      subtitle: formatDayRange(thisWeek.start, thisWeek.end),
      stats: statsForPlayerInRange(playerId, matches, thisWeek.start, thisWeek.end),
    },
    {
      id: 'last-week',
      title: 'Last week',
      subtitle: formatDayRange(lastWeek.start, lastWeek.end),
      stats: statsForPlayerInRange(playerId, matches, lastWeek.start, lastWeek.end),
    },
    ...months.map((key) => ({
      id: key,
      title: formatMonthLabel(key),
      stats: statsForPlayerInMonth(playerId, matches, key),
    })),
  ]
}

export function dashboardMonthLabel(): string {
  return formatMonthLabel(currentMonthKey())
}
