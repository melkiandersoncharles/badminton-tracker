import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { formatDay } from '../lib/dates'
import { attendanceForDay, daysWithMatches } from '../lib/stats'

export function HistoryScreen() {
  const { matches } = useData()
  const days = daysWithMatches(matches)

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Archive</p>
        <h1 className="mt-1 text-2xl font-bold">History</h1>
      </header>
      {days.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-10 text-center text-sm text-[#9bb5a8]">
          Past sessions will land here after you save matches.
        </p>
      ) : (
        <ul className="space-y-2">
          {days.map((day) => {
            const dayMatches = matches.filter((match) => match.played_on === day)
            const present = attendanceForDay(matches, day).length
            return (
              <li key={day}>
                <Link
                  to={`/history/${day}`}
                  className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{formatDay(day)}</p>
                    <p className="text-xs text-[#9bb5a8]">
                      {dayMatches.length} match{dayMatches.length === 1 ? '' : 'es'} · {present} present
                    </p>
                  </div>
                  <span className="text-[#f0c14b]">→</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
