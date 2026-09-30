import { Link } from 'react-router-dom'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import {
  daysWithMatchesForPlayerInMonth,
  matchesForPlayerInMonth,
  monthKeysForPlayer,
} from '../lib/stats'
import type { Match } from '../lib/types'
import { EmptyState } from './EmptyState'

export function PlayerMatchesByDay({
  playerId,
  playerName,
  matches,
}: {
  playerId: string
  playerName: string
  matches: Match[]
}) {
  const currentMonth = currentMonthKey()
  const months = monthKeysForPlayer(playerId, matches)

  if (months.length === 0) {
    return <EmptyState>No matches yet for {playerName}.</EmptyState>
  }

  return (
    <ul className="space-y-2">
      {months.map((key) => {
        const monthMatches = matchesForPlayerInMonth(playerId, matches, key)
        const days = daysWithMatchesForPlayerInMonth(playerId, matches, key)
        return (
          <li key={key}>
            <Link
              to={`/players/${playerId}/month/${key}`}
              className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"
            >
              <div>
                <p className="font-semibold">
                  {formatMonthLabel(key)}
                  {key === currentMonth ? ' (current)' : ''}
                </p>
                <p className="text-xs text-[#9bb5a8]">
                  {days.length} {days.length === 1 ? 'day' : 'days'} · {monthMatches.length}{' '}
                  {monthMatches.length === 1 ? 'match' : 'matches'}
                </p>
              </div>
              <span className="text-[#f0c14b]">→</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
