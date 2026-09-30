import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { BackLink } from '../components/BackLink'
import { PlayerAttendance } from '../components/PlayerAttendance'
import { PlayerMatchesByDay } from '../components/PlayerMatchesByDay'
import { PlayerStatTable } from '../components/PlayerStatTable'
import { useData } from '../context/DataContext'
import { fullProfilePeriods } from '../lib/playerPeriods'
import { getOperatorId } from '../lib/operator'
import { partnerStats, playerById } from '../lib/stats'

export function PlayerProfileScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, matches } = useData()
  const player = id ? playerById(players, id) : undefined
  const operatorId = getOperatorId()
  const isSelf = player?.id === operatorId

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

  const partners = partnerStats(player.id, matches, players).slice(0, 5)
  const periodRows = fullProfilePeriods(player.id, matches)

  return (
    <div className="space-y-4">
      <BackLink to={isSelf ? '/' : '/players'} label={isSelf ? 'Home' : 'Players'} />

      <header className="flex items-center gap-4">
        <Avatar player={player} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{player.name}</h1>
          <p className="text-sm text-[#9bb5a8]">{player.is_guest ? 'Guest' : 'Member'}</p>
        </div>
      </header>

      <PlayerStatTable rows={periodRows} title="Stats" />

      <PlayerAttendance playerId={player.id} matches={matches} />

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

      <section className="space-y-3">
        <h2 className="text-base font-bold">Matches by day</h2>
        <PlayerMatchesByDay playerId={player.id} playerName={player.name} matches={matches} />
      </section>
    </div>
  )
}
