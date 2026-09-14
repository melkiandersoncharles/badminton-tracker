import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OperatorGate } from './components/OperatorGate'
import { PinGate } from './components/PinGate'
import { Shell } from './components/Shell'
import { DataProvider } from './context/DataContext'
import { isAdminAuthenticated } from './lib/admin'
import { ActivityScreen } from './screens/ActivityScreen'
import { AddMatchScreen } from './screens/AddMatchScreen'
import { AdminLoginScreen } from './screens/AdminLoginScreen'
import { AdminTeamsScreen } from './screens/AdminTeamsScreen'
import { BoardScreen } from './screens/BoardScreen'
import { DayScreen } from './screens/DayScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { PlayerProfileScreen } from './screens/PlayerProfileScreen'
import { ShuttleScreen } from './screens/ShuttleScreen'
import { TodayScreen } from './screens/TodayScreen'

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated)
  if (!authenticated) {
    return <AdminLoginScreen onSuccess={() => setAuthenticated(true)} />
  }
  return <AdminTeamsScreen onLogout={() => setAuthenticated(false)} />
}

function ClubApp() {
  return (
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={<ClubApp />} />
      </Routes>
    </BrowserRouter>
  )
}
