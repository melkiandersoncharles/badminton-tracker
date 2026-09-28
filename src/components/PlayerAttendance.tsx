import { useMemo, useState } from 'react'
import {
  calendarCellsForMonth,
  currentMonthKey,
  formatDay,
  formatMonthLabel,
  weekdayLabels,
} from '../lib/dates'
import {
  attendanceDaysForPlayerInMonth,
  monthlyAttendanceForPlayer,
  monthKeysForPlayer,
} from '../lib/stats'
import type { Match } from '../lib/types'

export function PlayerAttendance({ playerId, matches }: { playerId: string; matches: Match[] }) {
  const currentMonth = currentMonthKey()
  const months = useMemo(() => {
    const keys = new Set(monthKeysForPlayer(playerId, matches))
    keys.add(currentMonth)
    return [...keys].sort((a, b) => b.localeCompare(a))
  }, [playerId, matches, currentMonth])

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const attendedDays = attendanceDaysForPlayerInMonth(playerId, matches, selectedMonth)
  const cells = calendarCellsForMonth(selectedMonth)
  const monthlyRows = monthlyAttendanceForPlayer(playerId, matches)
  const totalDays = monthlyRows.reduce((sum, row) => sum + row.days, 0)

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl bg-[#143328] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Attendance calendar</h2>
            <p className="mt-0.5 text-xs text-[#9bb5a8]">
              {attendedDays.size} {attendedDays.size === 1 ? 'day' : 'days'} in {formatMonthLabel(selectedMonth)}
            </p>
          </div>
        </div>

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

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9bb5a8]">
          {weekdayLabels().map((label) => (
            <div key={label} className="py-1">{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell.date || cell.day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const attended = attendedDays.has(cell.date)
            return (
              <div
                key={cell.date}
                title={attended ? formatDay(cell.date) : undefined}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
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
      </section>

      <section className="overflow-x-auto rounded-2xl bg-[#143328]">
        <div className="border-b border-[#d7ecd0]/10 px-3 py-2.5">
          <h2 className="text-base font-bold">Attendance by month</h2>
          <p className="text-xs text-[#9bb5a8]">{totalDays} days overall</p>
        </div>
        {monthlyRows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[#9bb5a8]">No attendance recorded yet.</p>
        ) : (
          <table className="w-full min-w-[240px] text-sm">
            <thead>
              <tr className="border-b border-[#d7ecd0]/10 text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
                <th className="px-3 py-2.5 text-left">Month</th>
                <th className="px-3 py-2.5 text-right">Days</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.month} className="border-t border-[#d7ecd0]/5">
                  <td className="px-3 py-2.5">{formatMonthLabel(row.month)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{row.days}</td>
                </tr>
              ))}
              <tr className="border-t border-[#d7ecd0]/15 font-semibold text-[#f0c14b]">
                <td className="px-3 py-2.5">Overall</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{totalDays}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
