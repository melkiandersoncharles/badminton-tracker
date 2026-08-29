import { useMemo, useState, type ReactNode } from 'react'
import { Avatar } from '../components/Avatar'
import { PlayerChip } from '../components/PlayerChip'
import { useData } from '../context/DataContext'
import { formatDayLong } from '../lib/dates'
import { SHUTTLES_PER_BOX, clubOpenBoxes, remainingInBox } from '../lib/types'
import type { Player, ShuttleBox } from '../lib/types'

export function ShuttleScreen() {
  const {
    players,
    shuttleBoxes,
    shuttleError,
    addShuttleBox,
    closeShuttleBox,
    setBoxHolder,
    useShuttle,
    undoShuttle,
  } = useData()
  const [pickingFor, setPickingFor] = useState<string | 'new' | null>(null)
  const [busy, setBusy] = useState(false)

  const members = useMemo(
    () => players.filter((player) => !player.is_guest),
    [players],
  )
  const boxes = [...clubOpenBoxes(shuttleBoxes)].sort((a, b) => {
    const nameA = members.find((player) => player.id === a.holder_id)?.name ?? 'zzz'
    const nameB = members.find((player) => player.id === b.holder_id)?.name ?? 'zzz'
    return nameA.localeCompare(nameB)
  })
  const closedBoxes = shuttleBoxes.filter((box) => box.closed_at !== null)
  const used = boxes.reduce((sum, box) => sum + box.used, 0)
  const stock = boxes.length * SHUTTLES_PER_BOX
  const remaining = boxes.reduce((sum, box) => sum + remainingInBox(box), 0)
  const boxWord = boxes.length === 1 ? 'box' : 'boxes'

  const takenHolderIds = useMemo(() => {
    const ids = new Set<string>()
    for (const box of boxes) {
      if (box.holder_id) ids.add(box.holder_id)
    }
    return ids
  }, [boxes])

  async function run(action: () => Promise<void>) {
    if (busy) return
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Club kit</p>
          <h1 className="mt-1 text-2xl font-bold">Shuttle</h1>
          <p className="mt-1 text-sm text-[#9bb5a8]">
            {boxes.length === 0
              ? `One box per member · ${SHUTTLES_PER_BOX} shuttles each`
              : `${boxes.length} ${boxWord} · ${SHUTTLES_PER_BOX} shuttles each`}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || Boolean(shuttleError) || members.length === 0}
          onClick={() => setPickingFor((current) => (current === 'new' ? null : 'new'))}
          className="shrink-0 rounded-full bg-[#f0c14b] px-3 py-2 text-xs font-bold text-[#0c1f18] disabled:opacity-40"
        >
          {pickingFor === 'new' ? 'Cancel' : 'Add a box'}
        </button>
      </header>

      {shuttleError ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {shuttleError}
        </p>
      ) : null}

      {pickingFor === 'new' ? (
        <MemberPicker
          title="Whose box is this?"
          members={members}
          takenIds={takenHolderIds}
          busy={busy}
          onPick={(member) =>
            void run(async () => {
              await addShuttleBox(member.id)
              setPickingFor(null)
            })
          }
        />
      ) : null}

      <section className="rounded-3xl bg-[#14382c] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9bb5a8]">Remaining</p>
            <p className="mt-1 text-4xl font-bold leading-none">
              {remaining}
              <span className="ml-1 text-lg font-semibold text-[#9bb5a8]">/ {stock}</span>
            </p>
          </div>
          <p className="text-right text-sm text-[#9bb5a8]">
            {used} used
            <br />
            {boxes.length} {boxWord}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">Boxes by member</h2>
        {members.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
            Add members on Players first, then give each one a box.
          </p>
        ) : boxes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
            No boxes yet. Tap Add a box and pick the member who is holding it.
          </p>
        ) : (
          boxes.map((box) => {
            const holder = members.find((player) => player.id === box.holder_id) ?? null
            return (
              <BoxCard
                key={box.id}
                box={box}
                holder={holder}
                busy={busy}
                picking={pickingFor === box.id}
                onTogglePick={() => setPickingFor((current) => (current === box.id ? null : box.id))}
                onUse={() => void run(() => useShuttle(box.id))}
                onUndo={() => void run(() => undoShuttle(box.id))}
                onClose={() => {
                  const left = remainingInBox(box)
                  const name = holder?.name ?? 'this box'
                  if (left > 0) {
                    const ok = window.confirm(
                      `${name} still has ${left} shuttle${left === 1 ? '' : 's'} left. Close this box anyway?`,
                    )
                    if (!ok) return
                  }
                  void run(() => closeShuttleBox(box.id))
                }}
              >
                {pickingFor === box.id ? (
                  <MemberPicker
                    title="Move this box to"
                    members={members}
                    takenIds={takenHolderIds}
                    keepId={box.holder_id}
                    busy={busy}
                    onPick={(member) =>
                      void run(async () => {
                        await setBoxHolder(box.id, member.id)
                        setPickingFor(null)
                      })
                    }
                  />
                ) : null}
              </BoxCard>
            )
          })
        )}
      </section>

      {closedBoxes.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-base font-bold">Finished boxes</h2>
          <ul className="space-y-2">
            {closedBoxes.map((box) => (
              <ClosedBoxRow key={box.id} box={box} players={players} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function MemberPicker({
  title,
  members,
  takenIds,
  keepId = null,
  busy,
  onPick,
}: {
  title: string
  members: Player[]
  takenIds: Set<string>
  keepId?: string | null
  busy: boolean
  onPick: (member: Player) => void
}) {
  const available = members.filter((member) => member.id === keepId || !takenIds.has(member.id))
  return (
    <section className="space-y-2 rounded-3xl bg-[#14382c] p-4">
      <h3 className="text-sm font-bold">{title}</h3>
      {available.length === 0 ? (
        <p className="text-sm text-[#9bb5a8]">Every member already has a box.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {available.map((member) => (
            <PlayerChip
              key={member.id}
              player={member}
              selected={member.id === keepId}
              disabled={busy}
              onClick={() => onPick(member)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function BoxCard({
  box,
  holder,
  busy,
  picking,
  onTogglePick,
  onUse,
  onUndo,
  onClose,
  children,
}: {
  box: ShuttleBox
  holder: Player | null
  busy: boolean
  picking: boolean
  onTogglePick: () => void
  onUse: () => void
  onUndo: () => void
  onClose: () => void
  children?: ReactNode
}) {
  const remaining = remainingInBox(box)
  return (
    <article className="space-y-3 rounded-3xl bg-[#14382c] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar player={holder} size="md" />
          <div className="min-w-0">
            <p className="truncate font-bold">{holder?.name ?? 'No member'}</p>
            <p className="text-xs text-[#9bb5a8]">
              {remaining} left · {box.used} used
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onTogglePick}
            className="text-xs font-bold uppercase tracking-wider text-[#f0c14b] disabled:opacity-40"
          >
            {picking ? 'Done' : holder ? 'Change' : 'Assign'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider text-[#9bb5a8] disabled:opacity-40"
          >
            Close
          </button>
        </div>
      </div>

      <ol className="flex justify-between gap-1.5" aria-label={`${holder?.name ?? 'Unassigned'} shuttles`}>
        {Array.from({ length: SHUTTLES_PER_BOX }, (_, index) => {
          const spent = index < box.used
          return (
            <li
              key={index}
              className={`flex h-9 flex-1 items-center justify-center rounded-xl ${
                spent ? 'bg-[#0c1f18] text-[#5f7a6e]' : 'bg-[#f0c14b] text-[#0c1f18]'
              }`}
            >
              <ShuttlePip />
            </li>
          )
        })}
      </ol>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || remaining === 0}
          onClick={onUse}
          className="rounded-full bg-[#f0c14b] py-2 text-sm font-bold text-[#0c1f18] disabled:opacity-40"
        >
          Use one
        </button>
        <button
          type="button"
          disabled={busy || box.used === 0}
          onClick={onUndo}
          className="rounded-full border border-[#d7ecd0]/25 py-2 text-sm font-bold text-[#d7ecd0] disabled:opacity-40"
        >
          Undo
        </button>
      </div>

      {children}
    </article>
  )
}

function ClosedBoxRow({ box, players }: { box: ShuttleBox; players: Player[] }) {
  const holder = players.find((player) => player.id === box.holder_id)
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-[#14382c]/70 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar player={holder} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{holder?.name ?? 'Unassigned'}</p>
          <p className="text-xs text-[#9bb5a8]">{formatDayLong(box.opened_on)}</p>
        </div>
      </div>
      <p className="shrink-0 text-sm font-bold text-[#f0c14b]">
        {box.used}/{SHUTTLES_PER_BOX}
      </p>
    </li>
  )
}

function ShuttlePip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v4M8 5.5 12 7l4-1.5M7 9h10l-1.2 8.5a4 4 0 0 1-7.6 0L7 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
