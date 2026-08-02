import { createContext, useContext, useState, useEffect } from 'react'
import { apiUrl, parseJsonResponse } from '../utils/api'
import { DEFAULT_PUBLIC_ACCESS } from '../config/features'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [token,   setToken]   = useState(() => localStorage.getItem('earnova_token'))

  /* Restore an HTTP-only cookie session, or a legacy bearer session during migration. */
  useEffect(() => {
    let cancelled = false
    fetch(apiUrl('/auth/me'), {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
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
  }, [token])

  const saveSession = (tokenVal, userData) => {
    setToken(tokenVal || null)
    setUser(userData)
    if (tokenVal) localStorage.setItem('earnova_token', tokenVal)
    else localStorage.removeItem('earnova_token')
  }

  const login = async (email, password) => {
    const res  = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Login failed')
    if (!data?.user) throw new Error('Login failed')
    saveSession(data.token, data.user)
    return data
  }

  const register = async (payload) => {
    const res  = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Registration failed')
    if (!data?.user) throw new Error('Registration failed')
    saveSession(data.token, data.user)
    return data
  }

  const googleLogin = async (credential, options = {}) => {
    const res = await fetch(apiUrl('/auth/google'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, ...options }),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Google sign-in failed')
    if (!data?.user) throw new Error('Google sign-in failed')
    saveSession(data.token, data.user)
    return data
  }

  const logout = () => {
    fetch(apiUrl('/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {})
    window.google?.accounts?.id?.disableAutoSelect()
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

  const saveOnboarding = async (payload) => {
    const res = await fetch(apiUrl('/auth/onboarding'), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const data = await parseJsonResponse(res)
    if (!res.ok) throw new Error(data?.message || 'Could not save onboarding progress.')
    if (!data?.user) throw new Error('Invalid onboarding response.')
    setUser(data.user)
    return data
  }

  const hasFeature = (feature) => {
    if (user?.role === 'admin') return true
    return user?.featureAccess?.[feature] ?? DEFAULT_PUBLIC_ACCESS[feature] ?? false
  }

  return (
    <AuthContext.Provider value={{
      user, loading, token,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login, register, googleLogin, logout, updateUser, saveOnboarding, hasFeature,
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
