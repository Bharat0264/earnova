import { useMemo, useState } from 'react'
import { CheckCircle2, Code2, Link as LinkIcon, Search, XCircle } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDate, formatPrice } from '../../utils/formatters'

const STATUSES = ['all', 'pending', 'approved', 'sold', 'paused', 'rejected']
const STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-eco-50 text-eco-700',
  sold: 'bg-primary-50 text-primary-700',
  paused: 'bg-slate-100 text-slate-700',
  rejected: 'bg-red-50 text-red-600',
}

export default function ProjectListingsTable({ data, loading, reload }) {
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return data.filter(item => {
      const matchesStatus = status === 'all' || item.status === status
      const matchesSearch = !query || [
        item.listingId, item.title, item.category, item.sellerName, item.sellerEmail, item.sellerWhatsapp,
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [data, status, search])

  const update = async (id, body) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/project-listings/${id}`, body)
      reload?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1fr_auto] gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search project, seller, WhatsApp..." className="input-base pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(item => (
            <button key={item} onClick={() => setStatus(item)} className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${status === item ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ['Pending approval', data.filter(item => item.status === 'pending').length],
          ['Approved live', data.filter(item => item.status === 'approved').length],
          ['Sold projects', data.filter(item => item.status === 'sold').length],
          ['Seller payouts', formatPrice(data.filter(item => item.status === 'sold').reduce((sum, item) => sum + (item.sellerPayout || 0), 0))],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-1">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />) : rows.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-card">
            <Code2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-gray-900">No project listings found</h3>
            <p className="text-sm text-gray-500 mt-1">Seller project submissions will appear here.</p>
          </div>
        ) : rows.map(item => (
          <div key={item._id} className="bg-white border border-gray-100 rounded-2xl shadow-card p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold text-gray-900">{item.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STYLE[item.status] || 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.listingId}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.category} · {formatDate(item.createdAt)}</p>
                <p className="text-sm text-gray-700 mt-2">{item.shortDescription}</p>
              </div>
              <div className="lg:text-right shrink-0">
                <p className="font-display font-bold text-xl text-gray-900">{formatPrice(item.price || 0)}</p>
                <p className="text-xs text-eco-700 font-semibold">Seller: {formatPrice(item.sellerPayout || item.price || 0)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3 text-xs text-gray-600">
              <div><p className="font-bold text-gray-400 mb-1">Seller</p><p className="font-semibold text-gray-800">{item.sellerName}</p><p>{item.sellerEmail}</p><p>{item.sellerWhatsapp}</p></div>
              <div><p className="font-bold text-gray-400 mb-1">Demo</p><a href={item.liveDemoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary-700"><LinkIcon className="w-3 h-3" /> Live demo</a><p className="mt-1">{item.techStack?.join(', ') || 'No stack'}</p></div>
              <div><p className="font-bold text-gray-400 mb-1">Documentation</p><p>{item.documentationSummary}</p>{item.documentationUrl && <a href={item.documentationUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary-700">Preview docs</a>}</div>
              <div><p className="font-bold text-gray-400 mb-1">Buyer after sale</p>{item.buyer ? <><p className="font-semibold text-gray-800">{item.buyerName || item.buyer?.name}</p><p>{item.buyerEmail || item.buyer?.email}</p><p>{item.buyerWhatsapp || item.buyer?.phone}</p></> : <p className="text-gray-400">Not sold</p>}</div>
            </div>

            <div className="grid md:grid-cols-[1fr_0.7fr_auto] gap-3">
              <input className="input-base py-2 text-sm" defaultValue={item.adminNote || ''} onBlur={event => update(item._id, { adminNote: event.target.value })} placeholder="Admin note" />
              <input className="input-base py-2 text-sm" type="number" min="100" defaultValue={item.price || 0} onBlur={event => update(item._id, { price: event.target.value })} />
              <div className="flex flex-wrap gap-2">
                {item.status !== 'approved' && item.status !== 'sold' && (
                  <button onClick={() => update(item._id, { status: 'approved' })} disabled={updating === item._id} className="inline-flex items-center gap-1 text-xs font-bold text-eco-700 bg-eco-50 hover:bg-eco-100 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                )}
                {item.status === 'approved' && (
                  <button onClick={() => update(item._id, { status: 'paused' })} disabled={updating === item._id} className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl">Pause</button>
                )}
                {item.status !== 'sold' && item.status !== 'rejected' && (
                  <button onClick={() => update(item._id, { status: 'rejected' })} disabled={updating === item._id} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
