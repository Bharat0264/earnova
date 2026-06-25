import { useState } from 'react'
import { X, Eye, EyeOff, Zap, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function Input({ type = 'text', value, onChange, placeholder, autoComplete, rightEl }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input-base pr-10"
      />
      {rightEl && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>
      )}
    </div>
  )
}

/* ─── Login Form ─── */
function LoginForm({ onSwitch, onSuccess }) {
  const { login }  = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(email, password)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Field label="Email address">
        <Input value={email} onChange={e => setEmail(e.target.value)}
               placeholder="you@example.com" autoComplete="email" type="email" />
      </Field>

      <Field label="Password">
        <Input
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          rightEl={
            <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </Field>

      <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch}
                className="text-primary-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </form>
  )
}

/* ─── Register Form ─── */
function RegisterForm({ onSwitch, onSuccess }) {
  const { register } = useAuth()
  const [form, setForm] = useState(() => {
    // Auto-fill referral code from localStorage if visitor clicked a referral link
    try {
      const stored = JSON.parse(localStorage.getItem('earnova_ref'))
      if (stored && stored.expiry > Date.now()) {
        return { name: '', email: '', phone: '', password: '', referralCode: stored.code }
      }
    } catch {}
    return { name: '', email: '', phone: '', password: '', referralCode: '' }
  })
  const [showPwd,  setShowPwd]  = useState(false)
  const [showRef,  setShowRef]  = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('earnova_ref'))
      return !!(s && s.expiry > Date.now())
    } catch { return false }
  })
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2)  e.name     = 'Name must be at least 2 characters.'
    if (!/\S+@\S+\.\S+/.test(form.email))                  e.email    = 'Enter a valid email address.'
    if (form.phone && !INDIAN_PHONE_RE.test(form.phone))   e.phone    = 'Enter a valid 10-digit Indian mobile number.'
    if (form.password.length < 6)                          e.password = 'Password must be at least 6 characters.'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      onSuccess?.()
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {errors.general && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {errors.general}
        </div>
      )}

      <Field label="Full Name" error={errors.name}>
        <Input value={form.name} onChange={set('name')} placeholder="Raju Sharma" autoComplete="name" />
      </Field>

      <Field label="Email address" error={errors.email}>
        <Input type="email" value={form.email} onChange={set('email')}
               placeholder="you@example.com" autoComplete="email" />
      </Field>

      <Field label="Mobile Number (optional)" error={errors.phone}>
        <Input type="tel" value={form.phone} onChange={set('phone')}
               placeholder="9876543210" autoComplete="tel" />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input
          type={showPwd ? 'text' : 'password'}
          value={form.password} onChange={set('password')}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          rightEl={
            <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </Field>

      {/* Referral code toggle */}
      <div>
        <button type="button" onClick={() => setShowRef(v => !v)}
                className="text-xs text-primary-600 font-semibold hover:underline">
          {showRef ? '− Hide' : '+ Have a referral code?'}
        </button>
        {showRef && (
          <div className="mt-2">
            <Input value={form.referralCode} onChange={set('referralCode')}
                   placeholder="e.g. RAJU7X2K" />
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch}
                className="text-primary-600 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}

/* ═════════════════════════════════════
   MAIN AUTH MODAL
═════════════════════════════════════ */
export default function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }) {
  const [tab, setTab] = useState(initialTab)
  const [done, setDone] = useState(false)

  if (!isOpen) return null

  const handleSuccess = () => {
    setDone(true)
    setTimeout(() => {
      setDone(false)
      onSuccess?.()
      onClose()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Close */}
        <button onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600
                           hover:bg-gray-100 rounded-xl transition-colors z-10">
          <X className="w-4 h-4" />
        </button>

        {/* Brand strip */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-6">
          <div className="flex items-center gap-3">
            <img src="/earnova-logo.png" alt="Earnova" className="w-[250px] h-auto object-contain" />
          </div>
          <p className="text-primary-200 text-xs mt-2">
            Hire talent, find work, shop products, and grow with Earnova
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50">
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-semibold transition-all ${
                      tab === t
                        ? 'bg-white text-primary-700 border-b-2 border-primary-600 -mb-px'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Success state */}
        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle2 className="w-14 h-14 text-eco-500" strokeWidth={1.5} />
            <p className="font-display font-bold text-lg text-gray-900">Welcome to Earnova!</p>
          </div>
        ) : (
          <div className="p-6">
            {tab === 'login' ? (
              <LoginForm onSwitch={() => setTab('register')} onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSwitch={() => setTab('login')} onSuccess={handleSuccess} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
