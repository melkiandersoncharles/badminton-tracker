import { formatMonthLabel } from '../lib/dates'
import { monthlyAttendanceForPlayer } from '../lib/stats'
import type { Match } from '../lib/types'
import { AttendanceCalendar } from './AttendanceCalendar'

export function PlayerAttendance({ playerId, matches }: { playerId: string; matches: Match[] }) {
  const monthlyRows = monthlyAttendanceForPlayer(playerId, matches)
  const totalDays = monthlyRows.reduce((sum, row) => sum + row.days, 0)

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-[#143328] p-4">
        <AttendanceCalendar playerId={playerId} matches={matches} />
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
