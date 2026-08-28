import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createMatch as apiCreateMatch,
  createPlayer as apiCreatePlayer,
  dataMode,
  deleteMatch as apiDeleteMatch,
  deletePlayer as apiDeletePlayer,
  fetchMatches,
  fetchPlayers,
  updatePlayer as apiUpdatePlayer,
} from '../lib/api'
import type { Match, MatchDraft, Player, PlayerDraft } from '../lib/types'

type DataContextValue = {
  ready: boolean
  mode: 'supabase' | 'local'
  error: string | null
  players: Player[]
  matches: Match[]
  refresh: () => Promise<void>
  addPlayer: (draft: PlayerDraft) => Promise<void>
  editPlayer: (
    id: string,
    patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
  ) => Promise<void>
  removePlayer: (id: string) => Promise<void>
  addMatch: (draft: MatchDraft) => Promise<void>
  removeMatch: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  const refresh = useCallback(async () => {
    try {
      const [nextPlayers, nextMatches] = await Promise.all([fetchPlayers(), fetchMatches()])
      setPlayers(nextPlayers)
      setMatches(nextMatches)
      setError(null)
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

  const value = useMemo(
    () => ({
      ready,
      mode: dataMode,
      error,
      players,
      matches,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
    }),
    [
      ready,
      error,
      players,
      matches,
      refresh,
      addPlayer,
      editPlayer,
      removePlayer,
      addMatch,
      removeMatch,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
