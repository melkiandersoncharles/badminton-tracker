import { useMemo, useState, type FormEvent, type ReactNode } from 'react'

const STORAGE_KEY = 'bt-pin-ok'
export const GROUP_PIN = import.meta.env.VITE_GROUP_PIN?.trim() ?? ''

export function lockClub() {
  sessionStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

export function PinGate({ children }: { children: ReactNode }) {
  const required = GROUP_PIN.length > 0
  const [unlocked, setUnlocked] = useState(
    () => !required || sessionStorage.getItem(STORAGE_KEY) === '1',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const numeric = useMemo(() => /^\d+$/.test(GROUP_PIN), [])

  if (!required || unlocked) return children

  function unlockIfMatch(next: string) {
    if (next === GROUP_PIN) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
      return true
    }
    return false
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!unlockIfMatch(value)) {
      setError(true)
      setValue('')
    }
  }

  function tapDigit(digit: string) {
    const next = (value + digit).slice(0, GROUP_PIN.length)
    setValue(next)
    setError(false)
    if (next.length === GROUP_PIN.length && !unlockIfMatch(next)) {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center bg-[#0c1f18] px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f0c14b]">Club login</p>
      <h1 className="mt-2 text-2xl font-bold">Enter group PIN</h1>
      <p className="mt-2 text-sm text-[#9bb5a8]">Same PIN for everyone. Ask a regular if you don’t have it.</p>
      {numeric ? (
        <>
          <div className="mt-8 flex gap-2">
            {Array.from({ length: GROUP_PIN.length }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${i < value.length ? 'bg-[#f0c14b]' : 'bg-[#1c4a3a]'}`}
              />
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-red-300">Wrong PIN</p> : null}
          <div className="mt-8 grid w-56 grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) =>
              key === '' ? (
                <span key="empty" />
              ) : (
                <button
                  key={key}
                  type="button"
                  className="h-14 rounded-2xl bg-[#143328] text-xl font-semibold"
                  onClick={() => {
                    if (key === '⌫') {
                      setValue((v) => v.slice(0, -1))
                      setError(false)
                      return
                    }
                    tapDigit(key)
                  }}
                >
                  {key}
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <form className="mt-8 w-full max-w-xs" onSubmit={submit}>
          <input
            autoFocus
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            className="w-full rounded-2xl border border-[#d7ecd0]/20 bg-[#143328] px-4 py-3 text-center text-lg outline-none"
            placeholder="PIN"
          />
          {error ? <p className="mt-3 text-sm text-red-300">Wrong PIN</p> : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18]"
          >
            Log in
          </button>
        </form>
      )}
    </div>
  )
}
