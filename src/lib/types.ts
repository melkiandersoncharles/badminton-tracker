export type Court = 1 | 2

export type Player = {
  id: string
  name: string
  photo_url: string | null
  is_guest: boolean
  created_at: string
}

export type Match = {
  id: string
  played_on: string
  court: Court
  team_a_1: string
  team_a_2: string
  team_b_1: string
  team_b_2: string
  score_a: number
  score_b: number
  created_at: string
}

export type MatchDraft = {
  played_on: string
  court: Court
  team_a_1: string
  team_a_2: string
  team_b_1: string
  team_b_2: string
  score_a: number
  score_b: number
}

export type PlayerDraft = {
  name: string
  is_guest: boolean
  photoFile?: File | null
}

export type LeaderboardRow = {
  player: Player
  wins: number
  losses: number
  matches: number
  winPct: number
  attendanceDays: number
}

export type PlayerStat = {
  wins: number
  losses: number
  matches: number
  winPct: number
  attendanceDays: number
}

export const SHUTTLES_PER_BOX = 6

export type ShuttleBox = {
  id: string
  holder_id: string | null
  used: number
  opened_on: string
  closed_at: string | null
  created_at: string
}

export function matchPlayerIds(match: Match | MatchDraft): string[] {
  return [match.team_a_1, match.team_a_2, match.team_b_1, match.team_b_2]
}

export function winnerOf(match: Match): 'a' | 'b' | 'draw' {
  if (match.score_a === match.score_b) return 'draw'
  return match.score_a > match.score_b ? 'a' : 'b'
}
