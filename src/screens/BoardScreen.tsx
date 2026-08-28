import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { useData } from '../context/DataContext'
import { currentMonthKey, formatMonthLabel } from '../lib/dates'
import { buildLeaderboard } from '../lib/stats'

export function BoardScreen() {
  const { players, matches } = useData()
  const [scope, setScope] = useState<'all' | 'month'>('all')
  const rows = buildLeaderboard(players, matches, scope)

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Standings</p>
        <h1 className="mt-1 text-2xl font-bold">Board</h1>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#143328] p-1">
        <button
          type="button"
          onClick={() => setScope('all')}
          className={`rounded-xl py-2.5 text-sm font-bold ${
            scope === 'all' ? 'bg-[#f0c14b] text-[#0c1f18]' : 'text-[#9bb5a8]'
          }`}
        >
          All time
        </button>
        <button
          type="button"
          onClick={() => setScope('month')}
          className={`rounded-xl py-2.5 text-sm font-bold ${
            scope === 'month' ? 'bg-[#f0c14b] text-[#0c1f18]' : 'text-[#9bb5a8]'
          }`}
        >
          {formatMonthLabel(currentMonthKey())}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-10 text-center text-sm text-[#9bb5a8]">
          Add players and matches to fill the board.
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.player.id}>
              <Link
                to={`/players/${row.player.id}`}
                className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2.5"
              >
              <span className="w-6 text-center text-sm font-extrabold text-[#f0c14b]">{index + 1}</span>
              <Avatar player={row.player} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {row.player.name}
                  {row.player.is_guest ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#f0c14b]">
                      Guest
                    </span>
                  ) : null}
                </p>
                <p className="text-[11px] text-[#9bb5a8]">
                  {row.wins}W · {row.losses}L · {row.matches} matches · {row.attendanceDays} days
                </p>
              </div>
              <p className="text-right text-sm font-extrabold tabular-nums">{row.winPct}%</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
