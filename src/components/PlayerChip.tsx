import type { Player } from '../lib/types'
import { Avatar } from './Avatar'

export function PlayerChip({
  player,
  selected = false,
  disabled = false,
  onClick,
}: {
  player: Player
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-[4.6rem] flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center ${
        selected
          ? 'bg-[#f0c14b] text-[#0c1f18]'
          : disabled
            ? 'opacity-35'
            : 'bg-[#1c4a3a] text-ink'
      }`}
    >
      <Avatar player={player} size="md" className={selected ? 'ring-[#0c1f18]/30' : ''} />
      <span className="line-clamp-2 w-full text-[11px] font-semibold leading-tight">
        {player.name}
      </span>
      {player.is_guest ? (
        <span className={`text-[9px] font-bold uppercase tracking-wider ${selected ? 'text-[#0c1f18]/70' : 'text-[#f0c14b]'}`}>
          Guest
        </span>
      ) : null}
    </button>
  )
}
