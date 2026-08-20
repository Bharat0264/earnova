import { useState } from 'react'
import { ArrowRight, Building2, ChevronRight, Code2, Search, ShoppingBag, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageMeta from '../components/common/PageMeta'
import { useAuth } from '../context/AuthContext'

const pillars = [
  { title: 'Start', description: 'Turn your idea into a business.', action: 'Start planning', to: '/start', Icon: Sparkles, card: 'border-violet-100 bg-violet-50/45', icon: 'bg-violet-100 text-violet-600', link: 'text-violet-700 hover:text-violet-900' },
  { title: 'Build', description: 'Launch your digital presence.', action: 'Explore build', to: '/build', Icon: Code2, card: 'border-sky-100 bg-sky-50/45', icon: 'bg-sky-100 text-sky-600', link: 'text-sky-700 hover:text-sky-900' },
  { title: 'Source', description: 'Find products, suppliers and business resources.', action: 'Start sourcing', to: '/source', Icon: ShoppingBag, card: 'border-amber-100 bg-amber-50/45', icon: 'bg-amber-100 text-amber-600', link: 'text-amber-700 hover:text-amber-900' },
  { title: 'Operate', description: 'Run and grow everything from one workspace.', action: 'Open workspace', to: '/operate', Icon: Building2, card: 'border-emerald-100 bg-emerald-50/45', icon: 'bg-emerald-100 text-emerald-600', link: 'text-emerald-700 hover:text-emerald-900' },
]

const intentRoute = value => {
  const query = value.trim().toLowerCase()
  if (/(why.*(accept|order)|can.?t.*(sell|accept)|store.*(order|payment)|business status)/.test(query)) return '/operate/status'
  if (/(show.*order|my orders|inventory|customer|revenue|operate|manage.*business)/.test(query)) return '/operate'
  if (/(packaging|supplier|source|raw material|wholesale|procure|quantity|boxes)/.test(query)) return '/source'
  if (/(build|website|app|e-commerce|ecommerce|online store)/.test(query)) return '/build'
  return '/start'
}

export default function UnifiedHomePage() {
  const [intent, setIntent] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const submit = event => {
    event.preventDefault()
    navigate(intentRoute(intent))
  }

  return (
    <main className="bg-[#fafaff]">
      <PageMeta title="Start, run and grow your business" path="/" />
      <section className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_76%_35%,#f1efff_0,transparent_25rem),linear-gradient(115deg,#fff_0%,#fcfbff_58%,#f7f7ff_100%)]">
        <div className="section-wrapper grid gap-10 py-14 sm:py-18 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:py-24">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">Earnova</p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-.055em] text-slate-950 sm:text-6xl">From idea<br />to <span className="text-brand-700">operating business.</span></h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600 sm:text-base">Start your business, build your digital presence, source what you need and manage everything from one connected workspace.</p>
          </div>
          <form onSubmit={submit} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(43,34,91,.08)] sm:p-8">
            <h2 className="text-center text-lg font-bold tracking-tight text-slate-950">Tell Earnova what you want to build.</h2>
            <label className="sr-only" htmlFor="business-intent">Your business goal</label>
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="business-intent" value={intent} onChange={event => setIntent(event.target.value)} className="input-base h-14 pl-11" placeholder="I want to start a clothing brand" />
            </div>
            <div className="mt-4 text-center">
              <button className="btn-primary min-w-48" type="submit">Start building <Sparkles className="h-4 w-4" /></button>
              <p className="mt-3 text-xs text-slate-500">A clear next step, without the clutter.</p>
            </div>
          </form>
        </div>
      </section>

      <section className="section-wrapper py-10 sm:py-14">
        {isAuthenticated && <p className="mb-5 text-sm font-semibold text-slate-600">Welcome back, <span className="text-slate-950">{user?.name || 'there'}</span>.</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map(({ title, description, action, to, Icon, card, icon, link }) => (
            <article key={title} className={`group min-h-56 rounded-[1.4rem] border p-5 transition hover:-translate-y-1 hover:shadow-lg ${card}`}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${icon}`}><Icon className="h-5 w-5" /></span>
              <h2 className="mt-5 text-xl font-extrabold text-slate-950">{title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{description}</p>
              <Link to={to} className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${link}`}>{action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrapper pb-12 sm:pb-16">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div><p className="eyebrow">Already running a business?</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Bring your business to Earnova.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Organize your next actions, operations and business context in one place.</p></div>
            <Link to={isAuthenticated ? '/operate' : '/register'} className="btn-secondary shrink-0">Bring my business to Earnova <ChevronRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
