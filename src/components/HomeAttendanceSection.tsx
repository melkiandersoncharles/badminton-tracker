import { useMemo, useState } from 'react'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { monthKeysForPlayer } from '../lib/stats'
import type { Match } from '../lib/types'
import { AttendanceCalendar } from './AttendanceCalendar'
import { CourtUtilization } from './CourtUtilization'

export function HomeAttendanceSection({ playerId, matches }: { playerId: string; matches: Match[] }) {
  const currentMonth = currentMonthKey()
  const months = useMemo(() => {
    const keys = new Set(monthKeysForPlayer(playerId, matches))
    keys.add(currentMonth)
    return [...keys].sort((a, b) => b.localeCompare(a))
  }, [playerId, matches, currentMonth])

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  return (
    <section className="rounded-2xl bg-[#143328] p-4">
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
          Month
        </span>
        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="w-full rounded-xl border border-[#d7ecd0]/15 bg-[#0c1f18] px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#f0c14b]"
        >
          {months.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key)}
              {key === currentMonth ? ' (current)' : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] items-start gap-3">
        <AttendanceCalendar
          playerId={playerId}
          matches={matches}
          month={selectedMonth}
          hideMonthPicker
          large
        />
        <CourtUtilization playerId={playerId} matches={matches} month={selectedMonth} embedded compact />
      </div>
    </section>
  )
}
