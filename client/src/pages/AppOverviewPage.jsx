import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, Lightbulb, TrendingUp, UsersRound, WalletCards } from 'lucide-react'
import { ONBOARDING_CHECKLISTS } from '../config/navigation'
import { useAuth } from '../context/AuthContext'

export default function AppOverviewPage() {
  const { user } = useAuth()
  const checklist = ONBOARDING_CHECKLISTS[user?.accountType] || ONBOARDING_CHECKLISTS.individual
  const completed = user?.onboarding?.completedSteps || []

  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Good to see you, {user?.name?.split(' ')[0]}.</h1>
      <p className="mt-2 text-slate-600">Your workspace is ready for setup. Operational metrics remain empty until you add business data.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Revenue', 'No data yet', TrendingUp],
          ['Expenses', 'No data yet', WalletCards],
          ['Customers', 'No data yet', UsersRound],
          ['AI recommendations', 'Complete setup', Lightbulb],
        ].map(([label, value, Icon]) => (
          <article key={label} className="surface-card p-5">
            <Icon className="h-5 w-5 text-brand-700" />
            <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Finish setting up your workspace</h2>
            <p className="mt-1 text-sm text-slate-600">{completed.length} of {checklist.length} setup steps marked complete.</p>
          </div>
          <Link to="/onboarding" className="btn-secondary">Resume setup <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checklist.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              {completed.includes(index) ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-300" />}
              <span className="text-sm font-semibold text-slate-700">{step}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

