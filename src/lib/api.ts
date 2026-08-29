import { blobToDataUrl, resizeImage } from './photo'
import { isSupabaseConfigured, supabase } from './supabase'
import type { Match, MatchDraft, Player, PlayerDraft, ShuttleBox } from './types'
import { SHUTTLES_PER_BOX } from './types'

const PLAYERS_KEY = 'bt-players'
const MATCHES_KEY = 'bt-matches'
const SHUTTLES_KEY = 'bt-shuttle-boxes'

export const dataMode: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function comparePlayers(a: Player, b: Player): number {
  if (a.is_guest !== b.is_guest) return a.is_guest ? 1 : -1
  return a.name.localeCompare(b.name)
}

function sortPlayerList(players: Player[]): Player[] {
  return [...players].sort(comparePlayers)
}

async function uploadPhoto(playerId: string, file: File): Promise<string> {
  const blob = await resizeImage(file)
  if (supabase) {
    const path = `${playerId}.jpg`
    const { error } = await supabase.storage
      .from('player-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (error) throw error
    const { data } = supabase.storage.from('player-photos').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  }
  return blobToDataUrl(blob)
}

export async function fetchPlayers(): Promise<Player[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('is_guest', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []) as Player[]
  }
  return sortPlayerList(readLocal<Player[]>(PLAYERS_KEY, []))
}

export async function fetchMatches(): Promise<Match[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Match[]
  }
  return readLocal<Match[]>(MATCHES_KEY, []).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )
}

export async function createPlayer(draft: PlayerDraft): Promise<Player> {
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const photo_url = draft.photoFile ? await uploadPhoto(id, draft.photoFile) : null
  const player: Player = {
    id,
    name: draft.name.trim(),
    photo_url,
    is_guest: draft.is_guest,
    created_at,
  }

  if (supabase) {
    const { error } = await supabase.from('players').insert(player)
    if (error) throw error
    return player
  }

  writeLocal(PLAYERS_KEY, sortPlayerList([...readLocal<Player[]>(PLAYERS_KEY, []), player]))
  return player
}

export async function updatePlayer(
  id: string,
  patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
): Promise<void> {
  const updates: Partial<Player> = {}
  if (patch.name !== undefined) updates.name = patch.name.trim()
  if (patch.is_guest !== undefined) updates.is_guest = patch.is_guest
  if (patch.photoFile) updates.photo_url = await uploadPhoto(id, patch.photoFile)

  if (supabase) {
    const { error } = await supabase.from('players').update(updates).eq('id', id)
    if (error) throw error
    return
  }

  const players = readLocal<Player[]>(PLAYERS_KEY, []).map((player) =>
    player.id === id ? { ...player, ...updates } : player,
  )
  writeLocal(PLAYERS_KEY, sortPlayerList(players))
}

export async function deletePlayer(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    PLAYERS_KEY,
    readLocal<Player[]>(PLAYERS_KEY, []).filter((player) => player.id !== id),
  )
}

export async function createMatch(draft: MatchDraft): Promise<Match> {
  const match: Match = {
    id: crypto.randomUUID(),
    played_on: draft.played_on,
    court: draft.court,
    team_a_1: draft.team_a_1,
    team_a_2: draft.team_a_2,
    team_b_1: draft.team_b_1,
    team_b_2: draft.team_b_2,
    score_a: draft.score_a,
    score_b: draft.score_b,
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { error } = await supabase.from('matches').insert(match)
    if (error) throw error
    return match
  }

  writeLocal(MATCHES_KEY, [match, ...readLocal<Match[]>(MATCHES_KEY, [])])
  return match
}

export async function deleteMatch(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('matches').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    MATCHES_KEY,
    readLocal<Match[]>(MATCHES_KEY, []).filter((match) => match.id !== id),
  )
}

function sortBoxes(boxes: ShuttleBox[]): ShuttleBox[] {
  return [...boxes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function fetchShuttleBoxes(): Promise<ShuttleBox[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('shuttle_boxes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ShuttleBox[]
  }
  return sortBoxes(readLocal<ShuttleBox[]>(SHUTTLES_KEY, []))
}

export async function createShuttleBox(holderId: string | null): Promise<ShuttleBox> {
  const box: ShuttleBox = {
    id: crypto.randomUUID(),
    holder_id: holderId,
    used: 0,
    opened_on: new Date().toISOString().slice(0, 10),
    closed_at: null,
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { error } = await supabase.from('shuttle_boxes').insert(box)
    if (error) throw error
    return box
  }

  writeLocal(SHUTTLES_KEY, [box, ...readLocal<ShuttleBox[]>(SHUTTLES_KEY, [])])
  return box
}

export async function updateShuttleBox(
  id: string,
  patch: { used?: number; holder_id?: string | null; closed_at?: string | null },
): Promise<void> {
  const updates: Partial<ShuttleBox> = { ...patch }
  if (updates.used !== undefined) {
    updates.used = Math.max(0, Math.min(SHUTTLES_PER_BOX, updates.used))
  }

  if (supabase) {
    const { error } = await supabase.from('shuttle_boxes').update(updates).eq('id', id)
    if (error) throw error
    return
  }

  const boxes = readLocal<ShuttleBox[]>(SHUTTLES_KEY, []).map((box) =>
    box.id === id ? { ...box, ...updates } : box,
  )
  writeLocal(SHUTTLES_KEY, boxes)
}
