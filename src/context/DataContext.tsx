import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createMatch as apiCreateMatch,
  createPlayer as apiCreatePlayer,
  createShuttleBox as apiCreateShuttleBox,
  dataMode,
  deleteMatch as apiDeleteMatch,
  deletePlayer as apiDeletePlayer,
  fetchMatches,
  fetchPlayers,
  fetchShuttleBoxes,
  updatePlayer as apiUpdatePlayer,
  updateShuttleBox as apiUpdateShuttleBox,
} from '../lib/api'
import { SHUTTLES_PER_BOX, clubOpenBoxes } from '../lib/types'
import type { Match, MatchDraft, Player, PlayerDraft, ShuttleBox } from '../lib/types'

type DataContextValue = {
  ready: boolean
  mode: 'supabase' | 'local'
  error: string | null
  shuttleError: string | null
  players: Player[]
  matches: Match[]
  shuttleBoxes: ShuttleBox[]
  refresh: () => Promise<void>
  addPlayer: (draft: PlayerDraft) => Promise<void>
  editPlayer: (
    id: string,
    patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
  ) => Promise<void>
  removePlayer: (id: string) => Promise<void>
  addMatch: (draft: MatchDraft) => Promise<void>
  removeMatch: (id: string) => Promise<void>
  addShuttleBox: () => Promise<void>
  closeShuttleBox: (boxId: string) => Promise<void>
  setClubHolder: (holderId: string | null) => Promise<void>
  useShuttle: (boxId: string) => Promise<void>
  undoShuttle: (boxId: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function isMissingShuttleTable(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /shuttle_boxes/i.test(message) && /does not exist|schema cache|could not find/i.test(message)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shuttleError, setShuttleError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [shuttleBoxes, setShuttleBoxes] = useState<ShuttleBox[]>([])

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
          isMissingShuttleTable(err)
            ? 'Shuttle table is missing. Run supabase/shuttle.sql in the Supabase SQL Editor, then refresh.'
            : err instanceof Error
              ? err.message
              : 'Could not load shuttle boxes',
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
      await apiCreatePlayer(draft)
      await refresh()
    },
    [refresh],
  )

  const editPlayer = useCallback(
    async (
      id: string,
      patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
    ) => {
      await apiUpdatePlayer(id, patch)
      await refresh()
    },
    [refresh],
  )

  const removePlayer = useCallback(
    async (id: string) => {
      await apiDeletePlayer(id)
      await refresh()
    },
    [refresh],
  )

  const addMatch = useCallback(
    async (draft: MatchDraft) => {
      await apiCreateMatch(draft)
      await refresh()
    },
    [refresh],
  )

  const removeMatch = useCallback(
    async (id: string) => {
      await apiDeleteMatch(id)
      await refresh()
    },
    [refresh],
  )

  const addShuttleBox = useCallback(async () => {
    try {
      const latest = await fetchShuttleBoxes()
      const holderId = clubOpenBoxes(latest)[0]?.holder_id ?? null
      await apiCreateShuttleBox(holderId)
      await refresh()
    } catch (err) {
      setShuttleError(
        isMissingShuttleTable(err)
          ? 'Shuttle table is missing. Run supabase/shuttle.sql in the Supabase SQL Editor, then refresh.'
          : err instanceof Error
            ? err.message
            : 'Could not add a shuttle box',
      )
    }
  }, [refresh])

  const closeShuttleBox = useCallback(
    async (boxId: string) => {
      await apiUpdateShuttleBox(boxId, { closed_at: new Date().toISOString() })
      await refresh()
    },
    [refresh],
  )

  const setClubHolder = useCallback(
    async (holderId: string | null) => {
      const open = clubOpenBoxes(shuttleBoxes)
      await Promise.all(open.map((box) => apiUpdateShuttleBox(box.id, { holder_id: holderId })))
      await refresh()
    },
    [refresh, shuttleBoxes],
  )

  const useShuttle = useCallback(
    async (boxId: string) => {
      const box = shuttleBoxes.find((item) => item.id === boxId)
      if (!box || box.closed_at || box.used >= SHUTTLES_PER_BOX) return
      await apiUpdateShuttleBox(boxId, { used: box.used + 1 })
      await refresh()
    },
    [refresh, shuttleBoxes],
  )

  const undoShuttle = useCallback(
    async (boxId: string) => {
      const box = shuttleBoxes.find((item) => item.id === boxId)
      if (!box || box.used <= 0) return
      await apiUpdateShuttleBox(boxId, { used: box.used - 1, closed_at: null })
      await refresh()
    },
    [refresh, shuttleBoxes],
  )

  const value = useMemo(
    () => ({
      ready,
      mode: dataMode,
      error,
      shuttleError,
      players,
      matches,
      shuttleBoxes,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
      addShuttleBox,
      closeShuttleBox,
      setClubHolder,
      useShuttle,
      undoShuttle,
    }),
    [
      ready,
      error,
      shuttleError,
      players,
      matches,
      shuttleBoxes,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
      addShuttleBox,
      closeShuttleBox,
      setClubHolder,
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
