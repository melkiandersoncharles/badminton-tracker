import { currentMonthKey } from '../lib/dates'
import { formatRupee, MONTHLY_COURT_FEE, playerCourtUtilizationForMonth } from '../lib/courtFee'
import type { Match } from '../lib/types'

export function CourtUtilization({
  playerId,
  matches,
  month = currentMonthKey(),
  embedded = false,
  compact = false,
}: {
  playerId: string
  matches: Match[]
  month?: string
  embedded?: boolean
  compact?: boolean
}) {
  const stats = playerCourtUtilizationForMonth(playerId, matches, month)
  const progressPct = stats.isCurrentMonth ? stats.utilizationSoFarPct : stats.utilizationMonthPct
  const progressLabel = stats.isCurrentMonth
    ? `${stats.usedWeekdays} / ${stats.weekdaysSoFar} weekdays`
    : `${stats.usedWeekdays} / ${stats.totalWeekdaysInMonth} weekdays`

  const content = (
    <>
      <div className={compact ? 'text-center' : 'flex items-start justify-between gap-2'}>
        <div className={compact ? undefined : 'min-w-0'}>
          <h3 className={compact ? 'text-[11px] font-bold' : 'text-sm font-bold'}>Court use</h3>
          {!compact ? (
            <p className="mt-0.5 text-[10px] text-[#9bb5a8]">
              {formatRupee(MONTHLY_COURT_FEE)} · Mon–Fri
            </p>
          ) : null}
        </div>
        <p
          className={`font-extrabold tabular-nums text-[#f0c14b] ${
            compact ? 'mt-1 text-2xl' : 'shrink-0 text-xl'
          }`}
        >
          {progressPct}%
        </p>
      </div>

      <div className={`overflow-hidden rounded-full bg-[#0c1f18] ${compact ? 'mt-2 h-1.5' : 'mt-3 h-2'}`}>
        <div
          className="h-full rounded-full bg-[#f0c14b] transition-all"
          style={{ width: `${Math.min(100, progressPct)}%` }}
        />
      </div>

      <p className={`font-semibold text-[#9bb5a8] ${compact ? 'mt-1.5 text-[10px]' : 'mt-2 text-[11px]'}`}>
        {progressLabel}
      </p>

      <div className={compact ? 'mt-2 space-y-1.5' : 'mt-3 space-y-2'}>
        <StatBox
          compact={compact}
          label="Days"
          value={String(stats.usedWeekdays)}
          hint={stats.isCurrentMonth ? `${stats.weekdaysRemaining} left` : 'Weekdays'}
        />
        <StatBox
          compact={compact}
          label="Cost/day"
          value={stats.costPerUsedDay ? formatRupee(stats.costPerUsedDay) : '—'}
          hint={stats.usedWeekdays > 0 ? 'When you play' : 'No sessions'}
        />
      </div>
    </>
  )

  if (embedded) {
    return <div className="min-w-0">{content}</div>
  }

  return (
    <section className="rounded-3xl border border-[#f0c14b]/40 bg-[#14382c] p-4">{content}</section>
  )
}

function StatBox({
  label,
  value,
  hint,
  compact = false,
}: {
  label: string
  value: string
  hint: string
  compact?: boolean
}) {
  return (
    <div className={`rounded-lg bg-[#0c1f18]/50 text-center ${compact ? 'px-2 py-1.5' : 'px-2.5 py-2'}`}>
      <p className={`font-bold uppercase tracking-wider text-[#9bb5a8] ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
        {label}
      </p>
      <p className={`font-extrabold tabular-nums ${compact ? 'text-sm' : 'mt-0.5 text-base'}`}>{value}</p>
      {!compact ? <p className="mt-0.5 text-[9px] text-[#9bb5a8]">{hint}</p> : null}
    </div>
  )
}
