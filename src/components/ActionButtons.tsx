import { Link } from 'react-router-dom'

export function ActionButtons({
  primary,
  secondary,
}: {
  primary: { to: string; label: string }
  secondary: { to: string; label: string }
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link
        to={primary.to}
        className="rounded-2xl bg-[#f0c14b] py-3 text-center text-sm font-bold text-[#0c1f18]"
      >
        {primary.label}
      </Link>
      <Link
        to={secondary.to}
        className="rounded-2xl border border-[#d7ecd0]/20 py-3 text-center text-sm font-bold text-[#9bb5a8]"
      >
        {secondary.label}
      </Link>
    </div>
  )
}
