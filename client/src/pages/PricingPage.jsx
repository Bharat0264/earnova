import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

const PLANS = [
  ['Starter', 'For setting up one business workspace', ['Manual data entry', 'Basic dashboard', 'Limited invoices', 'Limited AI questions']],
  ['Growth', 'For businesses building repeatable operations', ['Team access', 'Imports', 'CRM and inventory', 'Forecasts and exports']],
  ['Pro', 'For more complex businesses', ['Multiple businesses or locations', 'Advanced permissions', 'Higher limits', 'Priority support']],
]

export default function PricingPage() {
  return (
    <>
      <PageMeta title="Pricing" description="Simple Earnova Business plan previews. Final billing and recurring plan entitlements are not yet live." />
      <section className="section-wrapper py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">Business software pricing</p>
          <h1 className="page-title mt-4">Start with the tools your business needs.</h1>
          <p className="page-lead mt-5">These plans show the intended product structure. Recurring billing and complete entitlements are not yet connected, so no plan is presented as purchasable today.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map(([name, summary, features], index) => (
            <article key={name} className={`surface-card p-6 ${index === 1 ? 'border-brand-300 ring-2 ring-brand-100' : ''}`}>
              <p className="text-sm font-bold text-brand-700">{name}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{index === 0 ? 'Start simple' : index === 1 ? 'Grow with clarity' : 'Scale with control'}</h2>
              <p className="mt-2 min-h-12 text-sm text-slate-600">{summary}</p>
              <ul className="mt-6 space-y-3">
                {features.map(feature => <li key={feature} className="flex gap-2 text-sm text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}
              </ul>
              <Link to="/register" className={index === 1 ? 'btn-primary mt-7 w-full' : 'btn-secondary mt-7 w-full'}>Create free account</Link>
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">Marketplace service fees or commissions are separate from Business software plans and must be shown before a paid transaction.</p>
      </section>
    </>
  )
}

