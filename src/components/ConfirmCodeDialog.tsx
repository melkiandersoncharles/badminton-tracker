import { useEffect, useState, type FormEvent } from 'react'
import { isDeleteCodeValid } from '../lib/deleteCode'

export function ConfirmCodeDialog({
  open,
  title,
  message,
  confirmLabel = 'Remove',
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) {
      setCode('')
      setError(false)
    }
  }, [open])

  if (!open) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!isDeleteCodeValid(code)) {
      setError(true)
      return
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-[#f0c14b]/30 bg-[#143328] p-4"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-[#9bb5a8]">{message}</p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#9bb5a8]">
            Confirmation code
          </span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              setError(false)
            }}
            placeholder="Enter code"
            className="w-full rounded-2xl border border-[#d7ecd0]/15 bg-[#0c1f18] px-4 py-3 text-center text-lg font-bold tracking-[0.3em] outline-none focus:border-[#f0c14b]"
          />
        </label>

        {error ? <p className="mt-2 text-sm text-red-300">Incorrect code.</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[#d7ecd0]/20 py-3 text-sm font-bold text-[#9bb5a8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-red-600 py-3 text-sm font-bold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
