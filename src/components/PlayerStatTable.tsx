import type { PlayerStat } from '../lib/types'

export function PlayerStatTable({
  rows,
  title = 'Your stats',
}: {
  rows: { id: string; title: string; subtitle?: string; stats: PlayerStat }[]
  title?: string
}) {
  return (
    <section className="overflow-x-auto rounded-2xl bg-[#143328]">
      <div className="border-b border-[#d7ecd0]/10 px-3 py-2.5">
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <table className="w-full min-w-[300px] text-sm">
        <thead>
          <tr className="border-b border-[#d7ecd0]/10 text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
            <th className="px-3 py-2.5 text-left">Period</th>
            <th className="px-2 py-2.5 text-right">M</th>
            <th className="px-2 py-2.5 text-right">W</th>
            <th className="px-2 py-2.5 text-right">RW</th>
            <th className="px-2 py-2.5 text-right">L</th>
            <th className="px-2 py-2.5 text-right">%</th>
            <th className="px-3 py-2.5 text-right">Days</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={`border-t border-[#d7ecd0]/5 ${index === 0 ? 'font-semibold text-[#f0c14b]' : ''}`}
            >
              <td className="px-3 py-2.5">
                <div>{row.title}</div>
                {row.subtitle ? <div className="text-[10px] font-normal text-[#9bb5a8]">{row.subtitle}</div> : null}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.matches}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.wins}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.relativeWins}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.losses}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.winPct}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{row.stats.attendanceDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
