import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OperatorGate } from './components/OperatorGate'
import { PinGate } from './components/PinGate'
import { Shell } from './components/Shell'
import { DataProvider } from './context/DataContext'
import { ActivityScreen } from './screens/ActivityScreen'
import { AddMatchScreen } from './screens/AddMatchScreen'
import { BoardScreen } from './screens/BoardScreen'
import { DayScreen } from './screens/DayScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { MonthScreen } from './screens/MonthScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { PlayerMonthScreen } from './screens/PlayerMonthScreen'
import { PlayerProfileScreen } from './screens/PlayerProfileScreen'
import { TeamBoardScreen } from './screens/TeamBoardScreen'
import { TodayScreen } from './screens/TodayScreen'

export default function App() {
  return (
    <BrowserRouter>
      <PinGate>
        <DataProvider>
          <OperatorGate>
            <Routes>
              <Route element={<Shell />}>
                <Route path="/" element={<TodayScreen />} />
                <Route path="/team" element={<TeamBoardScreen />} />
                <Route path="/attendance" element={<Navigate to="/history" replace />} />
                <Route path="/shuttle" element={<Navigate to="/history" replace />} />
                <Route path="/match/new" element={<AddMatchScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="/history/month/:month" element={<MonthScreen />} />
                <Route path="/history/:date" element={<DayScreen />} />
                <Route path="/board" element={<BoardScreen />} />
                <Route path="/activity" element={<ActivityScreen />} />
                <Route path="/players" element={<PlayersScreen />} />
                <Route path="/players/:id" element={<PlayerProfileScreen />} />
                <Route path="/players/:id/month/:month" element={<PlayerMonthScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </OperatorGate>
        </DataProvider>
      </PinGate>
    </BrowserRouter>
  )
}
