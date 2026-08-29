import { Link, useParams } from 'react-router-dom'
import { AttendanceGrid } from '../components/AttendanceGrid'
import { MatchCard } from '../components/MatchCard'
import { useData } from '../context/DataContext'
import { formatDayLong } from '../lib/dates'
import { membersPresentForDay } from '../lib/stats'

export function DayScreen() {
  const { date } = useParams()
  const { matches, players, removeMatch } = useData()
  const day = date ?? ''
  const dayMatches = matches.filter((match) => match.played_on === day)
  const present = membersPresentForDay(matches, players, day)

  if (!day) {
    return <p className="text-sm text-[#9bb5a8]">Missing date</p>
  }

  return (
    <div className="space-y-5">
      <header>
        <Link to="/history" className="text-xs font-semibold text-[#f0c14b]">
          ← History
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{formatDayLong(day)}</h1>
      </header>

      <section>
        <h2 className="mb-3 text-base font-bold">Members present · {present.length}</h2>
        <AttendanceGrid players={present} />
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Matches</h2>
        {dayMatches.length === 0 ? (
          <p className="rounded-2xl bg-[#143328] px-3 py-4 text-sm text-[#9bb5a8]">No matches</p>
        ) : (
          dayMatches.map((match) => (
            <MatchCard key={match.id} match={match} onDelete={(id) => void removeMatch(id)} />
          ))
        )}
      </section>
    </div>
  )
}
