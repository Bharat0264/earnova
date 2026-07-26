import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { apiUrl, parseJsonResponse } from '../utils/api'
import PageMeta from '../components/common/PageMeta'

export default function RecoveryPage({ mode }) {
  const { token } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isReset = mode === 'reset'

  const submit = async event => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(apiUrl(isReset ? `/auth/reset-password/${token}` : '/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isReset ? { password } : { email }),
      })
      const data = await parseJsonResponse(response)
      if (!response.ok) throw new Error(data?.message || 'Request failed.')
      if (isReset) navigate('/login', { replace: true, state: { reset: true } })
      else setMessage('If that email is registered, a reset link will be sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta title={isReset ? 'Reset password' : 'Forgot password'} noIndex />
      <section className="bg-slate-50 px-4 py-16">
        <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="eyebrow">Account recovery</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{isReset ? 'Choose a new password' : 'Reset your password'}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{isReset ? 'Use 8–128 characters and avoid reusing a password from another service.' : 'Enter your account email. We will not reveal whether an account exists.'}</p>
          {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
          <label className="form-field mt-6">
            <span>{isReset ? 'New password' : 'Email address'}</span>
            <input className="input-base" type={isReset ? 'password' : 'email'} value={isReset ? password : email} onChange={event => isReset ? setPassword(event.target.value) : setEmail(event.target.value)} minLength={isReset ? 8 : undefined} maxLength={isReset ? 128 : undefined} required />
          </label>
          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Please wait…' : isReset ? 'Update password' : 'Send reset link'}</button>
          <Link to="/login" className="mt-5 block text-center text-sm font-bold text-brand-700 hover:underline">Back to login</Link>
        </form>
      </section>
    </>
  )
}
