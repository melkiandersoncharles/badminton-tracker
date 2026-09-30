import { Link, useParams, useSearchParams } from 'react-router-dom'

import { AttendanceGrid } from '../components/AttendanceGrid'

import { BackLink } from '../components/BackLink'

import { EmptyState } from '../components/EmptyState'

import { MatchCard } from '../components/MatchCard'

import { RecapHighlights } from '../components/RecapHighlights'

import { useData } from '../context/DataContext'

import { formatDayLong, monthKey } from '../lib/dates'

import { bestPair, bestPerformer, membersPresentForDay, playerById, sideOf } from '../lib/stats'



export function DayScreen() {

  const { date } = useParams()

  const [searchParams] = useSearchParams()

  const { matches, players, removeMatch } = useData()

  const day = date ?? ''

  const playerId = searchParams.get('player')

  const player = playerId ? playerById(players, playerId) : undefined

  const dayMatches = matches.filter((match) => match.played_on === day)

  const visibleMatches = playerId

    ? dayMatches.filter((match) => sideOf(match, playerId) !== null)

    : dayMatches

  const present = membersPresentForDay(matches, players, day)

  const month = monthKey(day)

  const backTo = playerId ? `/players/${playerId}/month/${month}` : `/history/month/${month}`

  const dayPeriod = {

    kind: 'day' as const,

    start: day,

    end: day,

    label: formatDayLong(day),

  }



  if (!day) {

    return <p className="text-sm text-[#9bb5a8]">Missing date</p>

  }



  return (

    <div className="space-y-4">

      <BackLink to={backTo} label={playerId ? 'Month' : 'Month'} />



      <header>

        <h1 className="mt-2 text-2xl font-bold">

          {player ? `${player.name} · ` : ''}

          {formatDayLong(day)}

        </h1>

        {player ? (

          <p className="mt-1 text-sm text-[#9bb5a8]">

            {visibleMatches.length === 1 ? '1 match' : `${visibleMatches.length} matches`} played

          </p>

        ) : (

          <p className="mt-1 text-sm text-[#9bb5a8]">

            {dayMatches.length} {dayMatches.length === 1 ? 'match' : 'matches'} · {present.length} members

          </p>

        )}

      </header>



      {player ? null : (

        <RecapHighlights

          period={dayPeriod}

          matchCount={dayMatches.length}

          performer={bestPerformer(players, dayMatches)}

          pair={bestPair(players, dayMatches)}

        />

      )}



      <section className="space-y-2">

        <h2 className="text-base font-bold">{player ? 'Your matches' : 'Matches'}</h2>

        {visibleMatches.length === 0 ? (

          <EmptyState>{player ? 'No matches for you on this day.' : 'No matches on this day.'}</EmptyState>

        ) : (

          visibleMatches.map((match) => (

            <MatchCard

              key={match.id}

              match={match}

              highlightId={playerId ?? undefined}

              onDelete={(id) => void removeMatch(id)}

            />

          ))

        )}

      </section>



      {player && dayMatches.length > visibleMatches.length ? (

        <Link to={`/history/${day}`} className="block text-center text-xs font-semibold text-[#f0c14b]">

          View all {dayMatches.length} club matches this day

        </Link>

      ) : null}



      {player ? null : (

        <section>

          <h2 className="mb-3 text-base font-bold">Members present · {present.length}</h2>

          {present.length === 0 ? (

            <EmptyState>No members recorded for this day.</EmptyState>

          ) : (

            <AttendanceGrid players={present} />

          )}

        </section>

      )}

    </div>

  )

}


