import { Link, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { EmptyState } from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { formatDay, formatMonthLabel } from '../lib/dates'
import {
  daysWithMatchesForPlayerInMonth,
  matchesForPlayerInMonth,
  playerById,
  sideOf,
} from '../lib/stats'

export function PlayerMonthScreen() {
  const { id, month } = useParams()
  const { matches, players } = useData()
  const player = id ? playerById(players, id) : undefined

  if (!id || !month || !player) {
    return <p className="text-sm text-[#9bb5a8]">Missing player or month</p>
  }

  const monthMatches = matchesForPlayerInMonth(id, matches, month)
  const days = daysWithMatchesForPlayerInMonth(id, matches, month)

  return (
    <div className="space-y-4">
      <BackLink to={`/players/${id}`} label={player.name} />

      <header>
        <h1 className="mt-2 text-2xl font-bold">{formatMonthLabel(month)}</h1>
        <p className="mt-1 text-sm text-[#9bb5a8]">
          {player.name} · {days.length} {days.length === 1 ? 'day' : 'days'} · {monthMatches.length}{' '}
          {monthMatches.length === 1 ? 'match' : 'matches'}
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Days</h2>
        {days.length === 0 ? (
          <EmptyState>No matches this month.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {days.map((day) => {
              const dayMatches = matches.filter(
                (match) => match.played_on === day && sideOf(match, id) !== null,
              )
              return (
                <li key={day}>
                  <Link
                    to={`/history/${day}?player=${id}`}
                    className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{formatDay(day)}</p>
                      <p className="text-xs text-[#9bb5a8]">
                        {dayMatches.length} match{dayMatches.length === 1 ? '' : 'es'}
                      </p>
                    </div>
                    <span className="text-[#f0c14b]">→</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
