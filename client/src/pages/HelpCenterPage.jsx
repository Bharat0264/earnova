import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Headphones, LifeBuoy, Loader2, Search,
  ShieldAlert,
} from 'lucide-react'
import PageMeta from '../components/common/PageMeta'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const ROUTE_TO_SERVICE = {
  account: 'account', business: 'business', ca: 'ca', freelancing: 'freelancing',
  orders: 'commerce', projects: 'projects', energy: 'energy', payments: 'payments',
  referrals: 'referrals', 'privacy-security': 'privacy-security', 'report-abuse': 'privacy-security',
}

export default function HelpCenterPage({ category, article = false, contact = false }) {
  const params = useParams()
  const activeCategory = category || params.category
  const { isAuthenticated } = useAuth()
  const [home, setHome] = useState(null)
  const [articles, setArticles] = useState([])
  const [articleData, setArticleData] = useState(null)
  const [query, setQuery] = useState('')
  const [searchData, setSearchData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (article) {
      api.get(`/help/articles/${params.articleSlug}`).then(data => setArticleData(data.article)).catch(err => setError(err.message))
      return
    }
    Promise.all([
      api.get('/help'),
      api.get(`/help/articles${activeCategory ? `?service=${ROUTE_TO_SERVICE[activeCategory] || activeCategory}` : ''}`),
    ]).then(([homeData, articleList]) => {
      setHome(homeData)
      setArticles(articleList.articles || [])
    }).catch(err => setError(err.message))
  }, [activeCategory, article, params.articleSlug])

  useEffect(() => {
    if (!isAuthenticated || query.trim().length < 2) {
      setSearchData(null)
      return
    }
    const timer = setTimeout(() => {
      api.get(`/help/search?q=${encodeURIComponent(query.trim())}`).then(setSearchData).catch(() => setSearchData(null))
    }, 250)
    return () => clearTimeout(timer)
  }, [query, isAuthenticated])

  const publicMatches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return articles
    return articles.filter(item => `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(needle))
  }, [articles, query])

  if (article) {
    if (!articleData && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>
    if (error) return <p className="section-wrapper py-16 text-center font-bold text-red-700">{error}</p>
    return (
      <>
        <PageMeta title={articleData.title} path={`/help/article/${articleData.slug}`} />
        <main className="section-wrapper max-w-4xl py-12">
          <Link to="/help" className="text-sm font-bold text-brand-700">← Help Centre</Link>
          <p className="eyebrow mt-8">{articleData.service} · {articleData.category}</p>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-950">{articleData.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{articleData.summary}</p>
          <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 text-base leading-8 text-slate-700 shadow-sm">{articleData.content}</article>
          <p className="mt-4 text-xs text-slate-500">Last reviewed: {articleData.lastReviewedAt ? new Date(articleData.lastReviewedAt).toLocaleDateString('en-IN') : 'Review date not yet published'}</p>
          <Link to="/app/support/new?service=account" className="btn-primary mt-8">Still need help? Start a request</Link>
        </main>
      </>
    )
  }

  if (!home && !error) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-700" /></div>

  return (
    <>
      <PageMeta title={contact ? 'Contact support' : activeCategory ? `${activeCategory.replaceAll('-', ' ')} help` : 'Help Centre'} path={contact ? '/help/contact' : activeCategory ? `/help/${activeCategory}` : '/help'} />
      <section className="border-b border-slate-200 bg-[linear-gradient(125deg,#f8fafc,#eef2ff,#ecfdf5)]">
        <div className="section-wrapper py-12 text-center lg:py-16">
          <LifeBuoy className="mx-auto h-8 w-8 text-brand-700" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">{contact ? 'Contact Earnova support' : 'How can we help you?'}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{contact ? 'Choose the service and issue so your request reaches the right team.' : 'Search guidance or securely connect an authorized case or order to a support request.'}</p>
          {!contact && (
            <div className="relative mx-auto mt-6 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-sm shadow-lg outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" placeholder="Search help, case reference or order reference..." />
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/app/support/new" className="btn-primary"><Headphones className="h-4 w-4" />Start a support request</Link>
            {isAuthenticated && <Link to="/app/support" className="btn-secondary"><CheckCircle2 className="h-4 w-4" />My open tickets</Link>}
          </div>
        </div>
      </section>

      <main className="section-wrapper py-10 lg:py-14">
        {contact ? (
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            <Link to="/app/support/new" className="surface-card p-6"><Headphones className="h-6 w-6 text-brand-700" /><h2 className="mt-4 font-bold text-slate-950">Standard support request</h2><p className="mt-2 text-sm text-slate-600">Choose a service, issue and related authorized item.</p></Link>
            <Link to="/help/report-abuse" className="surface-card border-rose-200 p-6"><ShieldAlert className="h-6 w-6 text-rose-600" /><h2 className="mt-4 font-bold text-slate-950">Urgent security or abuse report</h2><p className="mt-2 text-sm text-slate-600">Restricted routing for access, exposure, privacy and abuse concerns.</p></Link>
            <p className="sm:col-span-2 rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">Response timing depends on issue severity, queue workload and required specialist review. Earnova does not display a guaranteed response time.</p>
          </div>
        ) : (
          <>
            {!activeCategory && (
              <section>
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-950">Browse by service</h2><Link to="/help/contact" className="text-sm font-bold text-brand-700">Contact support →</Link></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {home.categories.map(item => <Link key={item.slug} to={`/help/${item.slug}`} className="surface-card group flex items-center justify-between p-5"><span className="font-bold text-slate-800">{item.label}</span><ArrowRight className="h-4 w-4 text-brand-700 transition group-hover:translate-x-1" /></Link>)}
                </div>
              </section>
            )}

            {activeCategory === 'report-abuse' && <div className="mb-7 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-relaxed text-rose-900"><AlertTriangle className="h-5 w-5 shrink-0" /><p>For suspected account takeover, unauthorized access, sensitive-document exposure or abuse, create a support request and choose the closest security or privacy issue. Final priority is calculated by the backend.</p></div>}

            {searchData && (
              <section className="mb-8 rounded-3xl border border-brand-200 bg-brand-50 p-5">
                <h2 className="font-bold text-brand-950">Authorized account results</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {searchData.cases?.map(item => <Link key={item._id} to={`/app/ca/cases/${item.reference}`} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-800">CA case {item.reference}</Link>)}
                  {searchData.orders?.map(item => <Link key={item._id} to="/account?tab=orders" className="rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-800">Order {item.orderId}</Link>)}
                  {searchData.payments?.map(item => <Link key={item._id} to="/app/support/new?service=payments" className="rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-800">Payment {item.razorpayOrderId}</Link>)}
                  {searchData.projects?.map(item => <Link key={item._id} to="/projects" className="rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-800">Project {item.listingId}</Link>)}
                  {!searchData.cases?.length && !searchData.orders?.length && !searchData.payments?.length && !searchData.projects?.length && <p className="text-sm text-brand-800">No matching authorized account records.</p>}
                </div>
              </section>
            )}

            <section className={activeCategory ? '' : 'mt-10'}>
              <h2 className="text-2xl font-bold text-slate-950">{activeCategory ? `${activeCategory.replaceAll('-', ' ')} help` : 'Frequently viewed articles'}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {publicMatches.map(item => <Link key={item.slug} to={`/help/article/${item.slug}`} className="surface-card group p-5"><BookOpen className="h-5 w-5 text-brand-700" /><h3 className="mt-4 font-bold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{item.summary}</p><span className="mt-4 inline-flex text-xs font-bold text-brand-700">Read article →</span></Link>)}
                {!publicMatches.length && <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No reviewed article matches yet. Start a support request for contextual help.</p>}
              </div>
            </section>

            <section className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link to="/app/support" className="rounded-3xl bg-slate-950 p-6 text-white"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><h2 className="mt-4 text-xl font-bold">My open tickets</h2><p className="mt-2 text-sm text-slate-300">Track current status, next action and linked service reference.</p></Link>
              <Link to="/help/report-abuse" className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950"><ShieldAlert className="h-5 w-5 text-rose-700" /><h2 className="mt-4 text-xl font-bold">Security and abuse reporting</h2><p className="mt-2 text-sm text-rose-800">Use restricted routing for urgent access, exposure or misconduct concerns.</p></Link>
            </section>
          </>
        )}
      </main>
    </>
  )
}
