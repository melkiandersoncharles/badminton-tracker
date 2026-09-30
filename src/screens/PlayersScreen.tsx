import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { ConfirmCodeDialog } from '../components/ConfirmCodeDialog'
import { EmptyState } from '../components/EmptyState'
import { GROUP_PIN, lockClub } from '../components/PinGate'
import { ScreenHeader } from '../components/ScreenHeader'
import { useData } from '../context/DataContext'
import { getOperatorId, switchOperator } from '../lib/operator'
import { matchPlayerIds } from '../lib/types'
import type { Player } from '../lib/types'

export function PlayersScreen() {
  const { players, matches, addPlayer, editPlayer, removePlayer } = useData()
  const [editing, setEditing] = useState<Player | null>(null)
  const [adding, setAdding] = useState<'member' | 'guest' | null>(null)
  const [pendingRemove, setPendingRemove] = useState<Player | null>(null)
  const [pendingEdit, setPendingEdit] = useState<Player | null>(null)

  const members = players.filter((p) => !p.is_guest)
  const guests = players.filter((p) => p.is_guest)
  const operatorId = getOperatorId()

  function usedInMatch(id: string) {
    return matches.some((match) => matchPlayerIds(match).includes(id))
  }

  function requestEdit(player: Player) {
    if (player.id === operatorId) {
      setEditing(player)
      return
    }
    setPendingEdit(player)
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow="Roster"
        title="Players"
        subtitle={`${members.length} members · ${guests.length} guests`}
        actions={
          <>
            <button
              type="button"
              onClick={() => switchOperator()}
              className="rounded-full bg-[#0c1f18]/60 px-3 py-1.5 text-xs font-bold text-[#9bb5a8]"
            >
              Switch
            </button>
            {GROUP_PIN ? (
              <button
                type="button"
                onClick={() => lockClub()}
                className="rounded-full bg-[#0c1f18]/60 px-3 py-1.5 text-xs font-bold text-[#9bb5a8]"
              >
                Lock
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setAdding('member')
            setEditing(null)
          }}
          className="rounded-2xl bg-[#f0c14b] py-3 text-sm font-bold text-[#0c1f18]"
        >
          Add member
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding('guest')
            setEditing(null)
          }}
          className="rounded-2xl border border-[#d7ecd0]/20 py-3 text-sm font-bold text-[#9bb5a8]"
        >
          Add guest
        </button>
      </div>

      {adding ? (
        <PlayerForm
          title={adding === 'guest' ? 'New guest' : 'New member'}
          isGuest={adding === 'guest'}
          onCancel={() => setAdding(null)}
          onSave={async ({ name, photoFile, is_guest }) => {
            await addPlayer({ name, is_guest, photoFile })
            setAdding(null)
          }}
        />
      ) : null}

      {editing ? (
        <PlayerForm
          title="Edit player"
          player={editing}
          isGuest={editing.is_guest}
          onCancel={() => setEditing(null)}
          onSave={async ({ name, photoFile, is_guest }) => {
            await editPlayer(editing.id, { name, photoFile, is_guest })
            setEditing(null)
          }}
        />
      ) : null}

      <Group
        title="Members"
        players={members}
        empty="Add your regulars — names and photos."
        onEdit={requestEdit}
        onDelete={(player) => {
          if (usedInMatch(player.id)) {
            alert('This player is in a match. Remove those matches first.')
            return
          }
          setPendingRemove(player)
        }}
      />
      <Group
        title="Guests"
        players={guests}
        empty="Drop-in players go here."
        onEdit={requestEdit}
        onDelete={(player) => {
          if (usedInMatch(player.id)) {
            alert('This player is in a match. Remove those matches first.')
            return
          }
          setPendingRemove(player)
        }}
      />

      <ConfirmCodeDialog
        open={pendingEdit !== null}
        title={pendingEdit ? `Edit ${pendingEdit.name}?` : 'Edit player?'}
        message="Enter the confirmation code to edit another player's details."
        confirmLabel="Continue"
        onCancel={() => setPendingEdit(null)}
        onConfirm={() => {
          if (!pendingEdit) return
          setEditing(pendingEdit)
          setPendingEdit(null)
        }}
      />

      <ConfirmCodeDialog
        open={pendingRemove !== null}
        title={pendingRemove ? `Remove ${pendingRemove.name}?` : 'Remove player?'}
        message="This cannot be undone. Enter the confirmation code to remove this player."
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove) return
          const id = pendingRemove.id
          setPendingRemove(null)
          void removePlayer(id)
        }}
      />
    </div>
  )
}

function Group({
  title,
  players,
  empty,
  onEdit,
  onDelete,
}: {
  title: string
  players: Player[]
  empty: string
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-[#9bb5a8]">
        {title} · {players.length}
      </h2>
      {players.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.id} className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2">
              <Link to={`/players/${player.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar player={player} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{player.name}</p>
                  <p className="text-[11px] text-[#9bb5a8]">Tap for stats and matches</p>
                </div>
              </Link>
              <button type="button" className="text-xs text-[#9bb5a8]" onClick={() => onEdit(player)}>
                Edit
              </button>
              <button
                type="button"
                className="text-xs text-[#9bb5a8]"
                onClick={() => void onDelete(player)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PlayerForm({
  title,
  player,
  isGuest,
  onCancel,
  onSave,
}: {
  title: string
  player?: Player
  isGuest: boolean
  onCancel: () => void
  onSave: (input: { name: string; is_guest: boolean; photoFile?: File | null }) => Promise<void>
}) {
  const [name, setName] = useState(player?.name ?? '')
  const [guest, setGuest] = useState(isGuest)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(player?.photo_url ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), is_guest: guest, photoFile: file })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save player')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-3 rounded-3xl border border-[#f0c14b]/30 bg-[#143328] p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        <button type="button" className="text-sm text-[#9bb5a8]" onClick={onCancel}>
          Close
        </button>
      </div>
      <div className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0c1f18] text-xs text-[#9bb5a8]">
            Photo
          </div>
        )}
        <label className="text-sm font-semibold text-[#f0c14b]">
          {preview ? 'Change photo' : 'Add photo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null
              setFile(next)
              if (next) setPreview(URL.createObjectURL(next))
            }}
          />
        </label>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full rounded-2xl bg-[#0c1f18] px-3 py-3 outline-none"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={guest} onChange={(e) => setGuest(e.target.checked)} />
        Guest player
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-[#f0c14b] py-3 font-bold text-[#0c1f18] disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
