import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Boxes, Briefcase, Building2, Check,
  ChevronRight, CircleDollarSign, FileText, Lightbulb, MessageSquareText,
  PackageSearch, ShieldCheck, Sparkles, SunMedium, TrendingUp, UsersRound,
} from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { PRODUCT_PILLARS } from '../config/navigation'

const ICONS = {
  business: BarChart3,
  services: Briefcase,
  energy: SunMedium,
}

const AI_DEMOS = [
  {
    question: 'Why did my sales decrease this month?',
    answer: 'Demo answer: revenue is 8% lower mainly because repeat orders fell in the final two weeks. Follow up with 12 previously active customers.',
    metrics: 'Demo data · 1–30 June',
  },
  {
    question: 'Which products should I restock?',
    answer: 'Demo answer: three products are below their reorder levels. Product A has the highest recent sales velocity.',
    metrics: 'Demo data · inventory snapshot',
  },
  {
    question: 'How much revenue may I generate next month?',
    answer: 'Demo forecast: ₹3.1–₹3.5 lakh if recent order volume continues. This is an estimate, not a guarantee.',
    metrics: 'Demo data · based on the last 90 days',
  },
]

const MARKETPLACE_ITEMS = [
  ['Freelance digital services', 'Web, design, marketing and business support', '/services/freelancers', Briefcase],
  ['CA and tax support', 'Organized requests with reviewed professional profiles', '/services/ca', FileText],
  ['Solar solutions', 'Focused products and requirement enquiries', '/energy', SunMedium],
]

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,.16)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">Bharat Traders</p>
          <p className="text-xs text-slate-500">Business overview · Demo data</p>
        </div>
        <span className="status-badge status-success">Last 30 days</span>
      </div>
      <div className="grid gap-4 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Revenue', '₹3.42L', '+12%'],
            ['Expenses', '₹2.18L', '+4%'],
            ['Est. profit', '₹1.24L', '+9%'],
            ['Customers', '184', '+16'],
          ].map(([label, value, trend]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">{trend}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Revenue trend</p>
              <TrendingUp className="h-4 w-4 text-brand-700" />
            </div>
            <div className="mt-5 flex h-28 items-end gap-2" aria-label="Demo revenue bar chart">
              {[42, 55, 48, 68, 62, 78, 73, 92, 84, 100].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-md bg-brand-600/80" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-emerald-300"><Lightbulb className="h-4 w-4" /><p className="text-xs font-bold">AI recommendation</p></div>
            <p className="mt-4 text-sm font-semibold leading-relaxed">Follow up with 12 customers who have not ordered in 45 days.</p>
            <p className="mt-3 text-[11px] text-slate-400">Based on demo customer activity</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            [Boxes, '3', 'Low-stock'],
            [FileText, '7', 'Pending invoices'],
            [UsersRound, '₹1.8L', 'Lead pipeline'],
          ].map(([Icon, value, label]) => (
            <div key={label} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3">
              <Icon className="hidden h-4 w-4 text-brand-700 sm:block" />
              <div><p className="text-sm font-bold text-slate-900">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <PageMeta title="" path="/" />

      <section className="relative overflow-hidden bg-[linear-gradient(125deg,#f8fafc_0%,#f5f3ff_55%,#ecfdf5_100%)]">
        <div className="section-wrapper grid gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Built for Indian businesses
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl xl:text-6xl">
              Run and grow your business from one intelligent platform.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Manage operations, understand performance, hire trusted professionals and discover energy solutions through Earnova.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary">Start Your Business Workspace <ArrowRight className="h-4 w-4" /></Link>
              <a href="#pillars" className="btn-secondary">Explore Earnova</a>
            </div>
            <p className="mt-5 max-w-xl text-sm text-slate-500">
              Earnova helps Indian businesses start, run and grow through AI-powered business tools, trusted professional services and sustainable energy solutions.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="pillars" className="section-wrapper scroll-mt-20 py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">One platform, three clear pillars</p>
          <h2 className="section-title mt-3">Start with what your business needs today.</h2>
          <p className="section-sub">Each part of Earnova has a clear purpose and its own focused destination.</p>
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {PRODUCT_PILLARS.map(pillar => {
            const Icon = ICONS[pillar.key]
            return (
              <article key={pillar.key} className="surface-card flex flex-col p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                <ul className="mt-5 space-y-3">
                  {pillar.benefits.map(benefit => <li key={benefit} className="flex gap-2 text-sm font-semibold text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{benefit}</li>)}
                </ul>
                <Link to={pillar.to} className="mt-7 inline-flex items-center gap-1 text-sm font-bold text-brand-700">{pillar.key === 'business' ? 'Explore Business' : pillar.key === 'services' ? 'Find a professional' : 'Explore Energy'} <ChevronRight className="h-4 w-4" /></Link>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="section-wrapper grid gap-10 py-16 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:py-20">
          <div>
            <p className="eyebrow !text-emerald-300">Business AI demonstration</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Ask questions. See the data behind the answer.</h2>
            <p className="mt-4 leading-relaxed text-slate-300">Earnova is designed to calculate business metrics first, then use AI to explain what changed, what may happen next and what action to consider.</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              All answers shown here use demo data. Predictions are estimates and are not financial, tax or legal advice.
            </div>
          </div>
          <div className="space-y-3">
            {AI_DEMOS.map((item, index) => (
              <details key={item.question} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[.06] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  <span className="flex items-center gap-3"><MessageSquareText className="h-5 w-5 shrink-0 text-emerald-300" />{item.question}</span>
                  <span className="text-slate-400 group-open:rotate-90">›</span>
                </summary>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-200">{item.answer}</p>
                <p className="mt-2 text-xs text-slate-400">{item.metrics}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="text-center">
          <p className="eyebrow">How Earnova works</p>
          <h2 className="section-title mt-3">From business data to a clear next action.</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Create a workspace', 'Choose what you want to accomplish and set up the right experience.'],
            ['02', 'Add or import business data', 'Start manually; structured imports arrive with the Business MVP.'],
            ['03', 'Receive insights and recommendations', 'See calculations, periods and clearly labelled estimates.'],
            ['04', 'Take action or hire verified professionals', 'Continue in your workspace or request appropriate support.'],
          ].map(([number, title, text]) => (
            <li key={number} className="surface-card p-6">
              <span className="text-sm font-black text-brand-700">{number}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="section-wrapper py-16 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Marketplace preview</p>
              <h2 className="section-title mt-3">Curated ways to move your business forward.</h2>
            </div>
            <Link to="/marketplace" className="text-sm font-bold text-brand-700">View complete marketplace →</Link>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {MARKETPLACE_ITEMS.map(([title, text, to, Icon]) => (
              <Link key={title} to={to} className="surface-card group p-6 hover:-translate-y-1 hover:shadow-lg">
                <Icon className="h-6 w-6 text-brand-700" />
                <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
                <span className="mt-5 inline-block text-sm font-bold text-brand-700">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper grid gap-10 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-20">
        <div>
          <p className="eyebrow">Trust by design</p>
          <h2 className="section-title mt-3">Clear status, visible limitations and protected access.</h2>
          <p className="section-sub">We do not publish invented production statistics. Verified platform metrics will appear here only when a trusted analytics source is connected.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [ShieldCheck, 'Protected workspaces', 'Business and account routes require authenticated access.'],
            [Building2, 'Role-aware journeys', 'Customers, business owners and providers see relevant setup paths.'],
            [PackageSearch, 'Clear marketplace states', 'Requests and transactions should show what happens next.'],
            [CircleDollarSign, 'Transparent payments', 'Costs, commissions and eligibility should be visible before action.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="surface-card p-5">
              <Icon className="h-5 w-5 text-emerald-700" />
              <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="section-wrapper grid gap-8 py-16 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="eyebrow">Pricing preview</p>
            <h2 className="section-title mt-3">Start simple. Add depth as your business grows.</h2>
            <Link to="/pricing" className="btn-secondary mt-6">Compare plan structure</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {['Starter', 'Growth', 'Pro'].map((plan, index) => (
              <div key={plan} className={`surface-card p-5 ${index === 1 ? 'border-brand-300 ring-2 ring-brand-100' : ''}`}>
                <p className="font-bold text-slate-950">{plan}</p>
                <p className="mt-2 text-sm text-slate-600">{index === 0 ? 'Manual tools and a basic workspace.' : index === 1 ? 'CRM, imports, inventory and more AI.' : 'Advanced permissions and higher limits.'}</p>
                <p className="mt-5 text-xs font-semibold text-slate-500">Pricing to be confirmed</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="rounded-[2rem] bg-brand-800 px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Build a clearer business workspace today.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-brand-100">Start with a role-aware Earnova account and keep your setup progress as the Business MVP expands.</p>
          <Link to="/register" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-800 hover:bg-brand-50">
            Start Your Business Workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
