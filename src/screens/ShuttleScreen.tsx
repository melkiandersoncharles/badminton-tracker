import { useMemo, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { PlayerChip } from '../components/PlayerChip'
import { useData } from '../context/DataContext'
import { formatDayLong } from '../lib/dates'
import { SHUTTLES_PER_BOX } from '../lib/types'
import type { Player, ShuttleBox } from '../lib/types'

export function ShuttleScreen() {
  const {
    players,
    shuttleBoxes,
    shuttleError,
    openShuttleBox,
    setShuttleHolder,
    useShuttle,
    undoShuttle,
  } = useData()
  const [pickingHolder, setPickingHolder] = useState(false)
  const [busy, setBusy] = useState(false)

  const openBox = shuttleBoxes.find((box) => box.closed_at === null) ?? null
  const closedBoxes = shuttleBoxes.filter((box) => box.closed_at !== null)
  const holder = players.find((player) => player.id === openBox?.holder_id) ?? null
  const used = openBox?.used ?? 0
  const remaining = openBox ? SHUTTLES_PER_BOX - used : 0
  const totalUsed = shuttleBoxes.reduce((sum, box) => sum + box.used, 0)

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
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">Club kit</p>
        <h1 className="mt-1 text-2xl font-bold">Shuttle</h1>
        <p className="mt-1 text-sm text-[#9bb5a8]">
          One box = {SHUTTLES_PER_BOX} shuttles
          {totalUsed > 0 ? ` · ${totalUsed} used in total` : ''}
        </p>
      </header>

      {shuttleError ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {shuttleError}
        </p>
      ) : null}

      {openBox ? (
        <section className="rounded-3xl bg-[#14382c] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9bb5a8]">Remaining</p>
              <p className="mt-1 text-4xl font-bold leading-none">
                {remaining}
                <span className="ml-1 text-lg font-semibold text-[#9bb5a8]">/ {SHUTTLES_PER_BOX}</span>
              </p>
            </div>
            <p className="text-right text-sm text-[#9bb5a8]">
              {used} used
              <br />
              opened {formatDayLong(openBox.opened_on)}
            </p>
          </div>

          <ol className="mt-4 flex justify-between gap-2" aria-label="Shuttles in this box">
            {Array.from({ length: SHUTTLES_PER_BOX }, (_, index) => {
              const spent = index < used
              return (
                <li
                  key={index}
                  className={`flex h-11 flex-1 items-center justify-center rounded-2xl ${
                    spent ? 'bg-[#0c1f18] text-[#5f7a6e]' : 'bg-[#f0c14b] text-[#0c1f18]'
                  }`}
                >
                  <ShuttlePip />
                </li>
              )
            })}
          </ol>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy || remaining === 0}
              onClick={() => void run(() => useShuttle(openBox.id))}
              className="rounded-full bg-[#f0c14b] py-2.5 text-sm font-bold text-[#0c1f18] disabled:opacity-40"
            >
              Use one
            </button>
            <button
              type="button"
              disabled={busy || used === 0}
              onClick={() => void run(() => undoShuttle(openBox.id))}
              className="rounded-full border border-[#d7ecd0]/25 py-2.5 text-sm font-bold text-[#d7ecd0] disabled:opacity-40"
            >
              Undo
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center">
          <p className="text-sm text-[#9bb5a8]">No open box. Tap below when you crack a new pack of 6.</p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">Who has the box</h2>
          {openBox ? (
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wider text-[#f0c14b]"
              onClick={() => setPickingHolder((open) => !open)}
            >
              {pickingHolder ? 'Done' : holder ? 'Change' : 'Assign'}
            </button>
          ) : null}
        </div>

        {openBox ? (
          <HolderCard holder={holder} />
        ) : (
          <p className="text-sm text-[#9bb5a8]">Open a box first, then pick who is carrying it.</p>
        )}

        {openBox && (pickingHolder || !holder) ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await setShuttleHolder(openBox.id, null)
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
                    await setShuttleHolder(openBox.id, player.id)
                    setPickingHolder(false)
                  })
                }
              />
            ))}
          </div>
        ) : null}
      </section>

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (openBox && remaining > 0) {
            const ok = window.confirm(
              `This box still has ${remaining} shuttle${remaining === 1 ? '' : 's'} left. Open a new box anyway?`,
            )
            if (!ok) return
          }
          void run(() => openShuttleBox(openBox?.holder_id ?? null))
        }}
        className="w-full rounded-full border border-[#f0c14b]/70 py-3 text-sm font-bold text-[#f0c14b] disabled:opacity-40"
      >
        {openBox ? 'Open a new box' : 'Open a box of 6'}
      </button>

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

function HolderCard({ holder }: { holder: Player | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#14382c] px-3 py-3">
      <Avatar player={holder} size="md" />
      <div>
        <p className="font-bold">{holder ? holder.name : 'Not assigned'}</p>
        <p className="text-xs text-[#9bb5a8]">
          {holder ? 'Carrying the current box' : 'Tap Assign to pick someone'}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v4M8 5.5 12 7l4-1.5M7 9h10l-1.2 8.5a4 4 0 0 1-7.6 0L7 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
