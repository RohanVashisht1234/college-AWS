import { Outlet, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppShell() {
  const location = useLocation()
  const pageTitle = useMemo(() => {
    const map: Record<string, string> = {
      '/': 'Dashboard',
      '/students': 'Students',
      '/courses': 'Courses',
      '/assignments': 'Assignments',
      '/reports': 'Reports',
      '/cloud-health': 'Cloud Health',
      '/system-design': 'System Design',
    }
    return map[location.pathname] ?? 'TutorBot'
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-shell">
        <Header title={pageTitle} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
