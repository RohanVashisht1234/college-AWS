import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Cloud, GraduationCap, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth'
import { Role } from '../types'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('teacher')
  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(role, username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-badge">
          <Cloud size={16} />
          TutorBot AI Education Cloud
        </div>
        <h1>Unified education operations for the cloud era.</h1>
        <p>
          Role-based access, real-time dashboards, and cloud-native operations for AI-driven personalized learning.
        </p>

        <div className="hero-points">
          <div><BrainCircuit size={18} /> AI-powered education operations</div>
          <div><ShieldCheck size={18} /> Secure role-based access</div>
          <div><GraduationCap size={18} /> Teacher and student views</div>
        </div>

        <div className="hero-illustration">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="cloud-card">
            <span>CloudFront</span>
            <strong>ALB → EC2 → RDS</strong>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to the TutorBot operations dashboard.</p>

          <form onSubmit={submit} className="auth-form">
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </label>

            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user" />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1234"
              />
            </label>

            {error ? <div className="error-box">{error}</div> : null}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : null}
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="demo-note">
            Demo credentials: <strong>user</strong> / <strong>1234</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
