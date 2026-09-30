import { useMemo, useState } from 'react'
import {
  calendarCellsForMonth,
  currentMonthKey,
  formatDay,
  formatMonthLabel,
  weekdayLabels,
} from '../lib/dates'
import { attendanceDaysForPlayerInMonth, monthKeysForPlayer } from '../lib/stats'
import type { Match } from '../lib/types'

export function AttendanceCalendar({
  playerId,
  matches,
  className = '',
  month,
  hideMonthPicker = false,
  compact = false,
  large = false,
}: {
  playerId: string
  matches: Match[]
  className?: string
  month?: string
  hideMonthPicker?: boolean
  compact?: boolean
  large?: boolean
}) {
  const currentMonth = currentMonthKey()
  const months = useMemo(() => {
    const keys = new Set(monthKeysForPlayer(playerId, matches))
    keys.add(currentMonth)
    return [...keys].sort((a, b) => b.localeCompare(a))
  }, [playerId, matches, currentMonth])

  const [internalMonth, setInternalMonth] = useState(currentMonth)
  const selectedMonth = month ?? internalMonth
  const attendedDays = attendanceDaysForPlayerInMonth(playerId, matches, selectedMonth)
  const cells = calendarCellsForMonth(selectedMonth)
  const gapClass = large ? 'gap-1.5' : compact ? 'gap-0.5' : 'gap-1'
  const labelClass = large
    ? 'text-[10px] font-semibold uppercase tracking-wide text-[#9bb5a8]'
    : compact
      ? 'text-[8px] font-semibold uppercase tracking-wide text-[#9bb5a8]'
      : 'text-[10px] font-semibold uppercase tracking-wide text-[#9bb5a8]'
  const dayClass = large ? 'text-sm' : compact ? 'text-[10px]' : 'text-xs'
  const dayRadius = large ? 'rounded-lg' : 'rounded-md'

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <h3 className="text-sm font-bold">Attendance</h3>
        <p className="mt-0.5 text-[10px] text-[#9bb5a8]">
          {attendedDays.size} {attendedDays.size === 1 ? 'day' : 'days'}
        </p>
      </div>

      {hideMonthPicker ? null : (
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
            Month
          </span>
          <select
            value={selectedMonth}
            onChange={(event) => setInternalMonth(event.target.value)}
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
      )}

      <div className={`grid grid-cols-7 ${gapClass} text-center ${labelClass}`}>
        {weekdayLabels().map((label) => (
          <div key={label} className="py-1">{label}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${gapClass}`}>
        {cells.map((cell, index) => {
          if (!cell.date || cell.day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const attended = attendedDays.has(cell.date)
          return (
            <div
              key={cell.date}
              title={attended ? formatDay(cell.date) : undefined}
              className={`flex aspect-square items-center justify-center ${dayRadius} ${dayClass} font-bold tabular-nums ${
                attended
                  ? 'bg-[#2d8a4e] text-white ring-1 ring-[#4ade80]/40'
                  : 'bg-[#0c1f18]/60 text-[#6b8f7d]'
              }`}
            >
              {cell.day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
