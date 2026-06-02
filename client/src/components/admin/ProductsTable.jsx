import { useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, X, Loader2, CheckCircle2, Zap } from 'lucide-react'
import { formatPrice, CATEGORY_LABELS, CATEGORY_PLACEHOLDER_BG } from '../../utils/formatters'
import { api } from '../../utils/api'

const CATS = ['all','solar-panels','fans','acs','accessories']

/* ── Inline product form modal ── */
function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?._id
  const [form, setForm] = useState({
    name:         product?.name         || '',
    category:     product?.category     || 'solar-panels',
    brand:        product?.brand        || '',
    price:        product?.price        || '',
    mrp:          product?.mrp          || '',
    gstRate:      product?.gstRate      || 18,
    stock:        product?.stock        || '',
    starRating:   product?.starRating   || 5,
    energySaving: product?.energySaving || '',
    shortDesc:    product?.shortDesc    || '',
    referralCommission: product?.referralCommission || 5,
    isFeatured:   product?.isFeatured   || false,
  })
  const [highlights, setHighlights] = useState(product?.highlights || [''])
  const [specs,      setSpecs]      = useState(product?.specs || [{ key: '', value: '' }])
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.brand || !form.price) { setError('Name, brand and price are required.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        price:    Number(form.price),
        mrp:      Number(form.mrp) || Number(form.price),
        stock:    Number(form.stock) || 0,
        highlights: highlights.filter(h => h.trim()),
        specs:      specs.filter(s => s.key.trim()),
      }
      if (editing) await api.patch(`/products/${product._id}`, payload)
      else         await api.post('/products', payload)
      onSaved?.()
      onClose()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const F = ({ label, k, type = 'text', ph }) => (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-0.5">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
             className="input-base py-2 text-sm" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><F label="Product Name *" k="name" ph="Atomberg Renesa+ 1200mm" /></div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-0.5">Category *</label>
              <select value={form.category} onChange={set('category')} className="input-base py-2 text-sm">
                {['solar-panels','fans','acs','accessories'].map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <F label="Brand *" k="brand" ph="Atomberg" />
            <F label="Selling Price (₹) *" k="price" type="number" ph="3199" />
            <F label="MRP (₹)"             k="mrp"   type="number" ph="4200" />
            <F label="GST Rate (%)"        k="gstRate" type="number" ph="18" />
            <F label="Stock"               k="stock"   type="number" ph="50" />
            <F label="Star Rating (1–5)"   k="starRating" type="number" ph="5" />
            <F label="Referral Commission (%)" k="referralCommission" type="number" ph="5" />
            <div className="col-span-2"><F label="Energy Saving Tag" k="energySaving" ph="Saves ₹1,500/fan/year" /></div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-0.5">Short Description</label>
              <textarea value={form.shortDesc} onChange={set('shortDesc')} rows={2}
                        className="input-base py-2 text-sm resize-none" placeholder="One-liner description…" />
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Key Highlights</label>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input value={h} onChange={e => setHighlights(hl => hl.map((x, j) => j === i ? e.target.value : x))}
                         placeholder={`Highlight ${i+1}`} className="input-base py-2 text-sm flex-1" />
                  <button onClick={() => setHighlights(hl => hl.filter((_, j) => j !== i))}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => setHighlights(h => [...h, ''])}
                      className="text-xs font-semibold text-primary-600 hover:underline">+ Add Highlight</button>
            </div>
          </div>

          {/* Specs */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Specifications</label>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.key} onChange={e => setSpecs(sp => sp.map((x, j) => j === i ? {...x, key: e.target.value} : x))}
                         placeholder="Key" className="input-base py-2 text-sm w-2/5" />
                  <input value={s.value} onChange={e => setSpecs(sp => sp.map((x, j) => j === i ? {...x, value: e.target.value} : x))}
                         placeholder="Value" className="input-base py-2 text-sm flex-1" />
                  <button onClick={() => setSpecs(sp => sp.filter((_, j) => j !== i))}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => setSpecs(s => [...s, { key: '', value: '' }])}
                      className="text-xs font-semibold text-primary-600 hover:underline">+ Add Spec</button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))}
                   className="w-4 h-4 accent-primary-700" />
            <span className="text-sm text-gray-600">Featured product (shown on homepage)</span>
          </label>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={save} disabled={saving}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
          </button>
          <button onClick={onClose} className="btn-secondary text-sm px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsTable({ data, loading, reload }) {
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('all')
  const [modal,   setModal]   = useState(null)  // null | 'new' | product object
  const [toggling,setToggling]= useState(null)

  const filtered = data.filter(p => {
    const matchCat = cat === 'all' || p.category === cat
    const matchQ   = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  const toggleActive = async (p) => {
    setToggling(p._id)
    try { await api.patch(`/products/${p._id}`, { isActive: !p.isActive }); reload?.() }
    catch (e) { alert(e.message) }
    finally { setToggling(null) }
  }

  return (
    <>
      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={reload} />}

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        cat === c ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search…" className="input-base pl-8 py-2 text-sm w-44" />
            </div>
            <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center gap-1.5 py-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            : filtered.map(p => {
                const bg = CATEGORY_PLACEHOLDER_BG[p.category] || 'from-gray-800 to-gray-700'
                return (
                  <div key={p._id} className={`bg-white border rounded-2xl overflow-hidden shadow-card transition-all ${p.isActive ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {p.thumbnail || p.images?.[0]
                        ? <img src={p.thumbnail || p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-center justify-center`}>
                            <Zap className="w-8 h-8 text-white/20" />
                          </div>
                      }
                      {!p.isActive && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inactive</span>
                        </div>
                      )}
                      {p.isFeatured && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mb-0.5">{p.brand}</p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{p.name}</p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-gray-900">{formatPrice(p.price)}</p>
                        <span className="text-[11px] text-gray-400">Stock: {p.stock ?? '?'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setModal(p)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold
                                           border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => toggleActive(p)} disabled={toggling === p._id}
                                className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
                          {toggling === p._id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : p.isActive ? <ToggleRight className="w-4 h-4 text-eco-500" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </>
  )
}
