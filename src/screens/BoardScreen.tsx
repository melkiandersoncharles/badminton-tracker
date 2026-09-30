import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { ScreenHeader } from '../components/ScreenHeader'
import { SegmentedControl } from '../components/SegmentedControl'
import { useData } from '../context/DataContext'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { getOperatorId } from '../lib/operator'
import { buildLeaderboard } from '../lib/stats'

export function BoardScreen() {
  const { players, matches } = useData()
  const [scope, setScope] = useState<'all' | 'month'>('month')
  const rows = buildLeaderboard(players, matches, scope)
  const operatorId = getOperatorId()
  const scopeLabel = scope === 'month' ? formatMonthLabel(currentMonthKey()) : 'All time'

  return (
    <div className="space-y-4">
      <ScreenHeader eyebrow="Standings" title="Board" subtitle={`${scopeLabel} · ranked by RW`} />

      <SegmentedControl
        value={scope}
        onChange={setScope}
        options={[
          { value: 'month', label: formatMonthLabel(currentMonthKey()) },
          { value: 'all', label: 'All time' },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState>Add players and matches to fill the board.</EmptyState>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, index) => {
            const isYou = row.player.id === operatorId
            return (
              <li key={row.player.id}>
                <Link
                  to={`/players/${row.player.id}`}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                    isYou ? 'border border-[#f0c14b]/50 bg-[#14382c]' : 'bg-[#143328]'
                  }`}
                >
                  <span className="w-6 text-center text-sm font-extrabold text-[#f0c14b]">{index + 1}</span>
                  <Avatar player={row.player} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {row.player.name}
                      {isYou ? <span className="ml-2 text-[10px] font-bold text-[#f0c14b]">You</span> : null}
                      {row.player.is_guest ? (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#9bb5a8]">
                          Guest
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-[#9bb5a8]">
                      {row.wins}W · {row.relativeWins}RW · {row.losses}L · {row.matches}M · {row.attendanceDays} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold tabular-nums text-[#f0c14b]">{row.relativeWins}</p>
                    <p className="text-[10px] text-[#9bb5a8]">{row.winPct}%</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
