import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createTeam, deleteTeam, fetchTeams } from '../lib/api'
import { clearAdminSession } from '../lib/admin'
import type { Team } from '../lib/types'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function AdminTeamsScreen({ onLogout }: { onLogout: () => void }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTeams(await fetchTeams())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load teams')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTeams()
  }, [loadTeams])

  function logout() {
    clearAdminSession()
    onLogout()
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setBusy(true)
    try {
      await createTeam(name, pin)
      setName('')
      setPin('')
      await loadTeams()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add team')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(team: Team) {
    const ok = window.confirm(
      `Delete "${team.name}" (PIN ${team.pin}) and ALL its data?\n\nThis permanently removes players, matches, shuttle boxes, activity, and photos. This cannot be undone.`,
    )
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await deleteTeam(team.id)
      await loadTeams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete team')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-svh max-w-md bg-[#0c1f18] px-4 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Admin</p>
          <h1 className="mt-1 text-2xl font-bold">Teams</h1>
          <p className="mt-1 text-sm text-[#9bb5a8]">Each team gets its own club PIN.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 rounded-full bg-[#1c4a3a] px-3 py-1.5 text-xs font-bold text-ink"
        >
          Log out
        </button>
      </header>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#9bb5a8]">All teams</h2>
        {loading ? (
          <p className="mt-3 text-sm text-[#9bb5a8]">Loading…</p>
        ) : teams.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-6 text-center text-sm text-[#9bb5a8]">
            No teams yet. Add one below.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#143328] px-4 py-3"
              >
                <div className="min-w-0 text-left">
                  <p className="truncate font-semibold">{team.name}</p>
                  <p className="text-xs text-[#9bb5a8]">
                    PIN <span className="font-mono text-[#f0c14b]">{team.pin}</span>
                    <span className="mx-1">·</span>
                    {formatDate(team.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete(team)}
                  className="shrink-0 rounded-full bg-[#1c4a3a] px-3 py-1 text-xs font-bold text-red-200 disabled:opacity-60"
                >
                  Delete club
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form
        onSubmit={(e) => void handleAdd(e)}
        className="mt-8 space-y-3 rounded-3xl border border-[#f0c14b]/30 bg-[#143328] p-4"
      >
        <h2 className="font-bold">Add team</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Team name"
          className="w-full rounded-2xl bg-[#0c1f18] px-3 py-3 outline-none"
        />
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN (unique)"
          className="w-full rounded-2xl bg-[#0c1f18] px-3 py-3 outline-none"
        />
        {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18] disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Add team'}
        </button>
      </form>

      <Link to="/" className="mt-6 block text-center text-xs text-[#9bb5a8] underline">
        Back to club login
      </Link>
    </div>
  )
}
