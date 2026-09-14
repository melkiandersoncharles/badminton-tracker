import { blobToDataUrl, resizeImage } from './photo'
import { isSupabaseConfigured, supabase } from './supabase'
import { getOperatorId } from './operator'
import { requireTeamId } from './team'
import type { ActivityEntry, Match, MatchDraft, Player, PlayerDraft, ShuttleBox, Team } from './types'
import { SHUTTLES_PER_BOX } from './types'

const PLAYERS_KEY = 'bt-players'
const MATCHES_KEY = 'bt-matches'
const SHUTTLES_KEY = 'bt-shuttle-boxes'
const ACTIVITY_KEY = 'bt-activity'
const TEAMS_KEY = 'bt-teams'

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

function readLocalForTeam<T extends { team_id: string }>(key: string): T[] {
  const teamId = requireTeamId()
  return readLocal<T[]>(key, []).filter((item) => item.team_id === teamId)
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

export async function lookupTeamByPin(pin: string): Promise<Team | null> {
  if (supabase) {
    const { data, error } = await supabase.from('teams').select('*').eq('pin', pin).maybeSingle()
    if (error) {
      // Pre-migration: teams table may not exist yet — caller falls back to VITE_GROUP_PIN.
      console.warn('Team PIN lookup failed:', error.message)
      return null
    }
    return data as Team | null
  }
  return readLocal<Team[]>(TEAMS_KEY, []).find((team) => team.pin === pin) ?? null
}

export async function fetchTeams(): Promise<Team[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as Team[]
  }
  return readLocal<Team[]>(TEAMS_KEY, []).sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export async function createTeam(name: string, pin: string): Promise<Team> {
  const trimmedName = name.trim()
  const trimmedPin = pin.trim()
  if (!trimmedName) throw new Error('Team name is required')
  if (!trimmedPin) throw new Error('PIN is required')

  const teams = await fetchTeams()
  if (teams.some((team) => team.pin === trimmedPin)) {
    throw new Error('PIN already in use')
  }

  const team: Team = {
    id: crypto.randomUUID(),
    name: trimmedName,
    pin: trimmedPin,
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { error } = await supabase.from('teams').insert(team)
    if (error) {
      if (error.code === '23505') throw new Error('PIN already in use')
      throw error
    }
    return team
  }

  writeLocal(TEAMS_KEY, [...teams, team])
  return team
}

export async function deleteTeam(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete: team has players or other data')
      }
      throw error
    }
    return
  }

  const players = readLocal<Player[]>(PLAYERS_KEY, [])
  if (players.some((player) => player.team_id === id)) {
    throw new Error('Cannot delete: team has players')
  }

  const teams = readLocal<Team[]>(TEAMS_KEY, [])
  writeLocal(TEAMS_KEY, teams.filter((team) => team.id !== id))
}

export async function fetchPlayers(): Promise<Player[]> {
  const teamId = requireTeamId()
  if (supabase) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('is_guest', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []) as Player[]
  }
  return sortPlayerList(readLocalForTeam<Player>(PLAYERS_KEY))
}

export async function fetchMatches(): Promise<Match[]> {
  const teamId = requireTeamId()
  if (supabase) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Match[]
  }
  return readLocalForTeam<Match>(MATCHES_KEY).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )
}

export async function createPlayer(draft: PlayerDraft): Promise<Player> {
  const teamId = requireTeamId()
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const photo_url = draft.photoFile ? await uploadPhoto(id, draft.photoFile) : null
  const player: Player = {
    id,
    team_id: teamId,
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

  const all = readLocal<Player[]>(PLAYERS_KEY, [])
  writeLocal(PLAYERS_KEY, sortPlayerList([...all, player]))
  return player
}

export async function updatePlayer(
  id: string,
  patch: { name?: string; is_guest?: boolean; photoFile?: File | null },
): Promise<void> {
  const teamId = requireTeamId()
  const updates: Partial<Player> = {}
  if (patch.name !== undefined) updates.name = patch.name.trim()
  if (patch.is_guest !== undefined) updates.is_guest = patch.is_guest
  if (patch.photoFile) updates.photo_url = await uploadPhoto(id, patch.photoFile)

  if (supabase) {
    const { error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .eq('team_id', teamId)
    if (error) throw error
    return
  }

  const players = readLocal<Player[]>(PLAYERS_KEY, []).map((player) =>
    player.id === id && player.team_id === teamId ? { ...player, ...updates } : player,
  )
  writeLocal(PLAYERS_KEY, sortPlayerList(players))
}

export async function deletePlayer(id: string): Promise<void> {
  const teamId = requireTeamId()
  if (supabase) {
    const { error } = await supabase.from('players').delete().eq('id', id).eq('team_id', teamId)
    if (error) throw error
    return
  }
  writeLocal(
    PLAYERS_KEY,
    readLocal<Player[]>(PLAYERS_KEY, []).filter(
      (player) => player.id !== id || player.team_id !== teamId,
    ),
  )
}

export async function createMatch(draft: MatchDraft): Promise<Match> {
  const teamId = requireTeamId()
  const match: Match = {
    id: crypto.randomUUID(),
    team_id: teamId,
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
  const teamId = requireTeamId()
  if (supabase) {
    const { error } = await supabase.from('matches').delete().eq('id', id).eq('team_id', teamId)
    if (error) throw error
    return
  }
  writeLocal(
    MATCHES_KEY,
    readLocal<Match[]>(MATCHES_KEY, []).filter(
      (match) => match.id !== id || match.team_id !== teamId,
    ),
  )
}

function sortBoxes(boxes: ShuttleBox[]): ShuttleBox[] {
  return [...boxes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function fetchShuttleBoxes(): Promise<ShuttleBox[]> {
  const teamId = requireTeamId()
  if (supabase) {
    const { data, error } = await supabase
      .from('shuttle_boxes')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ShuttleBox[]
  }
  return sortBoxes(readLocalForTeam<ShuttleBox>(SHUTTLES_KEY))
}

export async function createShuttleBox(holderId: string | null): Promise<ShuttleBox> {
  const teamId = requireTeamId()
  const box: ShuttleBox = {
    id: crypto.randomUUID(),
    team_id: teamId,
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
  const teamId = requireTeamId()
  const updates: Partial<ShuttleBox> = { ...patch }
  if (updates.used !== undefined) {
    updates.used = Math.max(0, Math.min(SHUTTLES_PER_BOX, updates.used))
  }

  if (supabase) {
    const { error } = await supabase
      .from('shuttle_boxes')
      .update(updates)
      .eq('id', id)
      .eq('team_id', teamId)
    if (error) throw error
    return
  }

  const boxes = readLocal<ShuttleBox[]>(SHUTTLES_KEY, []).map((box) =>
    box.id === id && box.team_id === teamId ? { ...box, ...updates } : box,
  )
  writeLocal(SHUTTLES_KEY, boxes)
}

export async function fetchActivities(): Promise<ActivityEntry[]> {
  const teamId = requireTeamId()
  if (supabase) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return (data ?? []) as ActivityEntry[]
  }
  return readLocalForTeam<ActivityEntry>(ACTIVITY_KEY).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )
}

export async function logActivity(action: string, details: string): Promise<void> {
  const teamId = requireTeamId()
  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    team_id: teamId,
    actor_id: getOperatorId(),
    action,
    details,
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { error } = await supabase.from('activity_log').insert(entry)
    if (error) throw error
    return
  }

  const all = readLocal<ActivityEntry[]>(ACTIVITY_KEY, [])
  const items = [entry, ...all.filter((item) => item.team_id === teamId)].slice(0, 200)
  const otherTeams = all.filter((item) => item.team_id !== teamId)
  writeLocal(ACTIVITY_KEY, [...items, ...otherTeams])
}
