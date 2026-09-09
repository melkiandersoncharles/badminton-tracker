import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { MatchCard } from '../components/MatchCard'
import { useData } from '../context/DataContext'
import {
  currentPlayingWeek,
  formatDay,
  formatDayRange,
  formatMonthLabel,
  previousPlayingWeek,
  todayISO,
  yesterdayISO,
} from '../lib/dates'
import {
  matchesForPlayer,
  monthKeysForPlayer,
  partnerStats,
  playerById,
  statsForPlayer,
  statsForPlayerInMonth,
  statsForPlayerInRange,
} from '../lib/stats'
import type { PlayerStat } from '../lib/types'

export function PlayerProfileScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, matches } = useData()
  const player = id ? playerById(players, id) : undefined

  if (!id || !player) {
    return (
      <div className="space-y-3">
        <button type="button" className="text-xs font-semibold text-[#f0c14b]" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p className="text-sm text-[#9bb5a8]">Player not found.</p>
      </div>
    )
  }

  const today = todayISO()
  const yesterday = yesterdayISO()
  const thisWeek = currentPlayingWeek()
  const lastWeek = previousPlayingWeek()
  const months = monthKeysForPlayer(player.id, matches)

  const allTime = statsForPlayer(player.id, matches, 'all')
  const games = matchesForPlayer(player.id, matches)
  const partners = partnerStats(player.id, matches, players).slice(0, 5)

  const periods: { id: string; title: string; subtitle?: string; stats: PlayerStat }[] = [
    { id: 'all', title: 'All time', stats: allTime },
    {
      id: 'today',
      title: 'Today',
      subtitle: formatDay(today),
      stats: statsForPlayerInRange(player.id, matches, today, today),
    },
    {
      id: 'yesterday',
      title: 'Yesterday',
      subtitle: formatDay(yesterday),
      stats: statsForPlayerInRange(player.id, matches, yesterday, yesterday),
    },
    {
      id: 'this-week',
      title: 'This week',
      subtitle: formatDayRange(thisWeek.start, thisWeek.end),
      stats: statsForPlayerInRange(player.id, matches, thisWeek.start, thisWeek.end),
    },
    {
      id: 'last-week',
      title: 'Last week',
      subtitle: formatDayRange(lastWeek.start, lastWeek.end),
      stats: statsForPlayerInRange(player.id, matches, lastWeek.start, lastWeek.end),
    },
    ...months.map((key) => ({
      id: key,
      title: formatMonthLabel(key),
      stats: statsForPlayerInMonth(player.id, matches, key),
    })),
  ]

  return (
    <div className="space-y-5">
      <button type="button" className="text-xs font-semibold text-[#f0c14b]" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <header className="flex items-center gap-4">
        <Avatar player={player} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{player.name}</h1>
          <p className="text-sm text-[#9bb5a8]">{player.is_guest ? 'Guest' : 'Member'}</p>
        </div>
      </header>

      <StatTable rows={periods} />

      {partners.length > 0 ? (
        <section>
          <h2 className="mb-2 text-base font-bold">Frequent partners</h2>
          <ul className="space-y-2">
            {partners.map((row) => (
              <li key={row.player.id}>
                <Link
                  to={`/players/${row.player.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2"
                >
                  <Avatar player={row.player} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{row.player.name}</p>
                    <p className="text-[11px] text-[#9bb5a8]">
                      {row.together} together · {row.wins} wins
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-base font-bold">Matches</h2>
        {games.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-6 text-sm text-[#9bb5a8]">
            No matches yet for {player.name}.
          </p>
        ) : (
          games.map((match) => <MatchCard key={match.id} match={match} highlightId={player.id} />)
        )}
      </section>
    </div>
  )
}

function StatTable({
  rows,
}: {
  rows: { id: string; title: string; subtitle?: string; stats: PlayerStat }[]
}) {
  return (
    <section className="overflow-x-auto rounded-2xl bg-[#143328]">
      <table className="w-full min-w-[300px] text-sm">
        <thead>
          <tr className="border-b border-[#d7ecd0]/10 text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
            <th className="px-3 py-2.5 text-left">Period</th>
            <th className="px-2 py-2.5 text-right">W</th>
            <th className="px-2 py-2.5 text-right">L</th>
            <th className="px-2 py-2.5 text-right">M</th>
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
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.wins}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.losses}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.matches}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.stats.winPct}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{row.stats.attendanceDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
