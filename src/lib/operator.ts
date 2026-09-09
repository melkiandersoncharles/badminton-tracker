const OPERATOR_KEY = 'bt-operator-id'

export function getOperatorId(): string | null {
  try {
    return sessionStorage.getItem(OPERATOR_KEY)
  } catch {
    return null
  }
}

export function setOperatorId(id: string) {
  sessionStorage.setItem(OPERATOR_KEY, id)
}

export function clearOperatorId() {
  sessionStorage.removeItem(OPERATOR_KEY)
}

export function switchOperator() {
  clearOperatorId()
  window.location.reload()
}
