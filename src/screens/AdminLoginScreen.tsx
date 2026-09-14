import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getAdminPin, isAdminConfigured, setAdminAuthenticated } from '../lib/admin'

export function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const configured = isAdminConfigured()

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!configured) return
    if (value === getAdminPin()) {
      setAdminAuthenticated()
      onSuccess()
      return
    }
    setError(true)
    setValue('')
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center bg-[#0c1f18] px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f0c14b]">Admin</p>
      <h1 className="mt-2 text-2xl font-bold">Enter admin PIN</h1>
      {configured ? (
        <>
          <p className="mt-2 text-sm text-[#9bb5a8]">Manage teams and group PIN codes.</p>
          <form className="mt-8 w-full max-w-xs" onSubmit={(e) => submit(e)}>
            <input
              autoFocus
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              className="w-full rounded-2xl border border-[#d7ecd0]/20 bg-[#143328] px-4 py-3 text-center text-lg outline-none"
              placeholder="Admin PIN"
            />
            {error ? <p className="mt-3 text-sm text-red-300">Wrong PIN</p> : null}
            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18]"
            >
              Log in
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm text-[#9bb5a8]">
          Admin is not configured. Set <code className="text-[#f0c14b]">VITE_ADMIN_PIN</code> in your
          environment and redeploy.
        </p>
      )}
      <Link to="/" className="mt-8 text-xs text-[#9bb5a8] underline">
        Back to club login
      </Link>
    </div>
  )
}
