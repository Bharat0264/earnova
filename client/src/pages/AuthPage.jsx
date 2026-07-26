import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/common/PageMeta'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { login, register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    const needsOnboarding = user?.onboarding?.status !== 'completed'
    navigate(needsOnboarding ? '/onboarding' : (location.state?.from || '/app/overview'), { replace: true })
  }, [isAuthenticated, location.state, navigate, user])

  const update = key => event => setForm(current => ({ ...current, [key]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isRegister) {
        await register(form)
        navigate('/onboarding', { replace: true })
      } else {
        const result = await login(form.email, form.password)
        navigate(result.user?.onboarding?.status === 'completed' ? (location.state?.from || '/app/overview') : '/onboarding', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta title={isRegister ? 'Create account' : 'Login'} noIndex />
      <section className="bg-slate-50 px-4 py-12 sm:py-20">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-slate-950 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Earnova</p>
            <h1 className="mt-4 text-3xl font-bold">{isRegister ? 'Create your connected workspace.' : 'Welcome back.'}</h1>
            <p className="mt-4 leading-relaxed text-slate-300">Business tools, trusted professionals and energy solutions—organized around what you want to accomplish.</p>
          </div>
          <form onSubmit={submit} className="p-6 sm:p-10" noValidate>
            <h2 className="text-2xl font-bold text-slate-950">{isRegister ? 'Create account' : 'Sign in'}</h2>
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}
            <div className="mt-6 space-y-4">
              {isRegister && (
                <>
                  <label className="form-field"><span>Full name</span><input className="input-base" value={form.name} onChange={update('name')} autoComplete="name" required minLength={2} /></label>
                  <label className="form-field"><span>Mobile number <small>(optional)</small></span><input className="input-base" value={form.phone} onChange={update('phone')} autoComplete="tel" inputMode="tel" /></label>
                </>
              )}
              <label className="form-field"><span>Email address</span><input className="input-base" type="email" value={form.email} onChange={update('email')} autoComplete="email" required /></label>
              <label className="form-field"><span>Password</span><input className="input-base" type="password" value={form.password} onChange={update('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required /></label>
            </div>
            {!isRegister && <Link to="/forgot-password" className="mt-3 inline-block text-sm font-bold text-brand-700 hover:underline">Forgot password?</Link>}
            <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
            <p className="mt-5 text-center text-sm text-slate-600">
              {isRegister ? 'Already have an account?' : 'New to Earnova?'}{' '}
              <Link className="font-bold text-brand-700 hover:underline" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  )
}
