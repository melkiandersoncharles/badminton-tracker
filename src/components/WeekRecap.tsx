import { Link } from 'react-router-dom'
import { AttendanceGrid } from './AttendanceGrid'
import { Avatar } from './Avatar'
import { useData } from '../context/DataContext'
import { formatDay, formatDayLong, formatDayRange, lastPlayingWeek, todayISO } from '../lib/dates'
import { buildLeaderboard, matchesInRange, membersPresentInRange } from '../lib/stats'

export function WeekRecap() {
  const { matches, players } = useData()
  const today = todayISO()
  const { start, end } = lastPlayingWeek()
  const weekMatches = matchesInRange(matches, start, end)
  const present = membersPresentInRange(weekMatches, players, start, end)
  const days = [...new Set(weekMatches.map((match) => match.played_on))].sort((a, b) => (a < b ? 1 : -1))
  const rows = buildLeaderboard(players, weekMatches, 'all').filter((row) => row.matches > 0)

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Rest day</p>
        <h1 className="mt-1 text-2xl font-bold">{formatDayLong(today)}</h1>
        <p className="mt-1 text-sm text-[#9bb5a8]">Last week · {formatDayRange(start, end)}</p>
      </header>

      {weekMatches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
          No matches last week. Rest well — play days are Monday to Friday.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-2">
            <Stat label="Matches" value={String(weekMatches.length)} />
            <Stat label="Days" value={String(days.length)} />
            <Stat label="Members" value={String(present.length)} />
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold">Week board</h2>
            <ol className="space-y-2">
              {rows.map((row, index) => (
                <li key={row.player.id}>
                  <Link
                    to={`/players/${row.player.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2.5"
                  >
                    <span className="w-6 text-center text-sm font-extrabold text-[#f0c14b]">
                      {index + 1}
                    </span>
                    <Avatar player={row.player} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {row.player.name}
                        {row.player.is_guest ? (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#f0c14b]">
                            Guest
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] text-[#9bb5a8]">
                        {row.wins}W · {row.losses}L · {row.matches} matches · {row.attendanceDays} days
                      </p>
                    </div>
                    <p className="text-right text-sm font-extrabold tabular-nums">{row.winPct}%</p>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">Who played</h2>
            <AttendanceGrid players={present} />
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold">Days</h2>
            <ul className="space-y-2">
              {days.map((day) => {
                const count = weekMatches.filter((match) => match.played_on === day).length
                return (
                  <li key={day}>
                    <Link
                      to={`/history/${day}`}
                      className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"
                    >
                      <p className="font-semibold">{formatDay(day)}</p>
                      <p className="text-sm text-[#9bb5a8]">
                        {count} match{count === 1 ? '' : 'es'}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#143328] px-3 py-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#9bb5a8]">{label}</p>
    </div>
  )
}
