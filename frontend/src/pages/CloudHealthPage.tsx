import { useEffect, useState } from 'react'
import { CheckCircle2, Database, Gauge, Server } from 'lucide-react'
import { getHealth, getReady, getVersion } from '../api'
import { useAuth } from '../auth'

export default function CloudHealthPage() {
  const { token } = useAuth()
  const [health, setHealth] = useState<any>(null)
  const [ready, setReady] = useState<any>(null)
  const [version, setVersion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      const [h, r, v] = await Promise.all([getHealth(token), getReady(), getVersion()])
      setHealth(h)
      setReady(r)
      setVersion(v)
    }
    load()
  }, [token])

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h3>Cloud Health</h3>
            <p className="muted">Observability for backend and database connectivity.</p>
          </div>
          <span className={`chip ${health?.status === 'ok' ? 'chip-good' : 'chip-warn'}`}>{health?.status ?? 'loading'}</span>
        </div>

        <div className="health-grid">
          <div className="health-card">
            <Server size={22} />
            <strong>Backend</strong>
            <span>{health?.status ?? 'unknown'}</span>
          </div>
          <div className="health-card">
            <Database size={22} />
            <strong>Database</strong>
            <span>{health?.database ?? 'unknown'}</span>
          </div>
          <div className="health-card">
            <CheckCircle2 size={22} />
            <strong>Readiness</strong>
            <span>{ready?.status ?? 'unknown'}</span>
          </div>
          <div className="health-card">
            <Gauge size={22} />
            <strong>Version</strong>
            <span>{version?.version ?? '—'}</span>
          </div>
        </div>

        <div className="log-panel">
          <div className="log-line"><span>ALB</span> Healthy targets discovered</div>
          <div className="log-line"><span>EC2</span> FastAPI service responding on port 80</div>
          <div className="log-line"><span>RDS</span> MySQL endpoint connected and reachable</div>
          <div className="log-line"><span>CloudWatch</span> Metrics and alarms enabled for monitoring</div>
        </div>
      </section>
    </div>
  )
}
