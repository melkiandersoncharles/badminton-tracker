import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { useData } from '../context/DataContext'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { buildAttendance, monthKeysFromMatches } from '../lib/stats'

export function AttendanceScreen() {
  const { players, matches } = useData()
  const currentMonth = currentMonthKey()
  const months = useMemo(() => {
    const keys = new Set(monthKeysFromMatches(matches))
    keys.add(currentMonth)
    return [...keys].sort((a, b) => b.localeCompare(a))
  }, [matches, currentMonth])

  const [filter, setFilter] = useState<string>(currentMonth)
  const rows = buildAttendance(players, matches, filter)
  const presentCount = rows.filter((row) => row.days > 0).length

  const periodLabel =
    filter === 'all' ? 'Overall' : formatMonthLabel(filter)

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Members</p>
        <h1 className="mt-1 text-2xl font-bold">Attendance</h1>
        <p className="mt-1 text-sm text-[#9bb5a8]">
          {presentCount} of {rows.length} members · {periodLabel}
        </p>
      </header>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#9bb5a8]">
          Period
        </span>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full rounded-2xl border border-[#d7ecd0]/15 bg-[#143328] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#f0c14b]"
        >
          {months.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key)}
              {key === currentMonth ? ' (current)' : ''}
            </option>
          ))}
          <option value="all">Overall</option>
        </select>
      </label>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-10 text-center text-sm text-[#9bb5a8]">
          Add members to track attendance.
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.player.id}>
              <Link
                to={`/players/${row.player.id}`}
                className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2.5"
              >
                <span className="w-6 text-center text-sm font-extrabold text-[#f0c14b]">{index + 1}</span>
                <Avatar player={row.player} size="md" />
                <p className="min-w-0 flex-1 truncate font-semibold">{row.player.name}</p>
                <p className="text-right text-sm font-extrabold tabular-nums">
                  {row.days}
                  <span className="ml-1 text-[11px] font-semibold text-[#9bb5a8]">
                    {row.days === 1 ? 'day' : 'days'}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
