import { Link } from 'react-router-dom'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { buildLeaderboard, teamMonthStats } from '../lib/stats'
import type { Match, Player } from '../lib/types'

export function TeamMonthStats({ matches, players }: { matches: Match[]; players: Player[] }) {
  const month = currentMonthKey()
  const stats = teamMonthStats(matches, players, month)
  const topThree = buildLeaderboard(players, matches, 'month').slice(0, 3)

  return (
    <section className="rounded-2xl bg-[#143328] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold">
          <span className="text-[#f0c14b]">{formatMonthLabel(month)}</span>
          <span className="text-[#9bb5a8]"> · team</span>
        </p>
        <Link to={`/history/month/${month}`} className="shrink-0 text-[10px] font-semibold text-[#f0c14b]">
          Month →
        </Link>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1">
        <StatPill label="M" value={stats.matches} />
        <StatPill label="Days" value={stats.days} />
        <StatPill label="Players" value={stats.activeMembers} />
      </div>

      {topThree.length > 0 ? (
        <p className="mt-2 truncate text-[10px] text-[#9bb5a8]">
          {topThree.map((row, index) => (
            <span key={row.player.id}>
              {index > 0 ? <span className="text-[#6b8f7d]"> · </span> : null}
              <span className="font-bold text-[#f0c14b]">#{index + 1}</span>{' '}
              <Link to={`/players/${row.player.id}`} className="font-semibold text-white">
                {row.player.name}
              </Link>
              <span className="tabular-nums"> {row.relativeWins}RW</span>
            </span>
          ))}
        </p>
      ) : null}
    </section>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#0c1f18]/50 px-1 py-1.5 text-center">
      <p className="text-[8px] font-bold uppercase tracking-wider text-[#9bb5a8]">{label}</p>
      <p className="text-sm font-extrabold tabular-nums">{value}</p>
    </div>
  )
}
