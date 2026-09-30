export const DELETE_CONFIRM_CODE = '1991'

export function isDeleteCodeValid(code: string): boolean {
  return code.trim() === DELETE_CONFIRM_CODE
}
