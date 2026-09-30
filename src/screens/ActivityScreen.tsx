import { BackLink } from '../components/BackLink'
import { EmptyState } from '../components/EmptyState'
import { ScreenHeader } from '../components/ScreenHeader'
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
      <BackLink to="/team" label="Team board" />

      <ScreenHeader
        eyebrow="Audit"
        title="Activity"
        subtitle="Who did what, and when"
        actions={
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-full bg-[#0c1f18]/60 px-3 py-1.5 text-xs font-bold text-[#9bb5a8]"
          >
            Refresh
          </button>
        }
      />

      {activityError ? (
        <p className="rounded-2xl bg-red-900/40 px-4 py-3 text-sm text-red-100">{activityError}</p>
      ) : null}

      {activities.length === 0 ? (
        <EmptyState>No activity yet. Changes will show up here once members start using the app.</EmptyState>
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
                <p className="mt-1 text-[11px] text-[#9bb5a8]">by {actor ?? 'unknown'}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
