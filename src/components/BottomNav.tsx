import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Today', icon: TodayIcon, end: true },
  { to: '/history', label: 'History', icon: HistoryIcon, end: false },
  { to: '/board', label: 'Board', icon: BoardIcon, end: false },
  { to: '/players', label: 'Players', icon: PlayersIcon, end: false },
]

export function BottomNav() {
  return (
    <nav className="shrink-0 border-t border-[#d7ecd0]/15 bg-[#0c1f18] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide ${
                  isActive ? 'text-[#f0c14b]' : 'text-[#9bb5a8]'
                }`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function TodayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M12 5v14" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 20V10M12 20V4M17 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PlayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 19c.3-1.8 1.4-3 3-3 1.7 0 2.8 1.2 3 3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
