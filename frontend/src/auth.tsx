import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { login, me } from './api'
import { AuthResponse, CurrentUser, Role } from './types'

type AuthState = {
  token: string | null
  user: CurrentUser | null
  loading: boolean
  signIn: (role: Role, username: string, password: string) => Promise<void>
  signOut: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const TOKEN_KEY = 'tutorbot_token'
const USER_KEY = 'tutorbot_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (token) {
          const freshUser = await me(token)
          setUser(freshUser)
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  const signIn = async (role: Role, username: string, password: string) => {
    const result: AuthResponse = await login(role, username, password)
    setToken(result.token)
    setUser({ username: result.username, role: result.role, token: result.token })
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ username: result.username, role: result.role, token: result.token }))
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const refresh = async () => {
    if (!token) return
    const freshUser = await me(token)
    setUser(freshUser)
    localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
  }

  const value = useMemo(() => ({ token, user, loading, signIn, signOut, refresh }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
