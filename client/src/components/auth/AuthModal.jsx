import { useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import GoogleSignInButton from './GoogleSignInButton'

function LoginForm({ onSwitch, onSuccess }) {
  const { login, googleLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async action => {
    setError('')
    setLoading(true)
    try {
      await action()
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <GoogleSignInButton onCredential={credential => run(() => googleLogin(credential))} disabled={loading} />
      <div className="flex items-center gap-3 text-xs font-semibold uppercase text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />Existing account<span className="h-px flex-1 bg-gray-200" />
      </div>
      <form onSubmit={event => { event.preventDefault(); run(() => login(email, password)) }} className="space-y-4">
        <label className="form-field"><span>Email address</span><input className="input-base" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label className="form-field"><span>Password</span><input className="input-base" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>
        <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in with existing password
        </button>
      </form>
      <p className="text-center text-sm text-gray-500">New to Earnova? <button type="button" onClick={onSwitch} className="font-semibold text-primary-600 hover:underline">Create with Google</button></p>
    </div>
  )
}

function RegisterForm({ onSwitch, onSuccess }) {
  const { googleLogin } = useAuth()
  const [accountType, setAccountType] = useState('individual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitGoogle = async credential => {
    setError('')
    setLoading(true)
    try {
      const referral = JSON.parse(localStorage.getItem('earnova_ref') || 'null')
      await googleLogin(credential, {
        accountType,
        referralCode: referral?.expiry > Date.now() ? referral.code : undefined,
      })
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <label className="form-field">
        <span>Register as</span>
        <select className="input-base" value={accountType} onChange={event => setAccountType(event.target.value)}>
          <option value="individual">Normal account</option>
          <option value="ca_consultant">Chartered Accountant (CA)</option>
        </select>
      </label>
      {accountType === 'ca_consultant' && <p className="text-xs leading-relaxed text-amber-700">Complete your professional profile after signup. You can accept work only after admin approval.</p>}
      <p className="text-sm text-gray-600">New accounts are created securely with Google.</p>
      <GoogleSignInButton onCredential={submitGoogle} disabled={loading} />
      <p className="text-center text-sm text-gray-500">Already have an account? <button type="button" onClick={onSwitch} className="font-semibold text-primary-600 hover:underline">Sign in</button></p>
    </div>
  )
}

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-4 w-4" /></button>
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-6">
          <img src="/earnova-logo.png" alt="Earnova" className="h-auto w-[250px] object-contain" />
          <p className="mt-2 text-xs text-primary-200">Hire talent, find work, shop products, and grow with Earnova</p>
        </div>
        <div className="flex border-b border-gray-100 bg-gray-50">
          {['login', 'register'].map(item => (
            <button key={item} onClick={() => setTab(item)} className={`flex-1 py-3 text-sm font-semibold ${tab === item ? 'border-b-2 border-primary-600 bg-white text-primary-700' : 'text-gray-500'}`}>
              {item === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-12"><CheckCircle2 className="h-14 w-14 text-eco-500" /><p className="text-lg font-bold">Welcome to Earnova!</p></div>
        ) : (
          <div className="p-6">
            {tab === 'login'
              ? <LoginForm onSwitch={() => setTab('register')} onSuccess={handleSuccess} />
              : <RegisterForm onSwitch={() => setTab('login')} onSuccess={handleSuccess} />}
          </div>
        )}
      </div>
    </div>
  )
}
