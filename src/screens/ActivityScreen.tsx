import { useData } from '../context/DataContext'
import { formatDateTime } from '../lib/dates'

const ACTION_LABELS: Record<string, string> = {
  sign_in: 'Signed in',
  match_add: 'Match added',
  match_delete: 'Match removed',
  player_add: 'Player added',
  player_edit: 'Player updated',
  player_delete: 'Player removed',
  shuttle_add: 'Shuttle box opened',
  shuttle_close: 'Shuttle box closed',
  shuttle_holder: 'Shuttle holder changed',
  shuttle_use: 'Shuttle used',
  shuttle_undo: 'Shuttle undone',
}

export function ActivityScreen() {
  const { activities, activityError, players, refresh } = useData()
  const playerMap = new Map(players.map((player) => [player.id, player.name]))

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Audit</p>
          <h1 className="mt-1 text-2xl font-bold">Activity</h1>
          <p className="mt-1 text-sm text-[#9bb5a8]">Who did what, and when.</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="shrink-0 rounded-full bg-[#1c4a3a] px-3 py-1.5 text-xs font-bold text-ink"
        >
          Refresh
        </button>
      </header>

      {activityError ? (
        <p className="rounded-2xl bg-red-900/40 px-4 py-3 text-sm text-red-100">{activityError}</p>
      ) : null}

      {activities.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-10 text-center text-sm text-[#9bb5a8]">
          No activity yet. Changes will show up here once members start using the app.
        </p>
      ) : (
        <ul className="space-y-2">
          {activities.map((entry) => {
            const actor = entry.actor_id ? playerMap.get(entry.actor_id) : null
            return (
              <li key={entry.id} className="rounded-2xl bg-[#143328] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#f0c14b]">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </p>
                  <time className="shrink-0 text-[11px] text-[#9bb5a8]">
                    {formatDateTime(entry.created_at)}
                  </time>
                </div>
                <p className="mt-1 text-sm">{entry.details}</p>
                {actor ? (
                  <p className="mt-1 text-[11px] text-[#9bb5a8]">by {actor}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#9bb5a8]">by unknown</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
