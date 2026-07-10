import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Code2, FileText, Link as LinkIcon, Loader2, Send, ShoppingCart } from 'lucide-react'
import AuthModal from '../components/auth/AuthModal'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../utils/api'
import { formatDate, formatPrice } from '../utils/formatters'

const CATEGORIES = ['Web App', 'Mobile App', 'AI/ML', 'Dashboard', 'Ecommerce', 'Automation', 'College Project', 'Other']
const emptyForm = {
  sellerName: '',
  sellerEmail: '',
  sellerWhatsapp: '',
  title: '',
  category: 'Web App',
  shortDescription: '',
  details: '',
  techStack: '',
  liveDemoUrl: '',
  documentationSummary: '',
  documentationUrl: '',
  deliveryNotes: '',
  price: '',
}

export default function ProjectsPage() {
  const { user, isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [projects, setProjects] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('')
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    sellerName: user?.name || '',
    sellerEmail: user?.email || '',
    sellerWhatsapp: user?.phone || '',
  }))

  const load = async () => {
    setLoading(true)
    try {
      const [market, mine] = await Promise.all([
        api.get('/projects'),
        isAuthenticated ? api.get('/projects/my-listings') : Promise.resolve({ listings: [] }),
      ])
      setProjects(market.projects || [])
      setMyListings(mine.listings || [])
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      sellerName: prev.sellerName || user?.name || '',
      sellerEmail: prev.sellerEmail || user?.email || '',
      sellerWhatsapp: prev.sellerWhatsapp || user?.phone || '',
    }))
    setBuyerWhatsapp(value => value || user?.phone || '')
  }, [user])

  const requireLogin = () => {
    if (isAuthenticated) return false
    setShowAuth(true)
    return true
  }

  const submitListing = async event => {
    event.preventDefault()
    if (requireLogin()) return
    setSubmitting(true)
    setMessage('')
    try {
      const res = await api.post('/projects/submit', form)
      setMessage(res.message || 'Project submitted for approval.')
      setForm(prev => ({ ...emptyForm, sellerName: prev.sellerName, sellerEmail: prev.sellerEmail, sellerWhatsapp: prev.sellerWhatsapp, category: 'Web App' }))
      load()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const buyProject = project => {
    if (requireLogin()) return
    const whatsapp = buyerWhatsapp.trim()
    if (!whatsapp) {
      setMessage('Enter your WhatsApp number before adding a project to cart.')
      return
    }
    addToCart({
      _id: `earnova-project-${project._id}`,
      itemType: 'service',
      serviceKey: 'projectListing',
      serviceRef: project._id,
      projectListingId: project._id,
      buyerWhatsapp: whatsapp,
      name: `Earnova Project - ${project.title}`,
      brand: 'Earnova Projects',
      price: project.price,
      quantity: 1,
      gstRate: 0,
      category: 'earnova-projects',
      thumbnail: '/favicon.svg',
    }, 1)
    navigate('/cart')
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <AuthModal isOpen={showAuth} initialTab="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />

      <section className="bg-slate-950 text-white">
        <div className="section-wrapper py-14 lg:py-20 grid lg:grid-cols-[1fr_0.8fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold text-violet-200">
              <Code2 className="w-4 h-4" />
              Earnova Projects
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight mt-5">
              Buy approved ready-made projects with documentation.
            </h1>
            <p className="text-slate-300 mt-4 max-w-2xl">
              Sellers submit a live working demo and price for admin approval. Buyers can inspect details, pay through Razorpay, and receive delivery through WhatsApp after payment.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-200">Seller instruction</p>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed">
              To list a project, submit the details here and send the live working demo link to Earnova WhatsApp for approval. Actual project files are not public before purchase.
            </p>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-10 space-y-8">
        {message && <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800">{message}</div>}

        <div className="grid xl:grid-cols-[1fr_0.85fr] gap-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">Marketplace</p>
                <h2 className="font-display font-bold text-2xl text-slate-950">Approved projects</h2>
              </div>
              <input
                className="input-base sm:max-w-xs"
                placeholder="Buyer WhatsApp number"
                value={buyerWhatsapp}
                onChange={event => setBuyerWhatsapp(event.target.value)}
              />
            </div>

            {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 rounded-2xl bg-white animate-pulse" />) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-display font-bold text-slate-900">No approved projects yet</p>
                <p className="text-sm text-slate-500 mt-1">Approved listings will appear here after admin review.</p>
              </div>
            ) : projects.map(project => (
              <div key={project._id} className="rounded-2xl bg-white border border-slate-100 shadow-card p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-bold text-xl text-slate-950">{project.title}</h3>
                      <span className="rounded-full bg-eco-50 text-eco-700 text-[10px] font-bold px-2 py-0.5">Admin approved</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{project.category} · {project.listingId}</p>
                    <p className="text-sm text-slate-700 mt-3 leading-relaxed">{project.shortDescription}</p>
                  </div>
                  <div className="lg:text-right shrink-0">
                    <p className="font-display font-black text-2xl text-slate-950">{formatPrice(project.price)}</p>
                    <button type="button" onClick={() => buyProject(project)} className="btn-primary mt-3 justify-center">
                      <ShoppingCart className="w-4 h-4" />
                      Add to cart
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-400 mb-1">Visible details</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.details}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-400 mb-1">Documentation included</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.documentationSummary}</p>
                    {project.liveDemoUrl && (
                      <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 mt-2">
                        <LinkIcon className="w-4 h-4" />
                        View live demo
                      </a>
                    )}
                  </div>
                </div>

                {(project.techStack || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.techStack.map(item => <span key={item} className="rounded-full bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1">{item}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <form onSubmit={submitListing} className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-eco-700 uppercase tracking-wide">Sell your project</p>
                <h2 className="font-display font-bold text-2xl text-slate-950 mt-1">Request Earnova listing</h2>
                <p className="text-sm text-slate-500 mt-1">Admin approves only after reviewing the live working demo and price.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="input-base text-sm" placeholder="Seller name" value={form.sellerName} onChange={e => setForm(p => ({ ...p, sellerName: e.target.value }))} required />
                <input className="input-base text-sm" type="email" placeholder="Seller email" value={form.sellerEmail} onChange={e => setForm(p => ({ ...p, sellerEmail: e.target.value }))} required />
                <input className="input-base text-sm" placeholder="Seller WhatsApp" value={form.sellerWhatsapp} onChange={e => setForm(p => ({ ...p, sellerWhatsapp: e.target.value }))} required />
                <input className="input-base text-sm" type="number" min="100" placeholder="Price" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
              </div>
              <input className="input-base text-sm" placeholder="Project title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              <select className="input-base text-sm" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(item => <option key={item}>{item}</option>)}
              </select>
              <input className="input-base text-sm" placeholder="Tech stack, comma separated" value={form.techStack} onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} />
              <input className="input-base text-sm" placeholder="Live working demo URL" value={form.liveDemoUrl} onChange={e => setForm(p => ({ ...p, liveDemoUrl: e.target.value }))} required />
              <textarea className="input-base text-sm min-h-[72px]" placeholder="Short public description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} required />
              <textarea className="input-base text-sm min-h-[96px]" placeholder="Detailed public explanation. Do not paste source code or private files." value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} required />
              <textarea className="input-base text-sm min-h-[82px]" placeholder="Mention all documentation included" value={form.documentationSummary} onChange={e => setForm(p => ({ ...p, documentationSummary: e.target.value }))} required />
              <input className="input-base text-sm" placeholder="Optional documentation preview URL" value={form.documentationUrl} onChange={e => setForm(p => ({ ...p, documentationUrl: e.target.value }))} />
              <textarea className="input-base text-sm min-h-[72px]" placeholder="Delivery notes after purchase" value={form.deliveryNotes} onChange={e => setForm(p => ({ ...p, deliveryNotes: e.target.value }))} />
              <button disabled={submitting} className="btn-primary w-full justify-center py-3">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit for admin approval
              </button>
            </form>

            {isAuthenticated && myListings.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-100 shadow-card p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">My project listings</p>
                <div className="space-y-2">
                  {myListings.map(item => (
                    <div key={item._id} className="rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                        <span className="text-[10px] font-bold rounded-full bg-primary-50 text-primary-700 px-2 py-0.5 capitalize">{item.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatPrice(item.price)} · {formatDate(item.createdAt)}</p>
                      {item.status === 'sold' && <p className="text-xs font-semibold text-eco-700 mt-1">Sold. Seller wallet credited {formatPrice(item.sellerPayout || item.price)}.</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
