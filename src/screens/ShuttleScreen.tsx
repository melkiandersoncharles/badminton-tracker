import { useMemo, useState } from 'react'
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
    setClubHolder,
    useShuttle,
    undoShuttle,
  } = useData()
  const [pickingHolder, setPickingHolder] = useState(false)
  const [busy, setBusy] = useState(false)

  const boxes = clubOpenBoxes(shuttleBoxes)
  const closedBoxes = shuttleBoxes.filter((box) => box.closed_at !== null)
  const holder = players.find((player) => player.id === boxes[0]?.holder_id) ?? null
  const used = boxes.reduce((sum, box) => sum + box.used, 0)
  const stock = boxes.length * SHUTTLES_PER_BOX
  const remaining = boxes.reduce((sum, box) => sum + remainingInBox(box), 0)
  const boxWord = boxes.length === 1 ? 'box' : 'boxes'

  const holderChoices = useMemo(() => {
    const members = players.filter((player) => !player.is_guest)
    const guests = players.filter((player) => player.is_guest)
    return [...members, ...guests]
  }, [players])

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
              ? `Add as many boxes as you need · ${SHUTTLES_PER_BOX} shuttles each`
              : `${boxes.length} ${boxWord} · ${SHUTTLES_PER_BOX} shuttles each`}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || Boolean(shuttleError)}
          onClick={() => void run(() => addShuttleBox())}
          className="shrink-0 rounded-full bg-[#f0c14b] px-3 py-2 text-xs font-bold text-[#0c1f18] disabled:opacity-40"
        >
          Add a box
        </button>
      </header>

      {shuttleError ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {shuttleError}
        </p>
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
        <h2 className="text-base font-bold">Use from the boxes</h2>
        {boxes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
            No boxes yet. Tap Add a box for each pack of {SHUTTLES_PER_BOX}.
          </p>
        ) : (
          boxes.map((box, index) => (
            <BoxCard
              key={box.id}
              box={box}
              label={`Box ${index + 1}`}
              busy={busy}
              onUse={() => void run(() => useShuttle(box.id))}
              onUndo={() => void run(() => undoShuttle(box.id))}
              onClose={() => {
                const left = remainingInBox(box)
                if (left > 0) {
                  const ok = window.confirm(
                    `Box ${index + 1} still has ${left} shuttle${left === 1 ? '' : 's'} left. Close it anyway?`,
                  )
                  if (!ok) return
                }
                void run(() => closeShuttleBox(box.id))
              }}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">Who has the boxes</h2>
          {boxes.length > 0 ? (
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wider text-[#f0c14b]"
              onClick={() => setPickingHolder((open) => !open)}
            >
              {pickingHolder ? 'Done' : holder ? 'Change' : 'Assign'}
            </button>
          ) : null}
        </div>

        {boxes.length > 0 ? (
          <HolderCard holder={holder} boxCount={boxes.length} />
        ) : (
          <p className="text-sm text-[#9bb5a8]">Add a box, then pick who is carrying them.</p>
        )}

        {boxes.length > 0 && (pickingHolder || !holder) ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await setClubHolder(null)
                  setPickingHolder(false)
                })
              }
              className={`rounded-2xl px-3 py-3 text-xs font-semibold ${
                !holder ? 'bg-[#f0c14b] text-[#0c1f18]' : 'bg-[#1c4a3a] text-[#d7ecd0]'
              }`}
            >
              Nobody yet
            </button>
            {holderChoices.map((player) => (
              <PlayerChip
                key={player.id}
                player={player}
                selected={holder?.id === player.id}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await setClubHolder(player.id)
                    setPickingHolder(false)
                  })
                }
              />
            ))}
          </div>
        ) : null}
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

function BoxCard({
  box,
  label,
  busy,
  onUse,
  onUndo,
  onClose,
}: {
  box: ShuttleBox
  label: string
  busy: boolean
  onUse: () => void
  onUndo: () => void
  onClose: () => void
}) {
  const remaining = remainingInBox(box)
  return (
    <article className="rounded-3xl bg-[#14382c] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c14b]">{label}</p>
          <p className="mt-1 text-xl font-bold">
            {remaining} left
            <span className="ml-1 text-sm font-semibold text-[#9bb5a8]">/ {SHUTTLES_PER_BOX}</span>
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="text-xs font-bold uppercase tracking-wider text-[#9bb5a8] disabled:opacity-40"
        >
          Close
        </button>
      </div>

      <ol className="mt-3 flex justify-between gap-1.5" aria-label={`${label} shuttles`}>
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

      <div className="mt-3 grid grid-cols-2 gap-2">
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
    </article>
  )
}

function HolderCard({ holder, boxCount }: { holder: Player | null; boxCount: number }) {
  const boxWord = boxCount === 1 ? 'box' : 'boxes'
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#14382c] px-3 py-3">
      <Avatar player={holder} size="md" />
      <div>
        <p className="font-bold">{holder ? holder.name : 'Not assigned'}</p>
        <p className="text-xs text-[#9bb5a8]">
          {holder ? `Carrying ${boxCount} ${boxWord}` : 'Tap Assign to pick someone'}
        </p>
      </div>
    </div>
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
