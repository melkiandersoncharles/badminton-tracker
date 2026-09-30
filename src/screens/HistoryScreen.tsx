import { useMemo, useState } from 'react'

import { Link, useSearchParams } from 'react-router-dom'

import { Avatar } from '../components/Avatar'

import { ClubAttendanceCalendar } from '../components/ClubAttendanceCalendar'

import { EmptyState } from '../components/EmptyState'

import { ScreenHeader } from '../components/ScreenHeader'

import { SegmentedControl } from '../components/SegmentedControl'

import { useData } from '../context/DataContext'

import { currentMonthKey, formatMonthLabel, monthBounds } from '../lib/dates'

import {

  buildAttendance,

  daysWithMatchesInMonth,

  matchesInMonth,

  membersPresentInRange,

  monthKeysFromMatches,

} from '../lib/stats'

import type { Match, Player } from '../lib/types'



type HistoryView = 'attendance' | 'days'



export function HistoryScreen() {

  const [searchParams, setSearchParams] = useSearchParams()

  const view: HistoryView = searchParams.get('view') === 'days' ? 'days' : 'attendance'

  const { matches, players } = useData()



  function switchView(next: HistoryView) {

    setSearchParams(next === 'attendance' ? {} : { view: next }, { replace: true })

  }



  return (

    <div className="space-y-4">

      <ScreenHeader eyebrow="Club" title="History" subtitle="Attendance and past sessions" />



      <SegmentedControl

        value={view}

        onChange={switchView}

        options={[

          { value: 'attendance', label: 'Attendance' },

          { value: 'days', label: 'By day' },

        ]}

      />



      {view === 'attendance' ? <AttendancePanel players={players} matches={matches} /> : <DaysPanel matches={matches} players={players} />}

    </div>

  )

}



function AttendancePanel({ players, matches }: { players: Player[]; matches: Match[] }) {

  const currentMonth = currentMonthKey()

  const months = useMemo(() => {

    const keys = new Set(monthKeysFromMatches(matches))

    keys.add(currentMonth)

    return [...keys].sort((a, b) => b.localeCompare(a))

  }, [matches, currentMonth])



  const [filter, setFilter] = useState<string>(currentMonth)

  const rows = buildAttendance(players, matches, filter)

  const presentCount = rows.filter((row) => row.days > 0).length

  const periodLabel = filter === 'all' ? 'Overall' : formatMonthLabel(filter)



  return (

    <div className="space-y-4">

      <label className="block">

        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#9bb5a8]">Period</span>

        <select

          value={filter}

          onChange={(event) => setFilter(event.target.value)}

          className="w-full rounded-2xl border border-[#d7ecd0]/15 bg-[#143328] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#f0c14b]"

        >

          {months.map((key) => (

            <option key={key} value={key}>

              {formatMonthLabel(key)}

              {key === currentMonth ? ' (current)' : ''}

            </option>

          ))}

          <option value="all">Overall</option>

        </select>

      </label>



      <p className="text-sm text-[#9bb5a8]">

        {presentCount} of {rows.length} members · {periodLabel}

      </p>



      {filter !== 'all' ? (

        <section className="rounded-2xl bg-[#143328] p-4">

          <ClubAttendanceCalendar month={filter} matches={matches} players={players} />

        </section>

      ) : null}



      {rows.length === 0 ? (

        <EmptyState>Add members to track attendance.</EmptyState>

      ) : (

        <ol className="space-y-2">

          {rows.map((row, index) => (

            <li key={row.player.id}>

              <Link

                to={`/players/${row.player.id}`}

                className="flex items-center gap-3 rounded-2xl bg-[#143328] px-3 py-2.5"

              >

                <span className="w-6 text-center text-sm font-extrabold text-[#f0c14b]">{index + 1}</span>

                <Avatar player={row.player} size="md" />

                <p className="min-w-0 flex-1 truncate font-semibold">{row.player.name}</p>

                <p className="text-right text-sm font-extrabold tabular-nums">

                  {row.days}

                  <span className="ml-1 text-[11px] font-semibold text-[#9bb5a8]">

                    {row.days === 1 ? 'day' : 'days'}

                  </span>

                </p>

              </Link>

            </li>

          ))}

        </ol>

      )}

    </div>

  )

}



function DaysPanel({ matches, players }: { matches: Match[]; players: Player[] }) {

  const currentMonth = currentMonthKey()

  const months = useMemo(() => {

    const keys = new Set(monthKeysFromMatches(matches))

    keys.add(currentMonth)

    return [...keys].sort((a, b) => b.localeCompare(a))

  }, [matches, currentMonth])



  if (months.length === 0) {

    return <EmptyState>Past sessions will land here after you save matches.</EmptyState>

  }



  return (

    <ul className="space-y-2">

      {months.map((key) => {

        const monthMatches = matchesInMonth(matches, key)

        const days = daysWithMatchesInMonth(matches, key)

        const bounds = monthBounds(key)

        const present = membersPresentInRange(matches, players, bounds.start, bounds.end).length

        return (

          <li key={key}>

            <Link

              to={`/history/month/${key}`}

              className="flex items-center justify-between rounded-2xl bg-[#143328] px-4 py-3"

            >

              <div>

                <p className="font-semibold">

                  {formatMonthLabel(key)}

                  {key === currentMonth ? ' (current)' : ''}

                </p>

                <p className="text-xs text-[#9bb5a8]">

                  {days.length} {days.length === 1 ? 'day' : 'days'} · {monthMatches.length}{' '}

                  {monthMatches.length === 1 ? 'match' : 'matches'} · {present} members

                </p>

              </div>

              <span className="text-[#f0c14b]">→</span>

            </Link>

          </li>

        )

      })}

    </ul>

  )

}


