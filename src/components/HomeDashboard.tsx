import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { dashboardMonthLabel, moreStatsPeriods } from '../lib/playerPeriods'
import { ActionButtons } from './ActionButtons'
import { HomeAttendanceSection } from './HomeAttendanceSection'
import { Avatar } from './Avatar'
import { PlayerDaySummary } from './PlayerDaySummary'
import { PlayerStatTable } from './PlayerStatTable'
import { switchOperator } from '../lib/operator'
import { leaderboardRank } from '../lib/stats'
import type { Match, Player } from '../lib/types'

export function HomeDashboard({
  player,
  players,
  matches,
  children,
}: {
  player: Player
  players: Player[]
  matches: Match[]
  children?: ReactNode
}) {
  const monthLabel = dashboardMonthLabel()
  const rank = leaderboardRank(player.id, players, matches, 'month')
  const periodRows = moreStatsPeriods(player.id, matches)

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[#f0c14b]/40 bg-[#14382c] p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/players/${player.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar player={player} size="lg" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0c14b]">{monthLabel}</p>
              <h2 className="truncate text-xl font-bold">Hi, {player.name}</h2>
              {rank ? (
                <p className="text-sm text-[#9bb5a8]">
                  Rank <span className="font-bold text-[#f0c14b]">#{rank.rank}</span> of {rank.total}
                </p>
              ) : (
                <p className="text-sm text-[#9bb5a8]">Your month so far</p>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => switchOperator()}
            className="shrink-0 rounded-full bg-[#0c1f18]/60 px-3 py-1.5 text-[11px] font-bold text-[#9bb5a8]"
          >
            Switch
          </button>
        </div>

        <div className="mt-4">
          <PlayerDaySummary player={player} matches={matches} />
        </div>

        <div className="mt-3">
          <ActionButtons primary={{ to: '/match/new', label: 'Add match' }} secondary={{ to: '/team', label: 'Team board' }} />
        </div>
      </section>

      {children}

      <PlayerStatTable rows={periodRows} title="More stats" />

      <HomeAttendanceSection playerId={player.id} matches={matches} />
    </div>
  )
}
