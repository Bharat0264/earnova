import { createContext, useContext, useState, useEffect } from 'react'
import { apiUrl, parseJsonResponse } from '../utils/api'
import { DEFAULT_PUBLIC_ACCESS } from '../config/features'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [token,   setToken]   = useState(() => localStorage.getItem('earnova_token'))

  /* Verify stored token on mount */
  useEffect(() => {
    if (!token) { setLoading(false); return }
    let cancelled = false
    fetch(apiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? parseJsonResponse(r) : null)
      .then(data => {
        if (!cancelled) {
          if (data?.user) setUser(data.user)
          else { setToken(null); localStorage.removeItem('earnova_token') }
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  const saveSession = (tokenVal, userData) => {
    setToken(tokenVal)
    setUser(userData)
    localStorage.setItem('earnova_token', tokenVal)
  }

  const login = async (email, password) => {
    const res  = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Login failed')
    if (!data?.token || !data?.user) throw new Error('Login failed')
    saveSession(data.token, data.user)
    return data
  }

  const register = async (payload) => {
    const res  = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Registration failed')
    if (!data?.token || !data?.user) throw new Error('Registration failed')
    saveSession(data.token, data.user)
    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('earnova_token')
  }

  useEffect(() => {
    window.addEventListener('earnova:auth-expired', logout)
    return () => window.removeEventListener('earnova:auth-expired', logout)
  }, [])

  const updateUser = (updates) =>
    setUser(prev => prev ? { ...prev, ...updates } : null)

  const hasFeature = (feature) => {
    if (user?.role === 'admin') return true
    return user?.featureAccess?.[feature] ?? DEFAULT_PUBLIC_ACCESS[feature] ?? false
  }

  return (
    <AuthContext.Provider value={{
      user, loading, token,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login, register, logout, updateUser, hasFeature,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
