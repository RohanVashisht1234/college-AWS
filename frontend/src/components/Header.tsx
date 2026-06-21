import { Bell, Cloud, Menu, UserCircle2 } from 'lucide-react'
import { useAuth } from '../auth'

export default function Header({ title }: { title: string }) {
  const { user } = useAuth()

  return (
    <header className="topbar">
      <div className="title-wrap">
        <button className="icon-btn mobile-only">
          <Menu size={18} />
        </button>
        <div>
          <p className="eyebrow">TutorBot AI Education Cloud</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="status-pill">
          <Cloud size={14} />
          Multi-region ready
        </div>
        <button className="icon-btn">
          <Bell size={18} />
        </button>
        <div className="user-chip">
          <UserCircle2 size={18} />
          <div>
            <strong>{user?.username ?? 'user'}</strong>
            <span>{user?.role ?? 'guest'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
