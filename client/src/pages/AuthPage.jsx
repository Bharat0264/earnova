import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import PageMeta from '../components/common/PageMeta'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { login, register, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [accountType, setAccountType] = useState(
    searchParams.get('accountType') === 'ca_consultant' ? 'ca_consultant' : 'individual'
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const destination = resultUser =>
    resultUser?.role === 'admin'
      ? '/app/overview'
      : resultUser?.onboarding?.status === 'completed'
      ? (location.state?.from || '/app/overview')
      : '/onboarding'

  useEffect(() => {
    if (!isAuthenticated) return
    const target = user?.role === 'admin'
      ? '/app/overview'
      : user?.onboarding?.status === 'completed'
      ? (location.state?.from || '/app/overview')
      : '/onboarding'
    navigate(target, { replace: true })
  }, [isAuthenticated, location.state, navigate, user])

  const submitEmail = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = isRegister
        ? await register({ ...form, accountType })
        : await login(form.email, form.password)
      navigate(destination(result.user), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const submitGoogle = async credential => {
    setError('')
    setSubmitting(true)
    try {
      const referral = JSON.parse(localStorage.getItem('earnova_ref') || 'null')
      const result = await googleLogin(credential, {
        accountType,
        referralCode: referral?.expiry > Date.now() ? referral.code : undefined,
      })
      navigate(destination(result.user), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta title={isRegister ? 'Create account with Google' : 'Login'} noIndex />
      <section className="bg-slate-50 px-4 py-12 sm:py-20">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-slate-950 p-8 text-white sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Earnova</p>
            <h1 className="mt-4 text-3xl font-bold">{isRegister ? 'Create your connected workspace.' : 'Welcome back.'}</h1>
            <p className="mt-4 leading-relaxed text-slate-300">Business tools, trusted professionals and energy solutions—organized around what you want to accomplish.</p>
          </div>

          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-950">{isRegister ? 'Create account' : 'Sign in'}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isRegister ? 'Create your account with email or continue securely with Google.' : 'Continue with Google, or use your Earnova password.'}
            </p>
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

            {isRegister && (
              <fieldset className="mt-6">
                <legend className="text-sm font-bold text-slate-700">Register as</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[['individual', 'Normal account'], ['ca_consultant', 'Chartered Accountant (CA)']].map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold ${accountType === value ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600'}`}>
                      <input type="radio" name="accountType" value={value} checked={accountType === value} onChange={event => setAccountType(event.target.value)} className="mr-2 accent-violet-700" />
                      {label}
                    </label>
                  ))}
                </div>
                {accountType === 'ca_consultant' && <p className="mt-2 text-xs leading-relaxed text-amber-700">Complete your professional profile after signup, then wait for admin approval before accepting work.</p>}
              </fieldset>
            )}

            <div className="mt-6">
              <GoogleSignInButton onCredential={submitGoogle} disabled={submitting} />
            </div>

            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />or use email<span className="h-px flex-1 bg-slate-200" />
            </div>
            <form onSubmit={submitEmail} noValidate>
                  <div className="space-y-4">
                    {isRegister && (
                      <>
                        <label className="form-field"><span>Full name</span><input className="input-base" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} autoComplete="name" minLength={2} required /></label>
                        <label className="form-field"><span>Mobile number <small>(optional)</small></span><input className="input-base" type="tel" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} autoComplete="tel" /></label>
                      </>
                    )}
                    <label className="form-field"><span>Email address</span><input className="input-base" type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} autoComplete="email" required /></label>
                    <label className="form-field"><span>Password</span><input className="input-base" type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required /></label>
                  </div>
                  {!isRegister && <Link to="/forgot-password" className="mt-3 inline-block text-sm font-bold text-brand-700 hover:underline">Forgot password?</Link>}
                  <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? 'Please wait…' : isRegister ? 'Create account with email' : 'Sign in with email'}
                  </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              {isRegister ? 'Already have an account?' : 'New to Earnova?'}{' '}
              <Link className="font-bold text-brand-700 hover:underline" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create with Google'}</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
