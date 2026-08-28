import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { PlayerChip } from '../components/PlayerChip'
import { useData } from '../context/DataContext'
import { todayISO } from '../lib/dates'

const emptySlots = {
  team_a_1: '',
  team_a_2: '',
  team_b_1: '',
  team_b_2: '',
}

type SlotKey = keyof typeof emptySlots

const slotOrder: SlotKey[] = ['team_a_1', 'team_a_2', 'team_b_1', 'team_b_2']

export function AddMatchScreen() {
  const navigate = useNavigate()
  const { players, addMatch } = useData()
  const [playedOn, setPlayedOn] = useState(todayISO())
  const [slots, setSlots] = useState(emptySlots)
  const [scoreA, setScoreA] = useState(21)
  const [scoreB, setScoreB] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const taken = useMemo(() => new Set(Object.values(slots).filter(Boolean)), [slots])

  function assignPlayer(id: string) {
    if (taken.has(id)) {
      const key = slotOrder.find((slot) => slots[slot] === id)
      if (key) setSlots((prev) => ({ ...prev, [key]: '' }))
      return
    }
    const nextEmpty = slotOrder.find((slot) => !slots[slot])
    if (!nextEmpty) return
    setSlots((prev) => ({ ...prev, [nextEmpty]: id }))
  }

  function clearSlot(key: SlotKey) {
    setSlots((prev) => ({ ...prev, [key]: '' }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const ids = slotOrder.map((key) => slots[key])
    if (ids.some((id) => !id) || new Set(ids).size !== 4) {
      setError('Pick four different players')
      return
    }
    if (scoreA === scoreB) {
      setError('Scores need a winner')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await addMatch({
        played_on: playedOn,
        court: 1,
        team_a_1: slots.team_a_1,
        team_a_2: slots.team_a_2,
        team_b_1: slots.team_b_1,
        team_b_2: slots.team_b_2,
        score_a: scoreA,
        score_b: scoreB,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save match')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-5 pb-6" onSubmit={(e) => void onSubmit(e)}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">New doubles</p>
          <h1 className="mt-1 text-2xl font-bold">Add match</h1>
        </div>
        <button type="button" className="text-sm text-[#9bb5a8]" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </header>

      <label className="block text-sm">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#9bb5a8]">Date</span>
        <input
          type="date"
          value={playedOn}
          onChange={(e) => setPlayedOn(e.target.value)}
          className="w-full rounded-2xl border border-[#d7ecd0]/15 bg-[#143328] px-3 py-3 text-ink outline-none"
        />
      </label>

      <div className="rounded-3xl border border-[#d7ecd0]/15 bg-[#143328] p-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="space-y-2">
            <Slot playerId={slots.team_a_1} players={players} onClear={() => clearSlot('team_a_1')} />
            <Slot playerId={slots.team_a_2} players={players} onClear={() => clearSlot('team_a_2')} />
          </div>
          <p className="px-1 text-xs font-bold uppercase tracking-widest text-[#f0c14b]">vs</p>
          <div className="space-y-2">
            <Slot playerId={slots.team_b_1} players={players} onClear={() => clearSlot('team_b_1')} />
            <Slot playerId={slots.team_b_2} players={players} onClear={() => clearSlot('team_b_2')} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ScoreStepper label="Team A" value={scoreA} onChange={setScoreA} />
          <ScoreStepper label="Team B" value={scoreB} onChange={setScoreB} />
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[#9bb5a8]">Tap four players</h2>
        {players.length === 0 ? (
          <p className="text-sm text-[#9bb5a8]">Add players first on the Players tab.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <PlayerChip
                key={player.id}
                player={player}
                selected={taken.has(player.id)}
                disabled={!taken.has(player.id) && taken.size >= 4}
                onClick={() => assignPlayer(player.id)}
              />
            ))}
          </div>
        )}
      </section>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-[#f0c14b] py-3.5 text-base font-bold text-[#0c1f18] disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Save match'}
      </button>
    </form>
  )
}

function Slot({
  playerId,
  players,
  onClear,
}: {
  playerId: string
  players: { id: string; name: string; photo_url: string | null }[]
  onClear: () => void
}) {
  const player = players.find((p) => p.id === playerId)
  if (!player) {
    return (
      <div className="flex h-[3.25rem] items-center justify-center rounded-2xl border border-dashed border-[#d7ecd0]/25 text-[11px] text-[#9bb5a8]">
        Empty
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onClear}
      className="flex h-[3.25rem] w-full items-center gap-2 rounded-2xl bg-[#0c1f18] px-2 text-left"
    >
      <Avatar player={player} size="sm" />
      <span className="line-clamp-2 text-xs font-semibold">{player.name}</span>
    </button>
  )
}

function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div>
      <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-[#9bb5a8]">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="h-11 w-11 rounded-xl bg-[#0c1f18] text-xl font-bold"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-11 w-14 rounded-xl bg-[#0c1f18] text-center text-xl font-extrabold tabular-nums outline-none"
        />
        <button
          type="button"
          className="h-11 w-11 rounded-xl bg-[#0c1f18] text-xl font-bold"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
