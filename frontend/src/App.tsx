import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import { Loader2 } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import ReportsPage from './pages/ReportsPage'
import CloudHealthPage from './pages/CloudHealthPage'
import SystemDesignPage from './pages/SystemDesignPage'
import AppShell from './components/AppShell'

function Protected({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="page-center">
        <div className="loading-card">
          <Loader2 className="spin" />
          <p>Loading TutorBot AI Education Cloud…</p>
        </div>
      </div>
    )
  }
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="cloud-health" element={<CloudHealthPage />} />
        <Route path="system-design" element={<SystemDesignPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  )
}
