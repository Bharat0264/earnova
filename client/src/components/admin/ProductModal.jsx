import { useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '../../utils/api'
import { CATEGORY_LABELS } from '../../utils/formatters'

export default function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?._id

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'solar-panels',
    brand: product?.brand || '',
    price: product?.price || '',
    mrp: product?.mrp || '',
    gstRate: product?.gstRate || 18,
    stock: product?.stock || '',
    starRating: product?.starRating || 5,
    energySaving: product?.energySaving || '',
    shortDesc: product?.shortDesc || '',
    referralCommission: product?.referralCommission || 5,
    isFeatured: product?.isFeatured || false,
  })

  const [highlights, setHighlights] = useState(product?.highlights || [''])
  const [specs, setSpecs] = useState(product?.specs || [{ key: '', value: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!form.name || !form.brand || !form.price) {
      setError('Name, brand and price are required.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp) || Number(form.price),
        stock: Number(form.stock) || 0,
        highlights: highlights.filter(h => h.trim()),
        specs: specs.filter(s => s.key.trim()),
      }

      if (editing) {
        await api.patch(`/products/${product._id}`, payload)
      } else {
        await api.post('/products', payload)
      }

      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5">

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">
            {editing ? 'Edit Product' : 'Add Product'}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">

          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Product Name"
            className="input-base col-span-2"
          />

          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="input-base"
          >
            {['solar-panels','fans','acs','accessories'].map(c => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>

          <input
            value={form.brand}
            onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            placeholder="Brand"
            className="input-base"
          />

          <input
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="Price"
            className="input-base"
          />

          <input
            type="number"
            value={form.mrp}
            onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
            placeholder="MRP"
            className="input-base"
          />

          <input
            type="number"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            placeholder="Stock"
            className="input-base"
          />

          <textarea
            value={form.shortDesc}
            onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))}
            placeholder="Short Description"
            className="input-base col-span-2"
          />

        </div>

        <div className="mt-5 flex gap-3">

          <button
            onClick={save}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />
            }

            {editing ? 'Save Product' : 'Add Product'}
          </button>

          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>

        </div>

      </div>
    </div>
  )
}