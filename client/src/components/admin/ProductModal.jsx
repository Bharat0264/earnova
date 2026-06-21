import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2, Clipboard } from 'lucide-react'
import { api } from '../../utils/api'
import { CATEGORY_LABELS } from '../../utils/formatters'

export default function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?._id

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'solar-panels',
    brand: product?.brand || '',
    description: product?.description || '',
    shortDesc: product?.shortDesc || '',
    price: product?.price || '',
    mrp: product?.mrp || '',
    gstRate: product?.gstRate || 18,
    stock: product?.stock || '',
    starRating: product?.starRating || 5,
    energySaving: product?.energySaving || '',
    referralName: product?.referralName || '',
    referralIncome: product?.referralIncome || '',
    referralCommission: product?.referralCommission || 5,
    thumbnail: product?.thumbnail || '',
    imagesText: product?.images?.join('\n') || '',
    isFeatured: product?.isFeatured || false,
  })

  const [highlights, setHighlights] = useState(product?.highlights || [''])
  const [specs, setSpecs] = useState(product?.specs || [{ key: '', value: '' }])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.thumbnail || '')
  const [pasteStatus, setPasteStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setProductImageFile = (file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setPasteStatus(file.name ? `Selected ${file.name}` : 'Image ready to upload')
    setError('')
  }

  const handleImagePaste = (event) => {
    const items = Array.from(event.clipboardData?.items || [])
    const imageItem = items.find(item => item.type.startsWith('image/'))
    const blob = imageItem?.getAsFile()

    if (!blob) return

    event.preventDefault()
    const ext = blob.type.split('/')[1] || 'png'
    const file = new File([blob], `pasted-product-image.${ext}`, { type: blob.type })
    setProductImageFile(file)
  }

  const pasteImageFromClipboard = async () => {
    if (!navigator.clipboard?.read) {
      setPasteStatus('Press Ctrl+V here after copying an image.')
      return
    }

    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find(type => type.startsWith('image/'))
        if (!imageType) continue

        const blob = await clipboardItem.getType(imageType)
        const ext = imageType.split('/')[1] || 'png'
        setProductImageFile(new File([blob], `pasted-product-image.${ext}`, { type: imageType }))
        return
      }
      setPasteStatus('Clipboard has no copied image.')
    } catch {
      setPasteStatus('Press Ctrl+V here after copying an image.')
    }
  }

  useEffect(() => {
    document.addEventListener('paste', handleImagePaste)
    return () => document.removeEventListener('paste', handleImagePaste)
  }, [])

  const save = async () => {
    if (
      !form.name ||
      !form.brand ||
      !form.price ||
      !form.description ||
      form.referralIncome === ''
    ) {
      setError('Name, Brand, Description, Price and Member Earnings are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const imageUrls = form.imagesText
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(Boolean)

      const payload = {
        ...form,

        description:
          form.description ||
          form.shortDesc ||
          form.name,

        price: Number(form.price),
        mrp: Number(form.mrp) || Number(form.price),
        stock: Number(form.stock) || 0,
        gstRate: Number(form.gstRate) || 18,
        starRating: Number(form.starRating) || 5,
        referralName: form.referralName,
        referralIncome: Number(form.referralIncome) || 0,
        referralCommission: Number(form.referralCommission) || 5,
        thumbnail: form.thumbnail.trim() || undefined,
        images: imageUrls,

        highlights: highlights.filter(h => h.trim()),
        specs: specs.filter(s => s.key.trim()),
      }

      delete payload.imagesText

      let savedProduct
      if (editing) {
        const data = await api.patch(`/products/${product._id}`, payload)
        savedProduct = data.product
      } else {
        const data = await api.post('/products', payload)
        savedProduct = data.product
      }

      if (imageFile && savedProduct?._id) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await api.post(`/products/${savedProduct._id}/upload-image`, formData)
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

          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Full Product Description"
            rows={4}
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

          <input
            value={form.referralName}
            onChange={e => setForm(f => ({ ...f, referralName: e.target.value }))}
            placeholder="Referral Name"
            className="input-base"
          />

          <input
            type="number"
            required
            value={form.referralIncome}
            onChange={e => setForm(f => ({ ...f, referralIncome: e.target.value }))}
            placeholder="Member Earnings *"
            className="input-base"
          />

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image Upload (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  setProductImageFile(file)
                }
              }}
              className="input-base"
            />
            <div
              onPaste={handleImagePaste}
              tabIndex={0}
              className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500 focus:border-primary-400 focus:outline-none"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Copy an image, then paste it here with Ctrl+V.</span>
                <button
                  type="button"
                  onClick={pasteImageFromClipboard}
                  className="btn-secondary inline-flex items-center justify-center gap-2 px-3 py-2 text-xs"
                >
                  <Clipboard className="h-4 w-4" />
                  Paste image
                </button>
              </div>
              {pasteStatus && <p className="mt-2 text-xs text-primary-700">{pasteStatus}</p>}
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product preview"
                className="mt-2 h-28 w-full object-cover rounded-lg border"
              />
            )}
          </div>

          <input
            value={form.thumbnail}
            onChange={e => {
              const value = e.target.value
              setForm(f => ({ ...f, thumbnail: value }))
              setImagePreview(value)
            }}
            placeholder="Thumbnail Image URL (optional)"
            className="input-base col-span-2"
          />

          <textarea
            value={form.imagesText}
            onChange={e => setForm(f => ({ ...f, imagesText: e.target.value }))}
            placeholder="Image URLs (optional, one per line)"
            rows={3}
            className="input-base col-span-2"
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
