import { Link } from 'react-router-dom'
import { ActionButtons } from '../components/ActionButtons'
import { AttendanceGrid } from '../components/AttendanceGrid'
import { EmptyState } from '../components/EmptyState'
import { MatchCard } from '../components/MatchCard'
import { RecapHighlights } from '../components/RecapHighlights'
import { TeamMonthStats } from '../components/TeamMonthStats'
import { ScreenHeader } from '../components/ScreenHeader'
import { useData } from '../context/DataContext'
import { formatDayLong, todayISO, todayRecapPeriod } from '../lib/dates'
import { getOperatorId } from '../lib/operator'
import { bestPair, bestPerformer, matchesInRange, membersPresentForDay, playerById } from '../lib/stats'

export function TeamBoardScreen() {
  const { matches, players, removeMatch } = useData()
  const day = todayISO()
  const todays = matches.filter((match) => match.played_on.slice(0, 10) === day)
  const present = membersPresentForDay(matches, players, day)
  const recap = todayRecapPeriod()
  const recapMatches = matchesInRange(matches, recap.start, recap.end)
  const livePeriod = {
    kind: 'today' as const,
    start: day,
    end: day,
    label: 'Updates as you add matches',
  }
  const operatorId = getOperatorId()
  const operator = operatorId ? playerById(players, operatorId) : undefined

  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow="On court"
        title="Team board"
        subtitle={`${formatDayLong(day)} · ${todays.length} ${todays.length === 1 ? 'match' : 'matches'} · ${present.length} members`}
      />

      <ActionButtons primary={{ to: '/match/new', label: 'Add match' }} secondary={{ to: '/', label: 'Home' }} />

      <TeamMonthStats matches={matches} players={players} />

      {todays.length === 0 ? (
        <RecapHighlights
          period={recap}
          performer={bestPerformer(players, recapMatches)}
          pair={bestPair(players, recapMatches)}
        />
      ) : (
        <RecapHighlights
          period={livePeriod}
          matchCount={todays.length}
          performer={bestPerformer(players, todays)}
          pair={bestPair(players, todays)}
        />
      )}

      <section>
        <h2 className="mb-3 text-base font-bold">Today&apos;s attendance · {present.length}</h2>
        {present.length === 0 ? (
          <EmptyState>No members logged yet today.</EmptyState>
        ) : (
          <AttendanceGrid players={present} />
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">Today&apos;s matches</h2>
          {todays.length > 0 ? (
            <Link to={`/history/${day}`} className="text-xs font-semibold text-[#f0c14b]">
              View day
            </Link>
          ) : null}
        </div>
        {todays.length === 0 ? (
          <EmptyState>No matches yet. Tap Add match to log who played and the score.</EmptyState>
        ) : (
          todays.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              highlightId={operator?.id}
              onDelete={(id) => void removeMatch(id)}
            />
          ))
        )}
      </section>

      <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
        <Link to="/board" className="rounded-2xl border border-[#d7ecd0]/20 py-3 text-[#9bb5a8]">
          Standings
        </Link>
        <Link to="/activity" className="rounded-2xl border border-[#d7ecd0]/20 py-3 text-[#9bb5a8]">
          Activity
        </Link>
      </div>
    </div>
  )
}
