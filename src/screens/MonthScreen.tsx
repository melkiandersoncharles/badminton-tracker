import { Link, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { EmptyState } from '../components/EmptyState'
import { RecapHighlights } from '../components/RecapHighlights'
import { useData } from '../context/DataContext'
import { formatDay, formatMonthLabel, monthBounds } from '../lib/dates'
import { bestPair, bestPerformer, daysWithMatchesInMonth, matchesInMonth, membersPresentForDay } from '../lib/stats'

export function MonthScreen() {
  const { month } = useParams()
  const { matches, players } = useData()

  if (!month) {
    return <p className="text-sm text-[#9bb5a8]">Missing month</p>
  }

  const monthMatches = matchesInMonth(matches, month)
  const days = daysWithMatchesInMonth(matches, month)
  const bounds = monthBounds(month)
  const period = {
    kind: 'month' as const,
    start: bounds.start,
    end: bounds.end,
    label: formatMonthLabel(month),
  }

  return (
    <div className="space-y-4">
      <BackLink to="/history?view=days" label="History" />

      <header>
        <h1 className="mt-2 text-2xl font-bold">{formatMonthLabel(month)}</h1>
        <p className="mt-1 text-sm text-[#9bb5a8]">
          {days.length} {days.length === 1 ? 'day' : 'days'} · {monthMatches.length}{' '}
          {monthMatches.length === 1 ? 'match' : 'matches'}
        </p>
      </header>

      <RecapHighlights
        period={period}
        matchCount={monthMatches.length}
        performer={bestPerformer(players, monthMatches)}
        pair={bestPair(players, monthMatches)}
      />

      <section className="space-y-2">
        <h2 className="text-base font-bold">Days</h2>
        {days.length === 0 ? (
          <EmptyState>No sessions this month.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {days.map((day) => {
              const dayMatches = matches.filter((match) => match.played_on === day)
              const present = membersPresentForDay(matches, players, day).length
              return (
                <li key={day}>
                  <Link
                    to={`/history/${day}`}
                    className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{formatDay(day)}</p>
                      <p className="text-xs text-[#9bb5a8]">
                        {dayMatches.length} match{dayMatches.length === 1 ? '' : 'es'} · {present} members
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
