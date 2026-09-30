import { Link } from 'react-router-dom'
import { calendarCellsForMonth, formatDay, weekdayLabels } from '../lib/dates'
import { membersPresentForDay } from '../lib/stats'
import type { Match, Player } from '../lib/types'

export function ClubAttendanceCalendar({
  month,
  matches,
  players,
}: {
  month: string
  matches: Match[]
  players: Player[]
}) {
  const cells = calendarCellsForMonth(month)

  return (
    <section className="space-y-3 rounded-2xl bg-[#143328] p-4">
      <div>
        <h2 className="text-sm font-bold">Daily attendance</h2>
        <p className="mt-0.5 text-xs text-[#9bb5a8]">Members present each day</p>
      </div>

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

          const memberCount = membersPresentForDay(matches, players, cell.date).length
          const active = memberCount > 0
          const className = `flex aspect-square flex-col items-center justify-center rounded-lg tabular-nums ${
            active
              ? 'bg-[#2d8a4e] text-white ring-1 ring-[#4ade80]/40'
              : 'bg-[#0c1f18]/60 text-[#6b8f7d]'
          }`

          const label = (
            <>
              <span className="text-[9px] font-semibold leading-none opacity-80">{cell.day}</span>
              {active ? (
                <span className="mt-0.5 text-sm font-extrabold leading-none text-[#f0c14b]">
                  {memberCount}
                </span>
              ) : null}
            </>
          )

          if (active) {
            return (
              <Link
                key={cell.date}
                to={`/history/${cell.date}`}
                title={`${formatDay(cell.date)} · ${memberCount} members`}
                className={`${className} active:opacity-80`}
              >
                {label}
              </Link>
            )
          }

          return (
            <div key={cell.date} className={className}>
              {label}
            </div>
          )
        })}
      </div>
    </section>
  )
}
