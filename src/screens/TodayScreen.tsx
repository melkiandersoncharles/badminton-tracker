import { Link } from 'react-router-dom'
import { AttendanceGrid } from '../components/AttendanceGrid'
import { MatchCard } from '../components/MatchCard'
import { RecapHighlights } from '../components/RecapHighlights'
import { useData } from '../context/DataContext'
import { formatDayLong, todayISO, todayRecapPeriod } from '../lib/dates'
import { bestPair, bestPerformer, matchesInRange, membersPresentForDay } from '../lib/stats'

export function TodayScreen() {
  const { matches, players, removeMatch } = useData()
  const day = todayISO()
  const todays = matches.filter((match) => match.played_on === day)
  const present = membersPresentForDay(matches, players, day)
  const recap = todayRecapPeriod()
  const recapMatches = matchesInRange(matches, recap.start, recap.end)
  const showRecap = todays.length === 0

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">On court</p>
          <h1 className="mt-1 text-2xl font-bold">{formatDayLong(day)}</h1>
          <p className="mt-1 text-sm text-[#9bb5a8]">
            {todays.length === 1 ? '1 match' : `${todays.length} matches`} · {present.length} members
          </p>
        </div>
        <Link
          to="/match/new"
          className="shrink-0 rounded-full bg-[#f0c14b] px-3 py-2 text-xs font-bold text-[#0c1f18]"
        >
          Add match
        </Link>
      </header>

      {showRecap ? (
        <RecapHighlights
          period={recap}
          performer={bestPerformer(players, recapMatches)}
          pair={bestPair(players, recapMatches)}
        />
      ) : null}

      <section>
        <h2 className="mb-3 text-base font-bold">Today’s attendance (members)</h2>
        <AttendanceGrid players={present} />
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Today’s matches</h2>
        {todays.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
            No matches yet. Tap Add match to log who played and the score.
          </p>
        ) : (
          todays.map((match) => (
            <MatchCard key={match.id} match={match} onDelete={(id) => void removeMatch(id)} />
          ))
        )}
      </section>
    </div>
  )
}
