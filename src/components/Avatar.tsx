import { initials } from '../lib/photo'
import type { Player } from '../lib/types'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, string> = {
  sm: 'h-9 w-9 text-[11px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
}

export function Avatar({
  player,
  size = 'md',
  className = '',
}: {
  player?: Pick<Player, 'name' | 'photo_url'> | null
  size?: Size
  className?: string
}) {
  const name = player?.name ?? '?'
  if (player?.photo_url) {
    return (
      <img
        src={player.photo_url}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-2 ring-[#d7ecd0]/25 ${className}`}
      />
    )
  }
  return (
    <div
      aria-label={name}
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-[#f0c14b] font-bold text-[#0c1f18] ring-2 ring-[#d7ecd0]/20 ${className}`}
    >
      {initials(name)}
    </div>
  )
}
