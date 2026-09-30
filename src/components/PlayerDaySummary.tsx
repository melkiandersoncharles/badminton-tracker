import { Link } from 'react-router-dom'
import { formatDay, todayISO, yesterdayISO } from '../lib/dates'
import { statsForPlayer, statsForPlayerInRange } from '../lib/stats'
import type { Match, Player, PlayerStat } from '../lib/types'
export function PlayerDaySummary({ player, matches }: { player: Player; matches: Match[] }) {
  const monthStats = statsForPlayer(player.id, matches, 'month')
  const today = todayISO()
  const yesterday = yesterdayISO()
  const todayStats = statsForPlayerInRange(player.id, matches, today, today)
  const yesterdayStats = statsForPlayerInRange(player.id, matches, yesterday, yesterday)

  return (
    <>
      <div className="grid grid-cols-5 gap-1.5">
        <StatPill label="M" value={monthStats.matches} />
        <StatPill label="W" value={monthStats.wins} />
        <StatPill label="RW" value={monthStats.relativeWins} />
        <StatPill label="L" value={monthStats.losses} />
        <StatPill label="Days" value={monthStats.attendanceDays} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <DayStatusCard
          title="Yesterday"
          subtitle={formatDay(yesterday)}
          date={yesterday}
          playerId={player.id}
          stats={yesterdayStats}
        />
        <DayStatusCard
          title="Today"
          subtitle={formatDay(today)}
          date={today}
          playerId={player.id}
          stats={todayStats}
        />
      </div>
    </>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#0c1f18]/50 px-2 py-2.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9bb5a8]">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold tabular-nums">{value}</p>
    </div>
  )
}

function DayStatusCard({
  title,
  subtitle,
  date,
  playerId,
  stats,
}: {
  title: string
  subtitle: string
  date: string
  playerId: string
  stats: PlayerStat
}) {
  const className = 'rounded-2xl bg-[#0c1f18]/50 px-3 py-2.5'
  const content = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#f0c14b]">{title}</p>
      <p className="text-[11px] text-[#9bb5a8]">{subtitle}</p>
      {stats.matches > 0 ? (
        <p className="mt-1.5 text-xs font-semibold tabular-nums">
          {stats.matches}M · {stats.wins}W · {stats.relativeWins}RW
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-[#9bb5a8]">Didn&apos;t play</p>
      )}
    </>
  )

  if (stats.matches > 0) {
    return (
      <Link to={`/history/${date}?player=${playerId}`} className={`${className} block active:opacity-80`}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
