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
import { PlayersScreen } from './screens/PlayersScreen'
import { PlayerProfileScreen } from './screens/PlayerProfileScreen'
import { ShuttleScreen } from './screens/ShuttleScreen'
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
                <Route path="/shuttle" element={<ShuttleScreen />} />
                <Route path="/match/new" element={<AddMatchScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="/history/:date" element={<DayScreen />} />
                <Route path="/board" element={<BoardScreen />} />
                <Route path="/activity" element={<ActivityScreen />} />
                <Route path="/players" element={<PlayersScreen />} />
                <Route path="/players/:id" element={<PlayerProfileScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </OperatorGate>
        </DataProvider>
      </PinGate>
    </BrowserRouter>
  )
}
