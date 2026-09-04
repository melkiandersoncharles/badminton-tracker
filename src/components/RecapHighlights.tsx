import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import { PlayerLink } from './PlayerLink'
import type { RecapPeriod } from '../lib/dates'
import type { PairRow } from '../lib/stats'
import type { LeaderboardRow } from '../lib/types'

export function RecapHighlights({
  period,
  performer,
  pair,
}: {
  period: RecapPeriod
  performer: LeaderboardRow | null
  pair: PairRow | null
}) {
  const title = period.kind === 'week' ? 'Last week’s best' : 'Yesterday’s best'

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-[#9bb5a8]">{period.label}</p>
      </div>

      {!performer && !pair ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-6 text-center text-sm text-[#9bb5a8]">
          No matches in that stretch yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {performer ? (
            <PlayerLink player={performer.player} className="block">
              <article className="rounded-3xl border border-[#f0c14b]/40 bg-[#14382c] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0c14b]">
                  Best performer
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar player={performer.player} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{performer.player.name}</p>
                    <p className="text-sm text-[#9bb5a8]">
                      {performer.wins}W · {performer.losses}L · {performer.winPct}%
                    </p>
                  </div>
                </div>
              </article>
            </PlayerLink>
          ) : null}

          {pair ? (
            <article className="rounded-3xl border border-[#f0c14b]/40 bg-[#14382c] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0c14b]">Best pair</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar player={pair.a} size="md" />
                  <Avatar player={pair.b} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    <Link to={`/players/${pair.a.id}`}>{pair.a.name}</Link>
                    <span className="text-[#9bb5a8]"> + </span>
                    <Link to={`/players/${pair.b.id}`}>{pair.b.name}</Link>
                  </p>
                  <p className="text-sm text-[#9bb5a8]">
                    {pair.wins} win{pair.wins === 1 ? '' : 's'} together · {pair.together} match
                    {pair.together === 1 ? '' : 'es'}
                  </p>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      )}
    </section>
  )
}
