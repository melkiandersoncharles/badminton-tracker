import { useData } from '../context/DataContext'
import { playerById } from '../lib/stats'
import type { Match, Player } from '../lib/types'
import { winnerOf } from '../lib/types'
import { Avatar } from './Avatar'
import { PlayerLink } from './PlayerLink'

export function MatchCard({
  match,
  onDelete,
  highlightId,
}: {
  match: Match
  onDelete?: (id: string) => void
  highlightId?: string
}) {
  const { players } = useData()
  const teamA = [
    playerById(players, match.team_a_1),
    playerById(players, match.team_a_2),
  ] as const
  const teamB = [
    playerById(players, match.team_b_1),
    playerById(players, match.team_b_2),
  ] as const
  const winner = winnerOf(match)
  const winnerNames = winner === 'a' ? pairLabel(teamA) : winner === 'b' ? pairLabel(teamB) : null

  return (
    <article className="rounded-2xl border border-[#d7ecd0]/15 bg-[#143328] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        {winnerNames ? (
          <span className="text-[11px] font-semibold text-[#7dce6a]">{winnerNames} won</span>
        ) : (
          <span className="text-[11px] font-semibold text-[#9bb5a8]">Draw</span>
        )}
        {onDelete ? (
          <button
            type="button"
            className="text-[11px] font-medium text-[#9bb5a8]"
            onClick={() => {
              if (confirm('Delete this match?')) onDelete(match.id)
            }}
          >
            Remove
          </button>
        ) : null}
      </div>

      <TeamRow team={teamA} score={match.score_a} won={winner === 'a'} highlightId={highlightId} />
      <p className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0c14b]">vs</p>
      <TeamRow team={teamB} score={match.score_b} won={winner === 'b'} highlightId={highlightId} />
    </article>
  )
}

function pairLabel(team: readonly (Player | undefined)[]): string {
  return `${team[0]?.name ?? '?'} & ${team[1]?.name ?? '?'}`
}

function TeamRow({
  team,
  score,
  won,
  highlightId,
}: {
  team: readonly (Player | undefined)[]
  score: number
  won: boolean
  highlightId?: string
}) {
  const nameClass = `truncate text-sm font-semibold ${won ? 'text-[#7dce6a]' : 'text-ink'}`
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-2 py-2 ${won ? 'bg-[#7dce6a]/15' : 'bg-[#0c1f18]'}`}
    >
      <div className="flex -space-x-2">
        {team.map((player, index) => (
          <PlayerLink key={player?.id ?? index} player={player}>
            <Avatar
              player={player ?? null}
              size="sm"
              className={player?.id === highlightId ? 'ring-[#f0c14b]' : ''}
            />
          </PlayerLink>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <PlayerLink player={team[0]}>
          <p className={nameClass}>{team[0]?.name ?? '?'}</p>
        </PlayerLink>
        <PlayerLink player={team[1]}>
          <p className={nameClass}>{team[1]?.name ?? '?'}</p>
        </PlayerLink>
      </div>
      <p className={`text-2xl font-extrabold tabular-nums ${won ? 'text-[#7dce6a]' : 'text-ink'}`}>
        {score}
      </p>
    </div>
  )
}
