import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Download, Plus, RefreshCw, Upload } from 'lucide-react'
import { useBusiness } from '../context/BusinessContext'
import { api, apiUrl } from '../utils/api'
import { formatMoney, futureDateInput, rupeesToPaise, todayInput } from '../utils/business'

const MODULES = {
  customers: { title: 'Customers', description: 'Keep customer identity, contact details and lifetime value in one place.', endpoint: 'customers', dataKey: 'customers' },
  leads: { title: 'Sales pipeline', description: 'Track opportunities, values, stages and next follow-ups.', endpoint: 'leads', dataKey: 'leads' },
  inventory: { title: 'Inventory', description: 'Manage tenant-scoped SKUs, pricing, stock and reorder thresholds.', endpoint: 'products', dataKey: 'products' },
  sales: { title: 'Sales', description: 'Record verified product sales and update stock automatically.', endpoint: 'sales', dataKey: 'sales' },
  expenses: { title: 'Expenses', description: 'Capture categorized operating costs for accurate profitability.', endpoint: 'expenses', dataKey: 'expenses' },
  invoices: { title: 'Invoices', description: 'Create server-calculated invoices and manage collection status.', endpoint: 'invoices', dataKey: 'invoices' },
}

const emptyForms = {
  customers: { name: '', email: '', phone: '', company: '', address: '', notes: '' },
  leads: { name: '', company: '', estimatedValue: '', stage: 'new', source: '', followUpAt: todayInput(), notes: '' },
  inventory: { sku: '', name: '', category: '', purchasePrice: '', sellingPrice: '', currentQuantity: '0', reorderLevel: '0', supplier: '' },
  sales: { customerId: '', productId: '', quantity: '1', discount: '0', taxRate: '0', paymentStatus: 'paid', paymentMethod: 'upi', saleDate: todayInput(), notes: '' },
  expenses: { category: '', amount: '', vendor: '', expenseDate: todayInput(), paymentMethod: 'upi', notes: '', recurring: false },
  invoices: { customerId: '', description: '', quantity: '1', unitPrice: '', discount: '0', taxRate: '18', dueDate: futureDateInput(), status: 'draft', notes: '' },
}

const field = (label, name, options = {}) => ({ label, name, ...options })
const FORM_FIELDS = {
  customers: [
    field('Customer name', 'name', { required: true }),
    field('Company', 'company'),
    field('Email', 'email', { type: 'email' }),
    field('Mobile', 'phone', { inputMode: 'tel' }),
    field('Address', 'address', { wide: true }),
    field('Notes', 'notes', { textarea: true, wide: true }),
  ],
  leads: [
    field('Lead name', 'name', { required: true }),
    field('Company', 'company'),
    field('Estimated value (₹)', 'estimatedValue', { required: true, type: 'number', min: '0' }),
    field('Stage', 'stage', { options: [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['proposal', 'Proposal'], ['negotiation', 'Negotiation']] }),
    field('Source', 'source'),
    field('Follow-up date', 'followUpAt', { type: 'date' }),
    field('Notes', 'notes', { textarea: true, wide: true }),
  ],
  inventory: [
    field('SKU', 'sku', { required: true }),
    field('Product name', 'name', { required: true }),
    field('Category', 'category'),
    field('Supplier', 'supplier'),
    field('Purchase price (₹)', 'purchasePrice', { type: 'number', min: '0', step: '.01' }),
    field('Selling price (₹)', 'sellingPrice', { required: true, type: 'number', min: '0', step: '.01' }),
    field('Opening quantity', 'currentQuantity', { required: true, type: 'number', min: '0', step: '1' }),
    field('Reorder level', 'reorderLevel', { required: true, type: 'number', min: '0', step: '1' }),
  ],
  sales: [
    field('Customer', 'customerId', { reference: 'customers' }),
    field('Inventory item', 'productId', { required: true, reference: 'products' }),
    field('Quantity', 'quantity', { required: true, type: 'number', min: '1', step: '1' }),
    field('Line discount (₹)', 'discount', { type: 'number', min: '0', step: '.01' }),
    field('Tax rate (%)', 'taxRate', { type: 'number', min: '0', max: '100', step: '.01' }),
    field('Payment status', 'paymentStatus', { options: [['paid', 'Paid'], ['pending', 'Pending'], ['partial', 'Partial']] }),
    field('Payment method', 'paymentMethod', { options: [['upi', 'UPI'], ['cash', 'Cash'], ['card', 'Card'], ['bank_transfer', 'Bank transfer'], ['credit', 'Credit'], ['other', 'Other']] }),
    field('Sale date', 'saleDate', { type: 'date' }),
    field('Notes', 'notes', { textarea: true, wide: true }),
  ],
  expenses: [
    field('Category', 'category', { required: true }),
    field('Amount (₹)', 'amount', { required: true, type: 'number', min: '.01', step: '.01' }),
    field('Vendor', 'vendor'),
    field('Expense date', 'expenseDate', { required: true, type: 'date' }),
    field('Payment method', 'paymentMethod', { options: [['upi', 'UPI'], ['cash', 'Cash'], ['card', 'Card'], ['bank_transfer', 'Bank transfer'], ['credit', 'Credit'], ['other', 'Other']] }),
    field('Notes', 'notes', { textarea: true, wide: true }),
  ],
  invoices: [
    field('Customer', 'customerId', { required: true, reference: 'customers' }),
    field('Description', 'description', { required: true }),
    field('Quantity', 'quantity', { required: true, type: 'number', min: '.01', step: '.01' }),
    field('Unit price (₹)', 'unitPrice', { required: true, type: 'number', min: '0', step: '.01' }),
    field('Discount (₹)', 'discount', { type: 'number', min: '0', step: '.01' }),
    field('Tax rate (%)', 'taxRate', { type: 'number', min: '0', max: '100', step: '.01' }),
    field('Due date', 'dueDate', { required: true, type: 'date' }),
    field('Initial status', 'status', { options: [['draft', 'Draft'], ['sent', 'Sent']] }),
    field('Notes', 'notes', { textarea: true, wide: true }),
  ],
}

function formPayload(module, form) {
  if (module === 'inventory') return {
    ...form,
    purchasePricePaise: rupeesToPaise(form.purchasePrice),
    sellingPricePaise: rupeesToPaise(form.sellingPrice),
    currentQuantity: Number(form.currentQuantity),
    reorderLevel: Number(form.reorderLevel),
  }
  if (module === 'leads') return { ...form, estimatedValuePaise: rupeesToPaise(form.estimatedValue) }
  if (module === 'sales') return {
    customerId: form.customerId || undefined,
    items: [{
      productId: form.productId,
      quantity: Number(form.quantity),
      discountPaise: rupeesToPaise(form.discount),
      taxRateBps: Math.round(Number(form.taxRate || 0) * 100),
    }],
    paymentStatus: form.paymentStatus,
    paymentMethod: form.paymentMethod,
    saleDate: form.saleDate,
    notes: form.notes,
  }
  if (module === 'expenses') return { ...form, amountPaise: rupeesToPaise(form.amount) }
  if (module === 'invoices') return {
    customerId: form.customerId,
    items: [{
      description: form.description,
      quantity: Number(form.quantity),
      unitPricePaise: rupeesToPaise(form.unitPrice),
      discountPaise: rupeesToPaise(form.discount),
      taxRateBps: Math.round(Number(form.taxRate || 0) * 100),
    }],
    dueDate: form.dueDate,
    status: form.status,
    notes: form.notes,
  }
  return form
}

function recordCells(module, record) {
  if (module === 'customers') return [record.name, record.company || '—', record.email || record.phone || '—', formatMoney(record.totalRevenuePaise)]
  if (module === 'leads') return [record.name, record.company || '—', record.stage, formatMoney(record.estimatedValuePaise)]
  if (module === 'inventory') return [record.sku, record.name, record.currentQuantity, formatMoney(record.sellingPricePaise)]
  if (module === 'sales') return [record.saleNumber, record.customerName || record.customer?.name || 'Walk-in', record.paymentStatus, formatMoney(record.totalPaise)]
  if (module === 'expenses') return [record.category, record.vendor || '—', new Date(record.expenseDate).toLocaleDateString('en-IN'), formatMoney(record.amountPaise)]
  return [record.invoiceNumber, record.customerSnapshot?.name || '—', record.status, formatMoney(record.totalPaise)]
}

const HEADINGS = {
  customers: ['Customer', 'Company', 'Contact', 'Lifetime value'],
  leads: ['Lead', 'Company', 'Stage', 'Value'],
  inventory: ['SKU', 'Product', 'In stock', 'Selling price'],
  sales: ['Sale number', 'Customer', 'Payment', 'Total'],
  expenses: ['Category', 'Vendor', 'Date', 'Amount'],
  invoices: ['Invoice', 'Customer', 'Status', 'Total'],
}
const ACTION_MODULES = ['leads', 'inventory', 'invoices']

function AnalyticsPanel({ businessId }) {
  const [data, setData] = useState(null)
  const [preset, setPreset] = useState('last_30_days')
  const [customStart, setCustomStart] = useState(todayInput())
  const [customEnd, setCustomEnd] = useState(todayInput())
  const [error, setError] = useState('')
  useEffect(() => {
    setError('')
    const customQuery = preset === 'custom' ? `&start=${customStart}&end=${customEnd}` : ''
    api.get(`/businesses/${businessId}/overview?preset=${preset}${customQuery}`).then(setData).catch(requestError => setError(requestError.message))
  }, [businessId, preset, customStart, customEnd])
  const metrics = data?.metrics || {}
  return (
    <div>
      <div className="flex flex-wrap gap-2">{[['today', 'Today'], ['last_7_days', '7 days'], ['last_30_days', '30 days'], ['current_quarter', 'Quarter'], ['current_year', 'Year'], ['custom', 'Custom']].map(([value, label]) => <button type="button" key={value} onClick={() => setPreset(value)} className={preset === value ? 'btn-primary' : 'btn-secondary'}>{label}</button>)}</div>
      {preset === 'custom' && <div className="mt-4 flex flex-wrap gap-3"><label className="form-field">From<input className="input-base" type="date" max={customEnd} value={customStart} onChange={event => setCustomStart(event.target.value)} /></label><label className="form-field">To<input className="input-base" type="date" min={customStart} value={customEnd} onChange={event => setCustomEnd(event.target.value)} /></label></div>}
      {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Revenue', formatMoney(metrics.revenuePaise)], ['Expenses', formatMoney(metrics.expensePaise)], ['Profit', formatMoney(metrics.profitPaise)], ['Pipeline', formatMoney(metrics.pipelineValuePaise)]].map(([label, value]) => <article className="surface-card p-5" key={label}><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></article>)}
      </div>
      <section className="mt-6 surface-card p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950"><BarChart3 className="h-5 w-5 text-brand-700" />Top recorded products</h2>
        <div className="mt-4 space-y-3">{(data?.topProducts || []).map(product => <div key={product._id} className="flex justify-between rounded-xl bg-slate-50 p-4 text-sm"><span className="font-bold text-slate-800">{product._id}</span><span className="text-slate-600">{product.quantity} units · {formatMoney(product.revenuePaise)}</span></div>)}{!data?.topProducts?.length && <p className="text-sm text-slate-500">No product sales in this period.</p>}</div>
      </section>
    </div>
  )
}

function CsvImportPanel({ businessId, module, onImported }) {
  const importType = module === 'inventory' ? 'products' : module
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = async action => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await api.post(`/businesses/${businessId}/imports/${importType}/${action}`, body)
      if (action === 'preview') setPreview(data)
      else {
        setSummary(data.summary)
        setPreview(null)
        await onImported()
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = async () => {
    setError('')
    try {
      const response = await fetch(apiUrl(`/businesses/${businessId}/imports/${importType}/template`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('earnova_token')}` },
      })
      if (!response.ok) throw new Error('Could not download the template.')
      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `earnova-${importType}-template.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <details className="mt-6 surface-card p-5">
      <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">Import {module} from CSV</summary>
      <p className="mt-2 text-sm text-slate-600">Maximum 2 MB and 5,000 rows. Preview and validate the file before importing.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv,text/csv" className="max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-bold" onChange={event => { setFile(event.target.files?.[0] || null); setPreview(null); setSummary(null) }} />
        <button type="button" className="btn-secondary" onClick={downloadTemplate}><Download className="h-4 w-4" />Template</button>
        <button type="button" className="btn-secondary" disabled={!file || loading} onClick={() => upload('preview')}><Upload className="h-4 w-4" />{loading ? 'Validating…' : 'Preview file'}</button>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
      {preview && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm font-bold text-slate-800">{preview.rowCount} rows ready for import</p><p className="mt-1 text-xs text-slate-500">Columns: {preview.headers.join(', ')}</p><button type="button" className="btn-primary mt-4" disabled={loading} onClick={() => upload('execute')}>Import validated rows</button></div>}
      {summary && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><strong>{summary.imported} records imported.</strong> {summary.rejected} rejected; {summary.duplicatesSkipped} duplicates skipped.{summary.errors?.length > 0 && <ul className="mt-2 list-disc pl-5">{summary.errors.slice(0, 5).map(item => <li key={`${item.rowNumber}-${item.message}`}>Row {item.rowNumber}: {item.message}</li>)}</ul>}</div>}
    </details>
  )
}

export default function BusinessRecordsPage({ module }) {
  const { selectedBusiness, selectedBusinessId, loading: businessLoading } = useBusiness()
  const config = MODULES[module]
  const [records, setRecords] = useState([])
  const [references, setReferences] = useState({ customers: [], products: [] })
  const [form, setForm] = useState(() => ({ ...(emptyForms[module] || {}) }))
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!selectedBusinessId || !config) return
    setLoading(true)
    setError('')
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      const data = await api.get(`/businesses/${selectedBusinessId}/${config.endpoint}${query}`)
      setRecords(data[config.dataKey] || [])
      if (['sales', 'invoices'].includes(module)) {
        const requests = [api.get(`/businesses/${selectedBusinessId}/customers?limit=100`)]
        if (module === 'sales') requests.push(api.get(`/businesses/${selectedBusinessId}/products?limit=100`))
        const [customers, products] = await Promise.all(requests)
        setReferences({ customers: customers.customers || [], products: products?.products || [] })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setForm({ ...(emptyForms[module] || {}) })
    setShowForm(false)
    if (module !== 'analytics') load()
    // `load` intentionally refreshes when module or selected tenant changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, selectedBusinessId])

  const fields = useMemo(() => FORM_FIELDS[module] || [], [module])
  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/businesses/${selectedBusinessId}/${config.endpoint}`, formPayload(module, form))
      setForm({ ...emptyForms[module] })
      setShowForm(false)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const updateRecord = async (record, value) => {
    setError('')
    try {
      if (module === 'inventory') {
        await api.patch(`/businesses/${selectedBusinessId}/products/${record._id}/stock`, { adjustment: value, reason: 'Workspace quick adjustment' })
      } else if (module === 'leads') {
        await api.patch(`/businesses/${selectedBusinessId}/leads/${record._id}`, { stage: value })
      } else if (module === 'invoices') {
        await api.patch(`/businesses/${selectedBusinessId}/invoices/${record._id}/status`, { status: value })
      }
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (businessLoading) return <div className="state-panel">Loading workspace…</div>
  if (!selectedBusiness) return <div className="state-panel"><AlertTriangle className="h-8 w-8 text-amber-600" /><h1 className="text-xl font-bold">Create a business first</h1><p className="text-center text-sm text-slate-600">Business records must belong to a secure workspace.</p><Link to="/app/overview" className="btn-primary">Go to overview</Link></div>
  if (module === 'analytics') return <div><p className="eyebrow">Analytics</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{selectedBusiness.name} performance</h1><p className="mt-2 mb-6 text-slate-600">Deterministic metrics calculated from authorized workspace records.</p><AnalyticsPanel businessId={selectedBusinessId} /></div>

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{selectedBusiness.name}</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{config.title}</h1><p className="mt-2 text-slate-600">{config.description}</p></div>
        <div className="flex gap-2"><button type="button" className="icon-button" onClick={load} aria-label={`Refresh ${config.title}`}><RefreshCw className="h-5 w-5" /></button><button type="button" className="btn-primary" onClick={() => setShowForm(value => !value)}><Plus className="h-4 w-4" />Add {config.title.toLowerCase().replace(/s$/, '')}</button></div>
      </div>
      <form className="mt-5 flex max-w-xl gap-2" onSubmit={event => { event.preventDefault(); load() }}>
        <label className="sr-only" htmlFor={`${module}-search`}>Search {config.title}</label>
        <input id={`${module}-search`} className="input-base" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} />
        <button className="btn-secondary">Search</button>
      </form>
      {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {showForm && <form onSubmit={submit} className="mt-6 surface-card p-6"><h2 className="text-xl font-bold text-slate-950">New {config.title.toLowerCase().replace(/s$/, '')}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(item => <label key={item.name} className={`form-field ${item.wide ? 'sm:col-span-2' : ''}`}>{item.label}
          {item.textarea ? <textarea className="input-base min-h-24" value={form[item.name]} onChange={event => setForm({ ...form, [item.name]: event.target.value })} /> : item.options ? <select className="input-base" value={form[item.name]} onChange={event => setForm({ ...form, [item.name]: event.target.value })}>{item.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : item.reference ? <select required={item.required} className="input-base" value={form[item.name]} onChange={event => setForm({ ...form, [item.name]: event.target.value })}><option value="">{item.required ? 'Select one' : 'Optional'}</option>{references[item.reference].map(reference => <option key={reference._id} value={reference._id}>{reference.name}{reference.sku ? ` · ${reference.sku} · ${reference.currentQuantity} in stock` : ''}</option>)}</select> : <input className="input-base" required={item.required} type={item.type || 'text'} inputMode={item.inputMode} min={item.min} max={item.max} step={item.step} value={form[item.name]} onChange={event => setForm({ ...form, [item.name]: event.target.value })} />}
        </label>)}
      </div><div className="mt-5 flex gap-3"><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save record'}</button><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div></form>}
      {['customers', 'inventory', 'sales', 'expenses'].includes(module) && <CsvImportPanel businessId={selectedBusinessId} module={module} onImported={load} />}
      <div className="mt-6 table-shell">
        <table className="data-table"><thead><tr>{HEADINGS[module].map(heading => <th key={heading}>{heading}</th>)}{ACTION_MODULES.includes(module) && <th>Actions</th>}</tr></thead><tbody>{records.map(record => <tr key={record._id}>{recordCells(module, record).map((value, index) => <td key={`${record._id}-${HEADINGS[module][index]}`}>{index === 2 && ['leads', 'sales', 'invoices'].includes(module) ? <span className="status-badge status-info">{String(value).replaceAll('_', ' ')}</span> : value}</td>)}{module === 'inventory' && <td><div className="flex gap-2"><button type="button" className="rounded-lg border px-3 py-1 font-bold" disabled={record.currentQuantity < 1} onClick={() => updateRecord(record, -1)}>−1</button><button type="button" className="rounded-lg border px-3 py-1 font-bold" onClick={() => updateRecord(record, 1)}>+1</button></div></td>}{module === 'leads' && <td><select aria-label={`Stage for ${record.name}`} className="rounded-lg border px-2 py-1 text-sm" value={record.stage} onChange={event => updateRecord(record, event.target.value)}>{[['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['proposal', 'Proposal'], ['negotiation', 'Negotiation'], ['won', 'Won'], ['lost', 'Lost']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>}{module === 'invoices' && <td><button type="button" className="rounded-lg border px-3 py-1 text-sm font-bold disabled:opacity-50" disabled={record.status === 'paid'} onClick={() => updateRecord(record, 'paid')}>{record.status === 'paid' ? 'Paid' : 'Mark paid'}</button></td>}</tr>)}</tbody></table>
        {!loading && !records.length && <div className="p-10 text-center text-sm text-slate-500">No {config.title.toLowerCase()} recorded yet.</div>}
        {loading && <div className="p-10 text-center text-sm font-semibold text-slate-500">Loading records…</div>}
      </div>
    </div>
  )
}
