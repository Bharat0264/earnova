import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Loader2, MapPin, UsersRound } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { api } from '../utils/api'

export default function CAFirmPage() {
  const { firmSlug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/ca-office/firms/${firmSlug}`).then(setData).catch(err => setError(err.message))
  }, [firmSlug])

  if (!data && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
  if (error) return <div className="section-wrapper py-16 text-center"><p className="font-bold text-red-700">{error}</p></div>
  const { firm, professionals = [] } = data
  return (
    <>
      <PageMeta title={firm.displayName} path={`/services/ca/firm/${firm.slug}`} />
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="section-wrapper py-12">
          <Link to="/services/ca" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700"><ArrowLeft className="h-4 w-4" />CA services</Link>
          <div className="mt-6 flex items-center gap-2 text-emerald-700"><BadgeCheck className="h-5 w-5" /><span className="text-sm font-bold">Verified Earnova partner firm</span></div>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-950">{firm.displayName}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" />{[firm.city, firm.state].filter(Boolean).join(', ') || 'Online services'}</p>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">{firm.description}</p>
        </div>
      </section>
      <main className="section-wrapper grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-2xl font-bold text-slate-950">Services offered</h2>
          <div className="mt-5 flex flex-wrap gap-2">{firm.serviceSlugs.map(slug => <Link key={slug} to={`/services/ca/${slug}`} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-800">{slug.replaceAll('-', ' ')}</Link>)}</div>
          <h2 className="mt-10 text-2xl font-bold text-slate-950">Verified professional designations</h2>
          <p className="mt-2 text-sm text-slate-600">Only members whose professional designation has been verified are shown publicly.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {professionals.length ? professionals.map(member => (
              <div key={member._id} className="surface-card p-5">
                <UsersRound className="h-5 w-5 text-brand-700" />
                <p className="mt-3 font-bold text-slate-950">{member.user?.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.professionalDesignation}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No public team profiles are published.</p>}
          </div>
        </section>
        <aside className="surface-card h-fit p-6">
          <p className="text-sm font-bold text-slate-950">Start with this firm</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Choose a service first. Earnova confirms service availability and firm eligibility before linking the case.</p>
          <Link to="/services/ca" className="btn-primary mt-5 w-full">Choose a service</Link>
        </aside>
      </main>
    </>
  )
}

