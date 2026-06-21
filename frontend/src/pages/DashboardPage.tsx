import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, BookOpen, CheckCircle2, Database, GraduationCap, RefreshCw, Server, Users } from 'lucide-react'
import { getDashboard, getHealth, getMetrics, getReports, getReady, getVersion } from '../api'
import { useAuth } from '../auth'
import StatCard from '../components/StatCard'
import { DashboardResponse, HealthResponse, MetricsResponse, ReportSummary, VersionResponse } from '../types'

const palette = ['#5b8def', '#72d6c9', '#8b7cf6', '#ffb86b']

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [reports, setReports] = useState<ReportSummary | null>(null)
  const [ready, setReady] = useState<{ status: string } | null>(null)
  const [version, setVersion] = useState<VersionResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const [d, h, m, r, rd, v] = await Promise.all([
          getDashboard(token),
          getHealth(token),
          getMetrics(token),
          getReports(token),
          getReady(),
          getVersion(),
        ])
        if (!mounted) return
        setDashboard(d)
        setHealth(h)
        setMetrics(m)
        setReports(r)
        setReady(rd)
        setVersion(v)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [token])

  const chartData = useMemo(() => [
    { name: 'Students', value: dashboard?.total_students ?? 0 },
    { name: 'Courses', value: dashboard?.total_courses ?? 0 },
    { name: 'Enrollments', value: dashboard?.total_enrollments ?? 0 },
    { name: 'Assignments', value: dashboard?.total_assignments ?? 0 },
  ], [dashboard])

  const healthData = useMemo(() => [
    { name: 'Backend', value: health?.status === 'ok' ? 1 : 0.4 },
    { name: 'Database', value: health?.database === 'connected' ? 1 : 0.4 },
    { name: 'Ready', value: ready?.status === 'ready' ? 1 : 0.4 },
    { name: 'Version', value: 1 },
  ], [health, ready])

  if (loading) {
    return <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)}</div>
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>TutorBot cloud platform is live and observable.</h1>
          <p>
            {user?.role === 'teacher'
              ? 'You have administrative access to manage students, courses, assignments, and reports.'
              : 'You are viewing the student experience with read-only access and live cloud status.'}
          </p>
        </div>
        <button className="secondary-btn"><RefreshCw size={16} /> Refresh</button>
      </section>

      <section className="stat-grid">
        <StatCard icon={<Users size={20} />} label="Total Students" value={dashboard?.total_students ?? 0} subtext="Operational records in MySQL" trend="+ live" />
        <StatCard icon={<BookOpen size={20} />} label="Total Courses" value={dashboard?.total_courses ?? 0} subtext="Learning programs and content" />
        <StatCard icon={<GraduationCap size={20} />} label="Enrollments" value={dashboard?.total_enrollments ?? 0} subtext="Active academic linkage" />
        <StatCard icon={<Activity size={20} />} label="Assignments" value={dashboard?.total_assignments ?? 0} subtext="Course task tracking" />
        <StatCard icon={<Database size={20} />} label="Database" value={health?.database ?? 'unknown'} subtext={health?.timestamp ?? ''} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Readiness" value={ready?.status ?? 'unknown'} subtext={version?.environment ?? 'prod'} />
      </section>

      <section className="dashboard-grid">
        <div className="panel-card chart-card">
          <div className="panel-head">
            <h3>Platform summary</h3>
            <span className="chip">{version?.application ?? 'TutorBot'}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card chart-card">
          <div className="panel-head">
            <h3>System health</h3>
            <span className={`chip ${health?.status === 'ok' ? 'chip-good' : 'chip-warn'}`}>{health?.status ?? 'unknown'}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={healthData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                {healthData.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <h3>AWS system design map</h3>
          <span className="chip">Cloud architecture</span>
        </div>
        <div className="architecture-row">
          {['Internet', 'CloudFront', 'ALB', 'EC2 x2', 'MySQL RDS', 'CloudWatch', 'ECR', 'S3'].map((item, idx) => (
            <div className="arch-node" key={item}>
              <strong>{item}</strong>
              <span>{idx === 0 ? 'Users and browsers' : idx === 1 ? 'Static caching' : idx === 2 ? 'Traffic routing' : idx === 3 ? 'App servers' : idx === 4 ? 'Managed DB' : idx === 5 ? 'Observability' : idx === 6 ? 'Container registry' : 'Storage'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <h3>Cloud metrics snapshot</h3>
          <span className="chip">Realtime API values</span>
        </div>
        <div className="metrics-row">
          <div><strong>{metrics?.active_users ?? 0}</strong><span>Active users</span></div>
          <div><strong>{metrics?.courses ?? 0}</strong><span>Courses</span></div>
          <div><strong>{metrics?.enrollments ?? 0}</strong><span>Enrollments</span></div>
          <div><strong>{metrics?.assignments ?? 0}</strong><span>Assignments</span></div>
        </div>
        <p className="fineprint">
          This dashboard is connected to the FastAPI backend and designed to showcase AWS infrastructure, monitoring, and role-aware access.
        </p>
      </section>
    </div>
  )
}
