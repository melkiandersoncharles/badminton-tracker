const TEAM_ID_KEY = 'bt-team-id'
const LOCAL_DEFAULT_TEAM_KEY = 'bt-local-default-team-id'

export function getTeamId(): string | null {
  try {
    return sessionStorage.getItem(TEAM_ID_KEY)
  } catch {
    return null
  }
}

export function setTeamId(id: string) {
  sessionStorage.setItem(TEAM_ID_KEY, id)
}

export function clearTeamId() {
  sessionStorage.removeItem(TEAM_ID_KEY)
}

/** Stable team id for local-only mode (no Supabase). */
export function getOrCreateLocalDefaultTeamId(): string {
  try {
    let id = localStorage.getItem(LOCAL_DEFAULT_TEAM_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(LOCAL_DEFAULT_TEAM_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function requireTeamId(): string {
  const id = getTeamId()
  if (!id) throw new Error('No team selected')
  return id
}
