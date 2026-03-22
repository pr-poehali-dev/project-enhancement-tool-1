import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const AUTH_URL = "https://functions.poehali.dev/19486cfe-75c4-41b6-aeda-a5498723025d"
const TOKEN_KEY = "vibespace_token"

export type User = {
  id: number
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${AUTH_URL}?action=me`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        else { localStorage.removeItem(TOKEN_KEY); setToken(null) }
      })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  const saveSession = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка входа")
    saveSession(data.token, data.user)
  }

  const register = async (username: string, email: string, password: string, displayName: string) => {
    const res = await fetch(`${AUTH_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, displayName }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка регистрации")
    saveSession(data.token, data.user)
  }

  const logout = async () => {
    if (token) {
      await fetch(`${AUTH_URL}?action=logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
