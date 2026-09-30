import type { ReactNode } from 'react'

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0c14b]">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#9bb5a8]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap justify-end gap-2">{actions}</div> : null}
    </header>
  )
}
