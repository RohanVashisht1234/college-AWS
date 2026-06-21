import { NavLink } from 'react-router-dom'
import { BookOpen, BrainCircuit, LayoutDashboard, LogOut, MonitorCheck, Network, School2, ShieldCheck, FileBarChart2 } from 'lucide-react'
import { useAuth } from '../auth'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: School2 },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/assignments', label: 'Assignments', icon: BrainCircuit },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/cloud-health', label: 'Cloud Health', icon: MonitorCheck },
  { to: '/system-design', label: 'System Design', icon: Network },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand-card">
        <div className="brand-mark">TB</div>
        <div>
          <h1>TutorBot</h1>
          <p>AI Education Cloud</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="role-card">
          <ShieldCheck size={18} />
          <div>
            <strong>{user?.role ?? 'guest'}</strong>
            <span>{user?.username ?? 'offline'}</span>
          </div>
        </div>
        <button className="ghost-btn" onClick={signOut}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
