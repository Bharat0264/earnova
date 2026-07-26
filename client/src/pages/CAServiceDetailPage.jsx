import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, CircleSlash2, FileText,
  HelpCircle, IndianRupee, Loader2, ShieldAlert, Video,
} from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { api } from '../utils/api'
import { formatPrice } from '../utils/formatters'

const List = ({ title, items, Icon = CheckCircle2, tone = 'text-emerald-700' }) => (
  <div className="surface-card p-5">
    <h2 className="font-bold text-slate-950">{title}</h2>
    <ul className="mt-4 space-y-3">
      {(items || []).map(item => <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />{item}</li>)}
    </ul>
  </div>
)

export default function CAServiceDetailPage() {
  const { serviceSlug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    api.get(`/ca-office/services/${serviceSlug}`).then(setData).catch(err => setError(err.message))
  }, [serviceSlug])

  if (!data && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (error) return <div className="section-wrapper py-16 text-center"><p className="font-bold text-red-700">{error}</p><Link to="/services/ca" className="btn-secondary mt-5">Back to CA services</Link></div>
  const { service, firms = [] } = data
  const priceLabel = service.pricingMode === 'quote' || service.pricingMode === 'retainer'
    ? service.pricingMode === 'retainer' ? 'Recurring plan or custom quote' : 'Custom quotation required'
    : `${service.pricingMode === 'starting' ? 'Starting from ' : ''}${formatPrice(service.startingPrice || 0)}`

  return (
    <>
      <PageMeta title={service.name} path={`/services/ca/${service.slug}`} />
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="section-wrapper py-10 lg:py-14">
          <Link to="/services/ca" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />All CA services</Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <p className="eyebrow">{service.category}</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{service.name}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{service.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/app/ca?start=${service.slug}`} className="btn-primary">Start service <ArrowRight className="h-4 w-4" /></Link>
                <Link to={`/app/support/new?service=ca&source=${encodeURIComponent(`/services/ca/${service.slug}`)}`} className="btn-secondary"><HelpCircle className="h-4 w-4" />Get help</Link>
              </div>
            </div>
            <aside className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-950"><IndianRupee className="h-4 w-4 text-brand-700" />Pricing basis</p>
              <p className="mt-2 text-lg font-extrabold text-brand-800">{priceLabel}</p>
              <p className="mt-5 flex gap-2 text-sm text-slate-600"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />{service.handlingTime}</p>
              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-amber-800"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{service.externalDependency}</p>
              {service.consultationRequired && <p className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 p-3 text-xs font-bold text-violet-800"><Video className="h-4 w-4" />Consultation required</p>}
            </aside>
          </div>
        </div>
      </section>

      <main className="section-wrapper py-10 lg:py-14">
        <div className="grid gap-5 lg:grid-cols-2">
          <List title="Who needs this service" items={service.whoNeedsIt} />
          <List title="Eligibility" items={service.eligibility} />
          <List title="Included deliverables" items={service.deliverables} />
          <List title="Excluded work" items={service.exclusions} Icon={CircleSlash2} tone="text-rose-600" />
          <List title="Required documents" items={service.requiredDocuments} Icon={FileText} tone="text-brand-700" />
          <List title="Available add-ons" items={service.addOns?.length ? service.addOns : ['Add-ons are confirmed in the quotation.']} />
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-bold text-slate-950">Cancellation and refund conditions</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.refundPolicy}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-950">Verified firms offering this service</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {firms.length ? firms.map(firm => (
              <Link key={firm.slug} to={`/services/ca/firm/${firm.slug}`} className="surface-card p-5 hover:border-emerald-300">
                <p className="text-xs font-bold text-emerald-700">Verified partner firm</p>
                <h3 className="mt-2 font-bold text-slate-950">{firm.displayName}</h3>
                <p className="mt-1 text-sm text-slate-500">{[firm.city, firm.state].filter(Boolean).join(', ') || 'Online'}</p>
              </Link>
            )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 md:col-span-2 lg:col-span-3">No verified firm is currently published for this service. You can still start a request for Earnova admin to allocate after review.</p>}
          </div>
        </section>
      </main>
    </>
  )
}

