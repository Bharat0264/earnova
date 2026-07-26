import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeIndianRupee, BarChart3, Boxes, Briefcase,
  Building2, Calculator, CheckCircle2, ClipboardList,
  Code2, Factory, FileText, LayoutDashboard, Laptop, MessageSquareText,
  Package, Presentation, Search, Share2, ShieldCheck,
  ShoppingCart, Sparkles, Store, SunMedium, Tag, Target, UserCheck,
  TrendingUp, UsersRound, WalletCards, X, Zap,
} from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { PLATFORM_HUBS } from '../config/navigation'

const ICONS = {
  badge: BadgeIndianRupee,
  boxes: Boxes,
  briefcase: Briefcase,
  building: Building2,
  calculator: Calculator,
  cart: ShoppingCart,
  chart: TrendingUp,
  clipboard: ClipboardList,
  code: Code2,
  dashboard: LayoutDashboard,
  factory: Factory,
  handshake: UsersRound,
  laptop: Laptop,
  message: MessageSquareText,
  package: Package,
  presentation: Presentation,
  receipt: FileText,
  search: Search,
  share: Share2,
  shield: ShieldCheck,
  sparkles: Sparkles,
  store: Store,
  sun: SunMedium,
  tag: Tag,
  target: Target,
  usercheck: UserCheck,
  users: UsersRound,
  wallet: WalletCards,
  zap: Zap,
}

const HUB_STYLES = {
  amber: {
    icon: 'bg-amber-100 text-amber-800',
    header: 'from-amber-50 to-orange-50',
    border: 'hover:border-amber-300',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-800',
    header: 'from-violet-50 to-fuchsia-50',
    border: 'hover:border-violet-300',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-800',
    header: 'from-blue-50 to-cyan-50',
    border: 'hover:border-blue-300',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-800',
    header: 'from-emerald-50 to-teal-50',
    border: 'hover:border-emerald-300',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-800',
    header: 'from-rose-50 to-pink-50',
    border: 'hover:border-rose-300',
  },
}

const HUB_ICONS = {
  shopping: ShoppingCart,
  services: Briefcase,
  business: BarChart3,
  energy: SunMedium,
  earn: WalletCards,
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return []
    return PLATFORM_HUBS.flatMap(hub =>
      hub.items
        .filter(item => `${item.label} ${item.description} ${hub.label}`.toLowerCase().includes(normalizedQuery))
        .map(item => ({ ...item, hubLabel: hub.label, accent: hub.accent }))
    ).slice(0, 8)
  }, [normalizedQuery])

  const submitSearch = event => {
    event.preventDefault()
    if (searchResults[0]) navigate(searchResults[0].to)
  }

  return (
    <>
      <PageMeta title="" path="/" />

      <section className="border-b border-slate-200 bg-[linear-gradient(130deg,#f8fafc_0%,#f5f3ff_52%,#ecfdf5_100%)]">
        <div className="section-wrapper py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> One account. Every Earnova service.
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
              What do you want to do today?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              Shop, hire professionals, run your business, find energy solutions or start earning.
            </p>

            <form onSubmit={submitSearch} className="relative mx-auto mt-6 max-w-2xl" role="search">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search products, CA services, invoices, solar..."
                aria-label="Search Earnova"
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-14 text-sm text-slate-900 shadow-lg shadow-slate-900/5 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
              {normalizedQuery && (
                <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-2xl">
                  {searchResults.length ? searchResults.map(result => {
                    const Icon = ICONS[result.icon] || ArrowRight
                    const style = HUB_STYLES[result.accent]
                    return (
                      <Link key={`${result.hubLabel}-${result.label}`} to={result.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-slate-900">{result.label}</span>
                          <span className="block truncate text-xs text-slate-500">{result.hubLabel} · {result.description}</span>
                        </span>
                      </Link>
                    )
                  }) : (
                    <p className="px-4 py-5 text-center text-sm text-slate-500">No matching Earnova destination found.</p>
                  )}
                </div>
              )}
            </form>
          </div>

          <nav className="mx-auto mt-8 grid max-w-4xl grid-cols-5 gap-2" aria-label="Earnova service categories">
            {PLATFORM_HUBS.map(hub => {
              const Icon = HUB_ICONS[hub.key]
              const style = HUB_STYLES[hub.accent]
              return (
                <a key={hub.key} href={`#${hub.key}`} className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center hover:bg-white/70 sm:px-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-0.5 sm:h-12 sm:w-12 ${style.icon}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight text-slate-700 sm:text-sm">{hub.label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      </section>

      <main className="section-wrapper py-10 lg:py-14">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Explore Earnova</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Everything, organized by what you need.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">Choose a hub, then go directly to the product, service or workspace you need.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {PLATFORM_HUBS.map((hub, hubIndex) => {
            const HubIcon = HUB_ICONS[hub.key]
            const style = HUB_STYLES[hub.accent]
            return (
              <section
                key={hub.key}
                id={hub.key}
                className={`scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${hubIndex === 0 ? 'lg:col-span-2' : ''}`}
              >
                <div className={`flex items-center gap-4 bg-gradient-to-r px-5 py-5 sm:px-6 ${style.header}`}>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}><HubIcon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">{hub.label}</h3>
                    <p className="mt-0.5 text-sm text-slate-600">{hub.description}</p>
                  </div>
                </div>
                <div className={`grid gap-px bg-slate-100 ${hubIndex === 0 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {hub.items.map(item => {
                    const Icon = ICONS[item.icon] || ArrowRight
                    return (
                      <Link key={item.label} to={item.to} className={`group flex min-h-24 items-start gap-3 border border-transparent bg-white p-4 transition hover:z-10 hover:bg-slate-50 ${style.border}`}>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-4.5 w-4.5" /></span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-bold text-slate-900">
                            {item.label}<ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{item.description}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <section className="mt-8 grid overflow-hidden rounded-3xl bg-slate-950 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Your Earnova account</p></div>
            <h2 className="mt-3 text-2xl font-bold">Save purchases, service requests and business work in one place.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Create one account and open the right workspace whenever you return.</p>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 p-6 sm:flex-row lg:border-l lg:border-t-0 lg:p-8">
            <Link to="/register" className="btn-primary whitespace-nowrap">Create account <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">Login</Link>
          </div>
        </section>
      </main>
    </>
  )
}
