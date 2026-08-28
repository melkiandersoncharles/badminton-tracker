import { currentMonthKey, monthKey } from './dates'
import type { LeaderboardRow, Match, Player, PlayerStat } from './types'
import { winnerOf } from './types'

export function attendanceForDay(matches: Match[], day: string): string[] {
  const ids = new Set<string>()
  for (const match of matches) {
    if (match.played_on !== day) continue
    for (const id of [match.team_a_1, match.team_a_2, match.team_b_1, match.team_b_2]) {
      ids.add(id)
    }
  }
  return [...ids]
}

export function daysWithMatches(matches: Match[]): string[] {
  const days = new Set(matches.map((match) => match.played_on))
  return [...days].sort((a, b) => (a < b ? 1 : -1))
}

export function sideOf(match: Match, playerId: string): 'a' | 'b' | null {
  if (match.team_a_1 === playerId || match.team_a_2 === playerId) return 'a'
  if (match.team_b_1 === playerId || match.team_b_2 === playerId) return 'b'
  return null
}

export function partnerIdOn(match: Match, playerId: string): string | null {
  if (match.team_a_1 === playerId) return match.team_a_2
  if (match.team_a_2 === playerId) return match.team_a_1
  if (match.team_b_1 === playerId) return match.team_b_2
  if (match.team_b_2 === playerId) return match.team_b_1
  return null
}

export function matchesForPlayer(playerId: string, matches: Match[]): Match[] {
  return matches.filter((match) => sideOf(match, playerId) !== null)
}

export function statsForPlayer(
  playerId: string,
  matches: Match[],
  scope: 'all' | 'month' = 'all',
): PlayerStat {
  const month = currentMonthKey()
  const scoped =
    scope === 'month' ? matches.filter((match) => monthKey(match.played_on) === month) : matches

  let wins = 0
  let losses = 0
  let played = 0
  const days = new Set<string>()

  for (const match of scoped) {
    const side = sideOf(match, playerId)
    if (!side) continue
    played += 1
    days.add(match.played_on)
    const winner = winnerOf(match)
    if (winner === 'draw') continue
    if (winner === side) wins += 1
    else losses += 1
  }

  return {
    wins,
    losses,
    matches: played,
    winPct: played === 0 ? 0 : Math.round((wins / played) * 100),
    attendanceDays: days.size,
  }
}

export function buildLeaderboard(
  players: Player[],
  matches: Match[],
  scope: 'all' | 'month',
): LeaderboardRow[] {
  return players
    .map((player) => ({
      player,
      ...statsForPlayer(player.id, matches, scope),
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.winPct !== a.winPct) return b.winPct - a.winPct
      if (b.matches !== a.matches) return b.matches - a.matches
      if (b.attendanceDays !== a.attendanceDays) return b.attendanceDays - a.attendanceDays
      return a.player.name.localeCompare(b.player.name)
    })
}

export type PartnerRow = {
  player: Player
  together: number
  wins: number
}

export function partnerStats(playerId: string, matches: Match[], players: Player[]): PartnerRow[] {
  const map = new Map<string, { together: number; wins: number }>()
  for (const match of matches) {
    const partner = partnerIdOn(match, playerId)
    if (!partner) continue
    const entry = map.get(partner) ?? { together: 0, wins: 0 }
    entry.together += 1
    const side = sideOf(match, playerId)
    if (side && winnerOf(match) === side) entry.wins += 1
    map.set(partner, entry)
  }

  return [...map.entries()]
    .map(([id, stats]) => {
      const player = playerById(players, id)
      if (!player) return null
      return { player, together: stats.together, wins: stats.wins }
    })
    .filter((row): row is PartnerRow => row !== null)
    .sort((a, b) => b.together - a.together || b.wins - a.wins)
}

export function playerById(players: Player[], id: string): Player | undefined {
  return players.find((player) => player.id === id)
}
