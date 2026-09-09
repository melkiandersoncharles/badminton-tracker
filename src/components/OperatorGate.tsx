import { useState, type ReactNode } from 'react'
import { Avatar } from './Avatar'
import { useData } from '../context/DataContext'
import { logActivity } from '../lib/api'
import { getOperatorId, setOperatorId } from '../lib/operator'

export function OperatorGate({ children }: { children: ReactNode }) {
  const { ready, players, refresh } = useData()
  const [busy, setBusy] = useState(false)
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
          We&apos;ll log who made each change. Tap the member using this phone.
        </p>
      </header>

      {members.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-10 text-center text-sm text-[#9bb5a8]">
          Add members on the Players tab first, then come back here.
        </p>
      ) : (
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
      )}
    </div>
  )
}
