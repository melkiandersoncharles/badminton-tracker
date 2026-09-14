import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isAdminConfigured, setAdminAuthenticated, verifyAdminPin } from '../lib/admin'

export function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void isAdminConfigured().then(setConfigured)
  }, [])

  async function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!configured || busy) return
    setBusy(true)
    try {
      if (await verifyAdminPin(value)) {
        setAdminAuthenticated()
        onSuccess()
        return
      }
      setError(true)
      setValue('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center bg-[#0c1f18] px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f0c14b]">Admin</p>
      <h1 className="mt-2 text-2xl font-bold">Enter admin PIN</h1>
      {configured === null ? (
        <p className="mt-4 text-sm text-[#9bb5a8]">Checking admin setup…</p>
      ) : configured ? (
        <>
          <p className="mt-2 text-sm text-[#9bb5a8]">Manage teams and group PIN codes.</p>
          <form className="mt-8 w-full max-w-xs" onSubmit={(e) => void submit(e)}>
            <input
              autoFocus
              type="password"
              value={value}
              disabled={busy}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              className="w-full rounded-2xl border border-[#d7ecd0]/20 bg-[#143328] px-4 py-3 text-center text-lg outline-none disabled:opacity-60"
              placeholder="Admin PIN"
            />
            {error ? <p className="mt-3 text-sm text-red-300">Wrong PIN</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18] disabled:opacity-60"
            >
              {busy ? 'Checking…' : 'Log in'}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm text-[#9bb5a8]">
          Admin is not configured. Set <code className="text-[#f0c14b]">ADMIN_PIN</code> as a secret
          environment variable (no <code className="text-[#f0c14b]">VITE_</code> prefix) and redeploy.
        </p>
      )}
      <Link to="/" className="mt-8 text-xs text-[#9bb5a8] underline">
        Back to club login
      </Link>
    </div>
  )
}
