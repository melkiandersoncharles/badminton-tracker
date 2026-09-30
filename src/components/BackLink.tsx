import { Link } from 'react-router-dom'

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-block text-xs font-semibold text-[#f0c14b]">
      ← {label}
    </Link>
  )
}
