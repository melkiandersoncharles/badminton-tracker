import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { HomeDashboard } from '../components/HomeDashboard'
import { MatchCard } from '../components/MatchCard'
import { ScreenHeader } from '../components/ScreenHeader'
import { useData } from '../context/DataContext'
import { todayISO } from '../lib/dates'
import { getOperatorId } from '../lib/operator'
import { playerById, sideOf } from '../lib/stats'

export function TodayScreen() {
  const { matches, players, removeMatch } = useData()
  const day = todayISO()
  const todays = matches.filter((match) => match.played_on.slice(0, 10) === day)
  const operatorId = getOperatorId()
  const operator = operatorId ? playerById(players, operatorId) : undefined
  const yourMatchesToday = operator
    ? todays.filter((match) => sideOf(match, operator.id) !== null)
    : []

  return (
    <div className="space-y-4">
      <ScreenHeader eyebrow="Your court" title="Home" />

      {operator ? (
        <HomeDashboard player={operator} players={players} matches={matches}>
          {yourMatchesToday.length > 0 ? (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">Your matches today</h2>
                <Link
                  to={`/history/${day}?player=${operator.id}`}
                  className="text-xs font-semibold text-[#f0c14b]"
                >
                  View all
                </Link>
              </div>
              {yourMatchesToday.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  highlightId={operator.id}
                  onDelete={(id) => void removeMatch(id)}
                />
              ))}
            </section>
          ) : (
            <EmptyState>
              No matches for you today yet. Tap <span className="font-semibold text-white">Add match</span> to log a
              game, or check the <Link to="/team" className="font-semibold text-[#f0c14b]">Team board</Link> for the
              club.
            </EmptyState>
          )}
        </HomeDashboard>
      ) : null}
    </div>
  )
}
