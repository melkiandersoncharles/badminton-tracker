import { Link } from 'react-router-dom'
import type { Player } from '../lib/types'
import { Avatar } from './Avatar'

export function AttendanceGrid({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-6 text-center text-sm text-[#9bb5a8]">
        No one marked present yet. Save a match and those four players show up here.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-4 gap-3">
      {players.map((player) => (
        <li key={player.id}>
          <Link to={`/players/${player.id}`} className="flex flex-col items-center gap-1">
            <Avatar player={player} size="md" />
            <span className="line-clamp-2 w-full text-center text-[11px] font-semibold leading-tight">
              {player.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
