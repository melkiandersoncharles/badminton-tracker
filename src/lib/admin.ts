const ADMIN_KEY = 'bt-admin-ok'

export async function isAdminConfigured(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin-verify')
    if (!res.ok) return false
    const data = (await res.json()) as { configured?: boolean }
    return data.configured === true
  } catch {
    return false
  }
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
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
