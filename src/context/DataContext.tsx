import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createMatch as apiCreateMatch,
  createPlayer as apiCreatePlayer,
  createShuttleBox as apiCreateShuttleBox,
  dataMode,
  deleteMatch as apiDeleteMatch,
  deletePlayer as apiDeletePlayer,
  fetchActivities,
  fetchMatches,
  fetchPlayers,
  fetchShuttleBoxes,
  logActivity,
  updatePlayer as apiUpdatePlayer,
  updateShuttleBox as apiUpdateShuttleBox,
} from '../lib/api'
import { SHUTTLES_PER_BOX } from '../lib/types'
import type { ActivityEntry, Match, MatchDraft, Player, PlayerDraft, ShuttleBox } from '../lib/types'

type DataContextValue = {
  ready: boolean
  mode: 'supabase' | 'local'
  error: string | null
  shuttleError: string | null
  activityError: string | null
  players: Player[]
  matches: Match[]
  shuttleBoxes: ShuttleBox[]
  activities: ActivityEntry[]
  refresh: () => Promise<void>
  addPlayer: (draft: PlayerDraft) => Promise<Player>
  editPlayer: (
    id: string,
    patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
  ) => Promise<void>
  removePlayer: (id: string) => Promise<void>
  addMatch: (draft: MatchDraft) => Promise<void>
  removeMatch: (id: string) => Promise<void>
  addShuttleBox: (holderId: string) => Promise<void>
  closeShuttleBox: (boxId: string) => Promise<void>
  setBoxHolder: (boxId: string, holderId: string | null) => Promise<void>
  useShuttle: (boxId: string) => Promise<void>
  undoShuttle: (boxId: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function isMissingTable(err: unknown, table: string): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return new RegExp(table, 'i').test(message) && /does not exist|schema cache|could not find/i.test(message)
}

function playerName(players: Player[], id: string): string {
  return players.find((player) => player.id === id)?.name ?? 'Unknown'
}

function matchSummary(players: Player[], draft: MatchDraft): string {
  const a1 = playerName(players, draft.team_a_1)
  const a2 = playerName(players, draft.team_a_2)
  const b1 = playerName(players, draft.team_b_1)
  const b2 = playerName(players, draft.team_b_2)
  return `Court ${draft.court} · ${a1} & ${a2} ${draft.score_a}–${draft.score_b} ${b1} & ${b2}`
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shuttleError, setShuttleError] = useState<string | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [shuttleBoxes, setShuttleBoxes] = useState<ShuttleBox[]>([])
  const [activities, setActivities] = useState<ActivityEntry[]>([])

  const refresh = useCallback(async () => {
    try {
      const [nextPlayers, nextMatches] = await Promise.all([fetchPlayers(), fetchMatches()])
      setPlayers(nextPlayers)
      setMatches(nextMatches)
      setError(null)

      try {
        const nextBoxes = await fetchShuttleBoxes()
        setShuttleBoxes(nextBoxes)
        setShuttleError(null)
      } catch (err) {
        setShuttleBoxes([])
        setShuttleError(
          isMissingTable(err, 'shuttle_boxes')
            ? 'Shuttle table is missing. Run supabase/shuttle.sql in the Supabase SQL Editor, then refresh.'
            : err instanceof Error
              ? err.message
              : 'Could not load shuttle boxes',
        )
      }

      try {
        const nextActivities = await fetchActivities()
        setActivities(nextActivities)
        setActivityError(null)
      } catch (err) {
        setActivities([])
        setActivityError(
          isMissingTable(err, 'activity_log')
            ? 'Activity table is missing. Run supabase/activity.sql in the Supabase SQL Editor, then refresh.'
            : err instanceof Error
              ? err.message
              : 'Could not load activity',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load data')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onVis = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [refresh])

  const addPlayer = useCallback(
    async (draft: PlayerDraft) => {
      const player = await apiCreatePlayer(draft)
      await logActivity('player_add', `Added ${draft.is_guest ? 'guest' : 'member'} ${draft.name}`)
      await refresh()
      return player
    },
    [refresh],
  )

  const editPlayer = useCallback(
    async (
      id: string,
      patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
    ) => {
      const before = players.find((player) => player.id === id)
      await apiUpdatePlayer(id, patch)
      const label = patch.name ?? before?.name ?? 'player'
      const kind = (patch.is_guest ?? before?.is_guest) ? 'guest' : 'member'
      await logActivity('player_edit', `Updated ${kind} ${label}`)
      await refresh()
    },
    [players, refresh],
  )

  const removePlayer = useCallback(
    async (id: string) => {
      const before = players.find((player) => player.id === id)
      await apiDeletePlayer(id)
      await logActivity('player_delete', `Removed ${before?.name ?? 'player'}`)
      await refresh()
    },
    [players, refresh],
  )

  const addMatch = useCallback(
    async (draft: MatchDraft) => {
      await apiCreateMatch(draft)
      await logActivity('match_add', matchSummary(players, draft))
      await refresh()
    },
    [players, refresh],
  )

  const removeMatch = useCallback(
    async (id: string) => {
      const before = matches.find((match) => match.id === id)
      if (before) {
        await logActivity('match_delete', matchSummary(players, before))
      }
      await apiDeleteMatch(id)
      await refresh()
    },
    [matches, players, refresh],
  )

  const addShuttleBox = useCallback(
    async (holderId: string) => {
      try {
        await apiCreateShuttleBox(holderId)
        await logActivity('shuttle_add', `Opened box for ${playerName(players, holderId)}`)
        await refresh()
      } catch (err) {
        setShuttleError(
          isMissingTable(err, 'shuttle_boxes')
            ? 'Shuttle table is missing. Run supabase/shuttle.sql in the Supabase SQL Editor, then refresh.'
            : err instanceof Error
              ? err.message
              : 'Could not add a shuttle box',
        )
      }
    },
    [players, refresh],
  )

  const closeShuttleBox = useCallback(
    async (boxId: string) => {
      const box = shuttleBoxes.find((item) => item.id === boxId)
      const holder = box?.holder_id ? playerName(players, box.holder_id) : 'unassigned'
      await apiUpdateShuttleBox(boxId, { closed_at: new Date().toISOString() })
      await logActivity('shuttle_close', `Closed box held by ${holder}`)
      await refresh()
    },
    [players, refresh, shuttleBoxes],
  )

  const setBoxHolder = useCallback(
    async (boxId: string, holderId: string | null) => {
      const holder = holderId ? playerName(players, holderId) : 'unassigned'
      await apiUpdateShuttleBox(boxId, { holder_id: holderId })
      await logActivity('shuttle_holder', `Assigned box to ${holder}`)
      await refresh()
    },
    [players, refresh],
  )

  const useShuttle = useCallback(
    async (boxId: string) => {
      const box = shuttleBoxes.find((item) => item.id === boxId)
      if (!box || box.closed_at || box.used >= SHUTTLES_PER_BOX) return
      const holder = box.holder_id ? playerName(players, box.holder_id) : 'unassigned'
      await apiUpdateShuttleBox(boxId, { used: box.used + 1 })
      await logActivity('shuttle_use', `Used shuttle from ${holder}'s box (${box.used + 1}/${SHUTTLES_PER_BOX})`)
      await refresh()
    },
    [players, refresh, shuttleBoxes],
  )

  const undoShuttle = useCallback(
    async (boxId: string) => {
      const box = shuttleBoxes.find((item) => item.id === boxId)
      if (!box || box.used <= 0) return
      const holder = box.holder_id ? playerName(players, box.holder_id) : 'unassigned'
      await apiUpdateShuttleBox(boxId, { used: box.used - 1, closed_at: null })
      await logActivity('shuttle_undo', `Undid shuttle on ${holder}'s box`)
      await refresh()
    },
    [players, refresh, shuttleBoxes],
  )

  const value = useMemo(
    () => ({
      ready,
      mode: dataMode,
      error,
      shuttleError,
      activityError,
      players,
      matches,
      shuttleBoxes,
      activities,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
      addShuttleBox,
      closeShuttleBox,
      setBoxHolder,
      useShuttle,
      undoShuttle,
    }),
    [
      ready,
      error,
      shuttleError,
      activityError,
      players,
      matches,
      shuttleBoxes,
      activities,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
      addShuttleBox,
      closeShuttleBox,
      setBoxHolder,
      useShuttle,
      undoShuttle,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
