import { useEffect, useState } from 'react'
import { FileDown, Presentation, Sparkles } from 'lucide-react'
import { getReports, getVersion } from '../api'
import { useAuth } from '../auth'
import { ReportSummary, VersionResponse } from '../types'
import StatCard from '../components/StatCard'

export default function ReportsPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [version, setVersion] = useState<VersionResponse | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      const [s, v] = await Promise.all([getReports(token), getVersion()])
      setSummary(s)
      setVersion(v)
    }
    load()
  }, [token])

  return (
    <div className="page-stack">
      <section className="hero-banner compact">
        <div>
          <p className="eyebrow">Executive reporting</p>
          <h1>Leadership insights for TutorBot operations.</h1>
          <p>Summaries, KPIs, and business visibility for academic operations.</p>
        </div>
        <div className="action-row">
          <button className="secondary-btn"><FileDown size={16} /> Export PDF</button>
          <button className="secondary-btn"><Presentation size={16} /> Presentation view</button>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard icon={<Sparkles size={20} />} label="Students" value={summary?.students ?? 0} subtext="Database-backed records" />
        <StatCard icon={<Sparkles size={20} />} label="Courses" value={summary?.courses ?? 0} subtext="Academic programs" />
        <StatCard icon={<Sparkles size={20} />} label="Enrollments" value={summary?.enrollments ?? 0} subtext="Cross-linked activity" />
        <StatCard icon={<Sparkles size={20} />} label="Assignments" value={summary?.assignments ?? 0} subtext="Task lifecycle" />
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <h3>Summary narrative</h3>
          <span className="chip">{version?.environment ?? 'production'}</span>
        </div>
        <div className="insight-box">
          <p>
            TutorBot AI Education Cloud combines secure cloud hosting, managed MySQL storage, container-ready deployment, and role-aware operational dashboards.
          </p>
          <p>
            Generated on {summary?.generated_at ? new Date(summary.generated_at).toLocaleString() : '—'} for leadership and academic review.
          </p>
        </div>
      </section>
    </div>
  )
}
