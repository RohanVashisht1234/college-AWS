import { ReactNode } from 'react'

export default function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
}: {
  icon: ReactNode
  label: string
  value: string | number
  subtext: string
  trend?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-head">
        <div className="stat-icon">{icon}</div>
        {trend ? <span className="trend-pill">{trend}</span> : null}
      </div>
      <h3>{value}</h3>
      <p className="stat-label">{label}</p>
      <span className="stat-subtext">{subtext}</span>
    </div>
  )
}
