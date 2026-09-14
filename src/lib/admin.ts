const ADMIN_KEY = 'bt-admin-ok'

export function getAdminPin(): string {
  return import.meta.env.VITE_ADMIN_PIN?.trim() ?? ''
}

export function isAdminConfigured(): boolean {
  return getAdminPin().length > 0
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === '1'
  } catch {
    return false
  }
}

export function setAdminAuthenticated() {
  sessionStorage.setItem(ADMIN_KEY, '1')
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_KEY)
}
