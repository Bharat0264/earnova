import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { ACCOUNT_TYPES, ONBOARDING_CHECKLISTS } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/common/PageMeta'

export default function OnboardingPage() {
  const { user, saveOnboarding } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedAccountType = searchParams.get('accountType')
  const [accountType, setAccountType] = useState(
    requestedAccountType === 'ca_consultant' ? 'ca_consultant' : (user?.accountType || '')
  )
  const [completedSteps, setCompletedSteps] = useState(user?.onboarding?.completedSteps || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const checklist = useMemo(() => ONBOARDING_CHECKLISTS[accountType] || [], [accountType])

  const selectType = value => {
    setAccountType(value)
    setCompletedSteps([])
  }

  const toggleStep = index => setCompletedSteps(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index])

  const persist = async status => {
    if (!accountType) {
      setError('Choose what you want to do first.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await saveOnboarding({ accountType, completedSteps, status })
      navigate(accountType === 'business_owner' || accountType === 'individual' ? '/app/overview' : '/partner/overview', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <PageMeta title="Set up your Earnova account" noIndex />
      <div className="mx-auto max-w-5xl">
        <img src="/earnova-logo.png" alt="Earnova" className="h-10 w-auto" />
        <div className="mt-8">
          <p className="eyebrow">Set up your account</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">What would you like to do with Earnova?</h1>
          <p className="mt-3 text-slate-600">We will show the most relevant workspace. You can skip setup and resume later.</p>
        </div>
        {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ACCOUNT_TYPES.map(type => (
            <button key={type.value} type="button" onClick={() => selectType(type.value)} className={`rounded-2xl border p-5 text-left transition ${accountType === type.value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-900">{type.label}</span>
                {accountType === type.value && <Check className="h-5 w-5 text-brand-700" />}
              </span>
              <span className="mt-2 block text-sm text-slate-600">{type.intent}</span>
            </button>
          ))}
        </div>
        {accountType && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Your onboarding checklist</h2>
            <p className="mt-2 text-sm text-slate-600">Mark anything already complete. Remaining steps stay available in your workspace.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {checklist.map((step, index) => (
                <label key={step} className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <input type="checkbox" checked={completedSteps.includes(index)} onChange={() => toggleStep(index)} className="mt-1 h-4 w-4 accent-violet-700" />
                  <span className="text-sm font-semibold text-slate-700">{step}</span>
                </label>
              ))}
            </div>
          </section>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={saving} onClick={() => persist('skipped')} className="btn-secondary">Skip for now</button>
          <button type="button" disabled={saving} onClick={() => persist(completedSteps.length === checklist.length ? 'completed' : 'in_progress')} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue to workspace
          </button>
        </div>
      </div>
    </main>
  )
}
