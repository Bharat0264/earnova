import { useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Loader2, Zap, Upload, Download } from 'lucide-react'
import { formatPrice, CATEGORY_LABELS, CATEGORY_PLACEHOLDER_BG } from '../../utils/formatters'
import { api } from '../../utils/api'
import ProductModal from './ProductModal'

const CATS = ['all','solar-panels','fans','acs','accessories']

export default function ProductsTable({ data, loading, reload }) {
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('all')
  const [modal,   setModal]   = useState(null)  // null | 'new' | product object
  const [toggling,setToggling]= useState(null)
  const [importing, setImporting] = useState(false)

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

  const downloadTemplate = () => {
    const headers = [
      'name','category','brand','model','description','shortDesc','price','mrp',
      'gstRate','stock','sku','thumbnail','images','highlights','energySaving',
      'specs','starRating','referralName','referralIncome','referralCommission','isFeatured'
    ]
    const sample = [
      'Havells Solar Panel 540W','solar-panels','Havells','540W Mono',
      'High efficiency rooftop solar panel','Mono PERC solar panel','18500','21000',
      '18','25','HAV-SOL-540','','','High efficiency|25 year warranty',
      'Up to 70% grid saving','Peak Power:540W|Warranty:25 years','5','Member Income','500','5','true'
    ]
    const csv = `${headers.join(',')}\n${sample.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')}\n`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'earnova-product-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importProducts = async (file) => {
    if (!file) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await api.post('/products/import', formData)
      const { created, updated, failed, errors = [] } = data.results || {}
      const sampleErrors = errors
        .slice(0, 8)
        .map(err => `Row ${err.row}: ${err.message}`)
        .join('\n')
      alert(
        `Import complete. Created: ${created || 0}, Updated: ${updated || 0}, Failed: ${failed || 0}` +
        (sampleErrors ? `\n\nFirst errors:\n${sampleErrors}` : '')
      )
      reload?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setImporting(false)
    }
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
            <span className="px-3 py-1.5 text-xs font-semibold text-gray-500">
              Showing {filtered.length} of {data.length}
            </span>
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
            <button onClick={downloadTemplate} className="btn-secondary text-sm flex items-center gap-1.5 py-2">
              <Download className="w-4 h-4" /> Template
            </button>
            <label className="btn-secondary text-sm flex items-center gap-1.5 py-2 cursor-pointer">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import
              <input
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                className="hidden"
                disabled={importing}
                onChange={e => importProducts(e.target.files?.[0])}
              />
            </label>
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
