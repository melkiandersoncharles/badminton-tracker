import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Player } from '../lib/types'

export function PlayerLink({
  player,
  className = '',
  children,
}: {
  player?: Pick<Player, 'id'> | null
  className?: string
  children: ReactNode
}) {
  if (!player) return children
  return (
    <Link to={`/players/${player.id}`} className={className}>
      {children}
    </Link>
  )
}
