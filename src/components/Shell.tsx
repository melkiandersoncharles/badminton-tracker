import { Outlet } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { BottomNav } from './BottomNav'

export function Shell() {
  const { mode, error, ready } = useData()

  return (
    <div className="mx-auto flex h-svh max-w-md flex-col overflow-hidden bg-[#0c1f18] shadow-[0_0_80px_rgba(0,0,0,0.45)]">
      {mode === 'local' ? (
        <p className="bg-[#f0c14b] px-4 py-1.5 text-center text-[11px] font-semibold text-[#0c1f18]">
          On this phone only — add Supabase keys in .env to share with the group
        </p>
      ) : null}
      {error ? (
        <p className="bg-red-900/80 px-4 py-2 text-center text-xs text-red-100">{error}</p>
      ) : null}
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        {!ready ? (
          <p className="pt-16 text-center text-sm text-[#9bb5a8]">Loading the club…</p>
        ) : (
          <Outlet />
        )}
      </main>
      <BottomNav />
    </div>
  )
}
