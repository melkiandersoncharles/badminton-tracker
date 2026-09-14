import { useState, type FormEvent, type ReactNode } from 'react'
import { Avatar } from './Avatar'
import { useData } from '../context/DataContext'
import { logActivity } from '../lib/api'
import { getOperatorId, setOperatorId } from '../lib/operator'

export function OperatorGate({ children }: { children: ReactNode }) {
  const { ready, players, addPlayer, refresh } = useData()
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [operatorId, setLocalOperatorId] = useState(getOperatorId)

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md items-center justify-center bg-[#0c1f18]">
        <p className="text-sm text-[#9bb5a8]">Loading the club…</p>
      </div>
    )
  }

  if (operatorId) return children

  const members = players.filter((player) => !player.is_guest)

  async function pick(id: string, name: string) {
    setBusy(true)
    setOperatorId(id)
    setLocalOperatorId(id)
    try {
      await logActivity('sign_in', `Signed in as ${name}`)
      await refresh()
    } catch {
      // Non-blocking — operator is set even if log fails
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col bg-[#0c1f18] px-4 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Who&apos;s using the app?</p>
        <h1 className="mt-2 text-2xl font-bold">Pick your name</h1>
        <p className="mt-2 text-sm text-[#9bb5a8]">
          We&apos;ll log who made each change. Tap your name, or add yourself if you&apos;re new.
        </p>
      </header>

      {adding ? (
        <NewMemberForm
          busy={busy}
          onCancel={() => setAdding(false)}
          onSave={async (name) => {
            setBusy(true)
            try {
              const player = await addPlayer({ name, is_guest: false })
              setOperatorId(player.id)
              setLocalOperatorId(player.id)
              try {
                await logActivity('sign_in', `Signed in as ${player.name}`)
              } catch {
                // Non-blocking
              }
            } finally {
              setBusy(false)
            }
          }}
        />
      ) : members.length === 0 ? (
        <div className="mt-8 space-y-3">
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-6 text-center text-sm text-[#9bb5a8]">
            No members yet. Add the first one to get started.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18]"
          >
            + Add member
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-2">
            {members.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void pick(player.id, player.name)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#143328] px-4 py-3 text-left disabled:opacity-60"
                >
                  <Avatar player={player} />
                  <span className="font-semibold">{player.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={busy}
            onClick={() => setAdding(true)}
            className="mt-4 w-full rounded-2xl border border-dashed border-[#f0c14b]/40 py-3 text-sm font-bold text-[#f0c14b] disabled:opacity-60"
          >
            + New member
          </button>
        </>
      )}
    </div>
  )
}

function NewMemberForm({
  busy,
  onCancel,
  onSave,
}: {
  busy: boolean
  onCancel: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setError(null)
    try {
      await onSave(name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add member')
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-3 rounded-3xl border border-[#f0c14b]/30 bg-[#143328] p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">New member</h2>
        <button type="button" className="text-sm text-[#9bb5a8]" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="text-xs text-[#9bb5a8]">They&apos;ll be added to the roster and signed in on this phone.</p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full rounded-2xl bg-[#0c1f18] px-3 py-3 outline-none"
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18] disabled:opacity-60"
      >
        {busy ? 'Adding…' : 'Add & sign in'}
      </button>
    </form>
  )
}
