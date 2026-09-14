export function getAdminPinFromEnv(): string {
  return process.env.ADMIN_PIN?.trim() ?? ''
}

export function adminVerifyGetResponse(): { configured: boolean } {
  return { configured: getAdminPinFromEnv().length > 0 }
}

export function adminVerifyPostResponse(body: unknown): { ok: boolean } {
  const pin =
    typeof body === 'object' && body !== null && 'pin' in body && typeof body.pin === 'string'
      ? body.pin
      : ''
  const expected = getAdminPinFromEnv()
  return { ok: pin.length > 0 && pin === expected }
}
