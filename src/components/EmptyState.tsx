import type { ReactNode } from 'react'

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-[#d7ecd0]/20 px-4 py-8 text-center text-sm text-[#9bb5a8]">
      {children}
    </p>
  )
}
