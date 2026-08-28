import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { MatchCard } from '../components/MatchCard'
import { useData } from '../context/DataContext'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { matchesForPlayer, partnerStats, playerById, statsForPlayer } from '../lib/stats'
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

  const allTime = statsForPlayer(player.id, matches, 'all')
  const month = statsForPlayer(player.id, matches, 'month')
  const games = matchesForPlayer(player.id, matches)
  const partners = partnerStats(player.id, matches, players).slice(0, 5)

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

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[#9bb5a8]">All time</h2>
        <StatGrid stats={allTime} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[#9bb5a8]">{formatMonthLabel(currentMonthKey())}</h2>
        <StatGrid stats={month} />
      </section>

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

function StatGrid({ stats }: { stats: PlayerStat }) {
  const cells = [
    { label: 'Wins', value: String(stats.wins) },
    { label: 'Losses', value: String(stats.losses) },
    { label: 'Matches', value: String(stats.matches) },
    { label: 'Win %', value: `${stats.winPct}%` },
    { label: 'Days in', value: String(stats.attendanceDays) },
  ]
  return (
    <dl className="grid grid-cols-3 gap-2">
      {cells.map((cell) => (
        <div key={cell.label} className="rounded-2xl bg-[#143328] px-3 py-3 text-center">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9bb5a8]">{cell.label}</dt>
          <dd className="mt-1 text-xl font-extrabold tabular-nums">{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}
