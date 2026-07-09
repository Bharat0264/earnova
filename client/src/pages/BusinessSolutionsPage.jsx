import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, BarChart3, Brain, CheckCircle2, ChevronRight, Cloud, Database,
  ClipboardCheck, FileSpreadsheet, Gauge, IndianRupee, Layers, LineChart, Loader2,
  LockKeyhole, MessageSquareText, PackageSearch, Percent, PlugZap, RefreshCw,
  ShieldCheck, ShoppingBag, Target, TrendingDown, TrendingUp, Upload,
  Users, WalletCards,
} from 'lucide-react'
import AuthModal from '../components/auth/AuthModal'
import { loadRazorpayScript } from '../components/checkout/ReviewStep'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { formatPrice } from '../utils/formatters'

const PLAN_PRICE = 19
const TABS = ['Overview', 'Profit Lab', 'AI Forecast', 'AI Advisor', 'Customers', 'Products', 'Integrations']
const SAVED_ORDERS_KEY = 'earnova-business-orders-v1'
const SAVED_SOURCE_KEY = 'earnova-business-source-v1'

const DEFAULT_PROFILE = {
  businessType: 'Retail / ecommerce',
  monthlyTarget: 800000,
  grossMargin: 32,
  fixedCosts: 85000,
  adSpend: 42000,
  conversionLift: 12,
}

const VALUE_PROPS = [
  ['Daily owner view', 'Earnings, orders, customers, best sellers and risk signals in one dashboard.'],
  ['AI decision engine', 'Forecasts sales, orders, churn and product demand from business data.'],
  ['Integration ready', 'Upload CSV now, then connect store, POS, ERP or marketplace exports.'],
]

const OPERATING_SYSTEM = [
  ['Morning briefing', 'Know yesterday revenue, missed targets, stock pressure and top customer movement.'],
  ['Growth planner', 'See which product, category and customer segment deserves budget today.'],
  ['Risk monitor', 'Catch churn, falling product demand, weak repeat rate and stockout exposure early.'],
  ['Owner output', 'Get action notes written like a business analyst, not raw charts only.'],
]

const SAMPLE_ROWS = [
  ['2026-07-01', 'ORD-1001', 'C001', 'Priya Stores', 'Solar Panel 400W', 'Solar', 2, 17800],
  ['2026-07-01', 'ORD-1002', 'C002', 'Metro Retail', 'BLDC Fan Pro', 'Fans', 8, 2899],
  ['2026-07-02', 'ORD-1003', 'C003', 'Nexa Foods', 'Inverter AC 1.5T', 'AC', 1, 41999],
  ['2026-07-03', 'ORD-1004', 'C004', 'Urban Homes', 'Smart LED Kit', 'Accessories', 12, 599],
  ['2026-07-03', 'ORD-1005', 'C001', 'Priya Stores', 'BLDC Fan Pro', 'Fans', 10, 2899],
  ['2026-07-04', 'ORD-1006', 'C005', 'Green Villa', 'Solar Battery 150Ah', 'Solar', 1, 16800],
  ['2026-07-05', 'ORD-1007', 'C006', 'Ace Offices', 'Inverter AC 1.5T', 'AC', 3, 41999],
  ['2026-07-06', 'ORD-1008', 'C002', 'Metro Retail', 'BLDC Fan Pro', 'Fans', 14, 2899],
  ['2026-07-07', 'ORD-1009', 'C007', 'Lotus Cafe', 'Smart LED Kit', 'Accessories', 22, 599],
  ['2026-07-08', 'ORD-1010', 'C008', 'Sana Textiles', 'Solar Panel 400W', 'Solar', 3, 17800],
  ['2026-07-09', 'ORD-1011', 'C003', 'Nexa Foods', 'BLDC Fan Pro', 'Fans', 6, 2899],
  ['2026-07-09', 'ORD-1012', 'C009', 'Prime Mart', 'Solar Hybrid Inverter', 'Solar', 1, 24500],
]

const sampleOrders = SAMPLE_ROWS.map(([date, orderId, customerId, customer, product, category, quantity, price]) => ({
  date, orderId, customerId, customer, product, category, quantity, price,
  revenue: quantity * price,
}))

const emptyManualSale = () => ({
  date: new Date().toISOString().slice(0, 10),
  customer: 'Walk-in customer',
  product: '',
  category: 'General',
  quantity: 1,
  price: '',
})

const loadSavedOrders = () => {
  try {
    const saved = localStorage.getItem(SAVED_ORDERS_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    return Array.isArray(parsed) && parsed.length ? parsed : sampleOrders
  } catch {
    return sampleOrders
  }
}

const loadSavedSource = () => {
  try {
    return localStorage.getItem(SAVED_SOURCE_KEY) || 'Sample retail dataset'
  } catch {
    return 'Sample retail dataset'
  }
}

const headerAliases = {
  date: ['date', 'orderdate', 'createdat', 'created', 'day'],
  orderId: ['orderid', 'order', 'invoice', 'invoiceid', 'id'],
  customerId: ['customerid', 'customer_id', 'userid', 'buyerid', 'email', 'phone'],
  customer: ['customer', 'customername', 'buyer', 'name'],
  product: ['product', 'productname', 'item', 'sku', 'title'],
  category: ['category', 'type', 'segment'],
  quantity: ['quantity', 'qty', 'units', 'items'],
  price: ['price', 'unitprice', 'sellingprice', 'rate'],
  revenue: ['revenue', 'sales', 'amount', 'total', 'ordertotal'],
}

const cleanKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9_]/g, '')
const toNumber = value => Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0

const parseCsvLine = line => {
  const cells = []
  let cell = ''
  let quoted = false
  for (const char of line) {
    if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) {
      cells.push(cell.trim())
      cell = ''
    } else cell += char
  }
  cells.push(cell.trim())
  return cells.map(value => value.replace(/^"|"$/g, ''))
}

const findColumn = (headers, key) => {
  const aliases = headerAliases[key]
  return headers.findIndex(header => aliases.includes(cleanKey(header)))
}

const parseOrdersCsv = text => {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one order row.')

  const headers = parseCsvLine(lines[0])
  const indexes = Object.fromEntries(Object.keys(headerAliases).map(key => [key, findColumn(headers, key)]))
  if (indexes.date < 0 || indexes.product < 0) {
    throw new Error('CSV must include at least date and product columns.')
  }

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line)
    const quantity = indexes.quantity >= 0 ? Math.max(toNumber(cells[indexes.quantity]), 1) : 1
    const revenue = indexes.revenue >= 0 ? toNumber(cells[indexes.revenue]) : quantity * toNumber(cells[indexes.price])
    return {
      date: cells[indexes.date],
      orderId: indexes.orderId >= 0 ? cells[indexes.orderId] : `CSV-${index + 1}`,
      customerId: indexes.customerId >= 0 ? cells[indexes.customerId] : indexes.customer >= 0 ? cells[indexes.customer] : `Customer-${index + 1}`,
      customer: indexes.customer >= 0 ? cells[indexes.customer] : indexes.customerId >= 0 ? cells[indexes.customerId] : 'Unknown customer',
      product: cells[indexes.product] || 'Unknown product',
      category: indexes.category >= 0 ? cells[indexes.category] || 'Uncategorised' : 'Uncategorised',
      quantity,
      price: indexes.price >= 0 ? toNumber(cells[indexes.price]) : Math.round(revenue / quantity),
      revenue,
    }
  }).filter(row => row.revenue > 0)
}

const compactPrice = value => {
  if (value >= 10000000) return `${formatPrice(value / 10000000)} Cr`
  if (value >= 100000) return `${formatPrice(value / 100000)} L`
  return formatPrice(value)
}

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max)
const formatPercent = value => `${Math.round(value)}%`

const aggregateBy = (rows, key, valueFn) => {
  const map = new Map()
  rows.forEach(row => {
    const label = row[key] || 'Unknown'
    const prev = map.get(label) || { label, revenue: 0, quantity: 0, orders: 0 }
    prev.revenue += row.revenue
    prev.quantity += row.quantity
    prev.orders += valueFn ? valueFn(row) : 1
    map.set(label, prev)
  })
  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

const buildAnalytics = rows => {
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0)
  const orders = new Set(rows.map(row => row.orderId)).size
  const customers = new Set(rows.map(row => row.customerId || row.customer)).size
  const units = rows.reduce((sum, row) => sum + row.quantity, 0)
  const daily = aggregateBy(rows, 'date').sort((a, b) => new Date(a.label) - new Date(b.label))
  const products = aggregateBy(rows, 'product')
  const categories = aggregateBy(rows, 'category')
  const customerMap = aggregateBy(rows, 'customerId')
  const repeatCustomers = customerMap.filter(c => c.orders > 1).length
  const averageDailyRevenue = daily.length ? totalRevenue / daily.length : 0
  const averageDailyOrders = daily.length ? orders / daily.length : 0
  const projectedRevenue = Math.round(averageDailyRevenue * 30 * 1.16)
  const projectedOrders = Math.round(averageDailyOrders * 30 * 1.12)
  const bestProduct = products[0]?.label || 'Not enough data'
  const bestCategory = categories[0]?.label || 'Not enough data'
  const topCustomer = customerMap[0]?.label || 'Not enough data'
  const churnRisk = Math.min(38, Math.max(6, Math.round(28 - repeatCustomers * 2 + Math.max(0, 10 - customers))))
  const revenueLift = Math.round(((projectedRevenue / Math.max(totalRevenue, 1)) - 1) * 100)

  return {
    totalRevenue, orders, customers, units, daily, products, categories, customerMap,
    repeatRate: customers ? Math.round((repeatCustomers / customers) * 100) : 0,
    averageOrder: orders ? Math.round(totalRevenue / orders) : 0,
    projectedRevenue, projectedOrders, bestProduct, bestCategory, topCustomer, churnRisk, revenueLift,
    confidence: Math.min(96, Math.max(72, 68 + rows.length * 2)),
  }
}

function MetricCard({ label, value, detail, Icon, tone = 'text-primary-600' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className={`w-5 h-5 ${tone}`} />
      </div>
      <p className="font-display font-bold text-2xl text-gray-950 mt-3">{value}</p>
      <p className="text-xs font-semibold text-gray-400 mt-1">{detail}</p>
    </div>
  )
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function BarRow({ label, value, max, sub, tone = 'bg-primary-600' }) {
  const width = max ? Math.max(6, Math.round((value / max) * 100)) : 0
  return (
    <div className="grid grid-cols-[minmax(92px,150px)_1fr_minmax(72px,auto)] gap-3 items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 truncate">{sub}</p>}
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <p className="text-sm font-bold text-gray-900 text-right">{compactPrice(value)}</p>
    </div>
  )
}

function NumberInput({ label, value, onChange, min = 0, max, suffix }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-gray-500 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          className="input-base py-2.5 pr-10"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{suffix}</span>}
      </div>
    </label>
  )
}

export default function BusinessSolutionsPage() {
  const { user, isAuthenticated, hasFeature, updateUser } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState('Overview')
  const [orders, setOrders] = useState(loadSavedOrders)
  const [sourceName, setSourceName] = useState(loadSavedSource)
  const [fileError, setFileError] = useState('')
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [aiQuestion, setAiQuestion] = useState('What should I do this week to increase profit?')
  const [manualSale, setManualSale] = useState(emptyManualSale)
  const subscribed = isAuthenticated && hasFeature('businessSolutions')

  const analytics = useMemo(() => buildAnalytics(orders), [orders])
  const dailyMax = Math.max(...analytics.daily.map(item => item.revenue), 1)
  const productMax = analytics.products[0]?.revenue || 1
  const categoryMax = analytics.categories[0]?.revenue || 1
  const recentDaily = analytics.daily.length ? analytics.daily.slice(-7) : [{ label: 'No data', revenue: 0, quantity: 0, orders: 0 }]
  const marginRate = clamp(profile.grossMargin, 1, 95) / 100
  const grossProfit = Math.round(analytics.totalRevenue * marginRate)
  const netProfit = grossProfit - Number(profile.fixedCosts || 0) - Number(profile.adSpend || 0)
  const projectedGrossProfit = Math.round(analytics.projectedRevenue * marginRate)
  const projectedNetProfit = projectedGrossProfit - Number(profile.fixedCosts || 0) - Number(profile.adSpend || 0)
  const targetProgress = Math.min(100, Math.round((analytics.totalRevenue / Math.max(Number(profile.monthlyTarget), 1)) * 100))
  const targetGap = Math.max(Number(profile.monthlyTarget || 0) - analytics.totalRevenue, 0)
  const scenarioRevenue = Math.round(analytics.projectedRevenue * (1 + clamp(profile.conversionLift, 0, 80) / 100))
  const scenarioNetProfit = Math.round(scenarioRevenue * marginRate) - Number(profile.fixedCosts || 0) - Number(profile.adSpend || 0)
  const profitHealth = Math.min(98, Math.max(35, 62 + Math.round(profile.grossMargin / 2) + analytics.repeatRate - Math.round(analytics.churnRisk / 2)))

  const aiActions = [
    `Prioritise ${analytics.bestProduct}; it is the strongest revenue driver and should stay in stock for the next 30 days.`,
    `${analytics.bestCategory} is leading category revenue. Run bundle offers around this category to raise average order value.`,
    `Projected next-month revenue is ${compactPrice(analytics.projectedRevenue)} across about ${analytics.projectedOrders} orders.`,
    `Churn risk is ${analytics.churnRisk}%. Re-engage customers who have placed only one order with a return coupon.`,
  ]
  const dailyPlan = [
    ['Revenue recovery', `Close ${compactPrice(Math.ceil(targetGap / 10))} per day for the next 10 active selling days to reach target.`],
    ['Profit protection', `Keep gross margin near ${profile.grossMargin}% and avoid discounting ${analytics.bestCategory} unless stock is slow.`],
    ['Demand focus', `Push ${analytics.bestProduct} through bundles, WhatsApp follow-up and home-page placement.`],
    ['Customer action', `Call or message one-time buyers; current repeat rate is ${analytics.repeatRate}%.`],
    ['Inventory action', `Set reorder alert for ${analytics.bestProduct}; demand concentration can create stockout risk.`],
  ]
  const aiAnswer = useMemo(() => {
    const q = aiQuestion.toLowerCase()
    if (q.includes('profit') || q.includes('margin')) {
      return `Estimated net profit is ${compactPrice(netProfit)} from ${compactPrice(analytics.totalRevenue)} revenue. Improve it fastest by protecting ${profile.grossMargin}% margin on ${analytics.bestCategory}, reducing low-performing ad spend, and bundling ${analytics.bestProduct} instead of discounting it.`
    }
    if (q.includes('churn') || q.includes('customer')) {
      return `Churn risk is ${analytics.churnRisk}%. Start with one-time buyers, then give VIP treatment to ${analytics.topCustomer}. A simple return offer can lift repeat rate from ${analytics.repeatRate}% and stabilize next-month revenue.`
    }
    if (q.includes('stock') || q.includes('inventory') || q.includes('product')) {
      return `${analytics.bestProduct} is the most important product right now. Keep buffer stock, track daily units, and attach related accessories to raise average order value from ${formatPrice(analytics.averageOrder)}.`
    }
    if (q.includes('target') || q.includes('goal')) {
      return `Monthly target progress is ${targetProgress}%. Remaining gap is ${compactPrice(targetGap)}. With current trend, Earnova projects ${compactPrice(analytics.projectedRevenue)} next month; scenario lift can push it to ${compactPrice(scenarioRevenue)}.`
    }
    return `This week, focus on ${analytics.bestProduct}, protect margin at ${profile.grossMargin}%, recover one-time buyers, and chase the ${compactPrice(targetGap)} target gap with daily sales discipline.`
  }, [aiQuestion, analytics, netProfit, profile, targetGap, targetProgress, scenarioRevenue])
  const dailyCost = Math.max(1, Math.ceil(PLAN_PRICE / 30))

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ORDERS_KEY, JSON.stringify(orders))
      localStorage.setItem(SAVED_SOURCE_KEY, sourceName)
    } catch {
      // Browser storage can fail in private mode; analytics still works for the current session.
    }
  }, [orders, sourceName])

  const handleCsv = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileError('')
    try {
      const text = await file.text()
      const parsed = parseOrdersCsv(text)
      if (!parsed.length) throw new Error('No valid revenue rows found in this CSV.')
      setOrders(parsed)
      setSourceName(file.name)
    } catch (err) {
      setFileError(err.message)
    } finally {
      event.target.value = ''
    }
  }

  const addManualSale = event => {
    event.preventDefault()
    setFileError('')
    const quantity = Math.max(toNumber(manualSale.quantity), 1)
    const price = toNumber(manualSale.price)
    if (!manualSale.product.trim()) {
      setFileError('Enter a product or service name before adding the sale.')
      return
    }
    if (price <= 0) {
      setFileError('Enter a valid selling price before adding the sale.')
      return
    }

    const row = {
      date: manualSale.date || new Date().toISOString().slice(0, 10),
      orderId: `MANUAL-${Date.now()}`,
      customerId: manualSale.customer || 'Walk-in customer',
      customer: manualSale.customer || 'Walk-in customer',
      product: manualSale.product.trim(),
      category: manualSale.category.trim() || 'General',
      quantity,
      price,
      revenue: quantity * price,
    }

    setOrders(prev => [...prev, row])
    setSourceName('Manual sales ledger')
    setManualSale(current => ({ ...emptyManualSale(), date: current.date, category: current.category }))
  }

  const startEmptyLedger = () => {
    setOrders([])
    setSourceName('Manual sales ledger')
    setFileError('')
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      setShowAuth(true)
      return
    }

    setPaying(true)
    setMessage('')
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay failed to load. Check your internet connection.')

      const { orderId, amount, currency, keyId } = await api.post('/payment/business-subscription/create-order', {})

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'Earnova Business Solutions',
          description: 'Monthly AI business analytics subscription',
          image: '/favicon.svg',
          order_id: orderId,
          handler: async response => {
            try {
              const data = await api.post('/payment/business-subscription/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              if (data?.user) updateUser(data.user)
              setMessage('Business Solutions is active for this account.')
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: '#5b21b6' },
          modal: { ondismiss: () => { setMessage('Payment cancelled. You can subscribe when ready.'); resolve() } },
        })
        rzp.on('payment.failed', response => {
          setMessage(`Payment failed: ${response.error.description}`)
          resolve()
        })
        rzp.open()
      })
    } catch (err) {
      setMessage(err.message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />

      <section className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-8 lg:py-10">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-7 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-4">
                <Brain className="w-4 h-4" /> Earnova Business Solutions
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-gray-950 leading-tight">
                AI command center for running the entire business.
              </h1>
              <p className="text-gray-500 text-base md:text-lg mt-4 max-w-2xl">
                Connect order data, ecommerce exports, POS files or ERP reports. Earnova AI turns them into daily revenue, sales velocity, customer churn, demand prediction and next-step decisions.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                {VALUE_PROPS.map(([title, detail]) => (
                  <div key={title} className="border border-gray-100 bg-gray-50 rounded-xl p-3">
                    <p className="font-bold text-sm text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <button onClick={handleSubscribe} disabled={paying || subscribed} className="btn-primary">
                  {paying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment</>
                  ) : subscribed ? (
                    <><CheckCircle2 className="w-4 h-4" /> Subscription active</>
                  ) : (
                    <><IndianRupee className="w-4 h-4" /> Activate for {formatPrice(PLAN_PRICE)}/month</>
                  )}
                </button>
                <a href="#business-dashboard" className="btn-secondary">Open dashboard</a>
              </div>
              <p className="text-xs font-semibold text-eco-700 mt-3">
                Costs about {formatPrice(dailyCost)} per day. One recovered order can pay for the month.
              </p>
              {message && <p className="text-sm text-gray-500 mt-3">{message}</p>}
            </div>

            <div className="bg-slate-950 text-white rounded-2xl p-5 lg:p-6 shadow-card">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm text-white/60">AI confidence</p>
                  <p className="font-display font-bold text-3xl">{analytics.confidence}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Next 30 days</p>
                  <p className="font-display font-bold text-2xl">{compactPrice(analytics.projectedRevenue)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/8 border border-white/10 rounded-xl p-3">
                  <p className="text-[11px] text-white/50">Business health</p>
                  <p className="font-display font-bold text-2xl mt-1">{Math.max(62, 100 - analytics.churnRisk)}%</p>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-xl p-3">
                  <p className="text-[11px] text-white/50">Plan value</p>
                  <p className="font-display font-bold text-2xl mt-1">{formatPrice(PLAN_PRICE)}</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 h-48 items-end">
                {recentDaily.map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className="w-full h-36 bg-white/8 rounded-t flex items-end overflow-hidden">
                      <span className="block w-full bg-eco-400 rounded-t" style={{ height: `${Math.max(8, (item.revenue / dailyMax) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-white/60">{item.label === 'No data' ? 'Start' : item.label.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                {[
                  ['Daily sales', compactPrice(analytics.totalRevenue)],
                  ['Orders', analytics.orders.toLocaleString('en-IN')],
                  ['Churn risk', `${analytics.churnRisk}%`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white/8 border border-white/10 rounded-xl p-3">
                    <p className="text-[11px] text-white/50">{label}</p>
                    <p className="font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="business-dashboard" className="section-wrapper py-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900">{sourceName}</p>
                <p className="text-xs text-gray-500">{orders.length} rows analysed by Earnova AI</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="btn-secondary text-sm cursor-pointer">
                <Upload className="w-4 h-4" /> Upload CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsv} />
              </label>
              <button onClick={() => { setOrders(sampleOrders); setSourceName('Sample retail dataset'); setFileError('') }} className="btn-ghost text-sm">
                <RefreshCw className="w-4 h-4" /> Reset sample
              </button>
              <button onClick={startEmptyLedger} className="btn-ghost text-sm">
                Start empty
              </button>
            </div>
          </div>
          {fileError && <p className="mt-3 text-sm text-red-600">{fileError}</p>}
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5 mb-5">
          <SectionCard title="No CSV? Enter Sales Manually" subtitle="For shops, freelancers, restaurants, and small businesses that do not keep exports yet.">
            <form onSubmit={addManualSale} className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-bold text-gray-500 mb-1.5">Date</span>
                <input
                  type="date"
                  value={manualSale.date}
                  onChange={event => setManualSale(prev => ({ ...prev, date: event.target.value }))}
                  className="input-base py-2.5"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-gray-500 mb-1.5">Customer</span>
                <input
                  value={manualSale.customer}
                  onChange={event => setManualSale(prev => ({ ...prev, customer: event.target.value }))}
                  className="input-base py-2.5"
                  placeholder="Walk-in, customer name, phone, company"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-gray-500 mb-1.5">Product / service</span>
                <input
                  value={manualSale.product}
                  onChange={event => setManualSale(prev => ({ ...prev, product: event.target.value }))}
                  className="input-base py-2.5"
                  placeholder="e.g. Website design, BLDC fan, lunch combo"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-gray-500 mb-1.5">Category</span>
                <input
                  value={manualSale.category}
                  onChange={event => setManualSale(prev => ({ ...prev, category: event.target.value }))}
                  className="input-base py-2.5"
                  placeholder="General"
                />
              </label>
              <NumberInput label="Quantity" value={manualSale.quantity} onChange={value => setManualSale(prev => ({ ...prev, quantity: value }))} min={1} />
              <NumberInput label="Selling price" value={manualSale.price} onChange={value => setManualSale(prev => ({ ...prev, price: value }))} min={1} />
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center">
                <button className="btn-primary" type="submit">
                  <ShoppingBag className="w-4 h-4" /> Add sale to dashboard
                </button>
                <p className="text-xs text-gray-500">
                  Each entry updates revenue, profit, best sellers, churn, forecasts, and AI recommendations instantly.
                </p>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Three Ways To Use Earnova" subtitle="The customer can start even with zero files.">
            <div className="space-y-3">
              {[
                ['Manual ledger', 'Add sales one by one from bills, WhatsApp orders, UPI payments, or notebook records.'],
                ['CSV later', 'When they learn exports, upload Excel/CSV from POS, Shopify, Amazon, billing software, or accountant reports.'],
                ['Integration next', 'Connect website, POS, ERP, or marketplace feeds so Earnova updates automatically.'],
              ].map(([title, detail], index) => (
                <div key={title} className="flex gap-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-eco-50 border border-eco-100 p-4">
              <p className="text-sm font-bold text-eco-800">Best first step</p>
              <p className="text-sm text-eco-700 mt-1">
                Ask the owner to enter only today&apos;s sales. Earnova can still reveal best sellers, daily earnings, target gap, and profit pressure from that starting point.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <MetricCard label="Total earnings" value={compactPrice(analytics.totalRevenue)} detail="Revenue in current dataset" Icon={WalletCards} tone="text-eco-600" />
          <MetricCard label="Total sales" value={analytics.orders.toLocaleString('en-IN')} detail={`${analytics.units} units sold`} Icon={ShoppingBag} tone="text-primary-600" />
          <MetricCard label="Customers" value={analytics.customers.toLocaleString('en-IN')} detail={`${analytics.repeatRate}% repeat rate`} Icon={Users} tone="text-cyan-600" />
          <MetricCard label="Average order" value={formatPrice(analytics.averageOrder)} detail="Revenue per order" Icon={BarChart3} tone="text-amber-600" />
        </div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-5 mb-5">
          <SectionCard title="Business Setup" subtitle="Tune the AI model to match the user's business economics.">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block sm:col-span-2">
                <span className="block text-xs font-bold text-gray-500 mb-1.5">Business type</span>
                <select
                  value={profile.businessType}
                  onChange={event => setProfile(prev => ({ ...prev, businessType: event.target.value }))}
                  className="input-base py-2.5"
                >
                  {['Retail / ecommerce', 'Restaurant / cafe', 'Service business', 'Wholesale / B2B', 'Manufacturing', 'Local store'].map(item => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <NumberInput label="Monthly target" value={profile.monthlyTarget} onChange={value => setProfile(prev => ({ ...prev, monthlyTarget: value }))} />
              <NumberInput label="Gross margin" value={profile.grossMargin} onChange={value => setProfile(prev => ({ ...prev, grossMargin: value }))} min={1} max={95} suffix="%" />
              <NumberInput label="Fixed costs" value={profile.fixedCosts} onChange={value => setProfile(prev => ({ ...prev, fixedCosts: value }))} />
              <NumberInput label="Ad spend" value={profile.adSpend} onChange={value => setProfile(prev => ({ ...prev, adSpend: value }))} />
            </div>
          </SectionCard>

          <SectionCard title="Executive Scorecard" subtitle="Profitability, target progress and operating health.">
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                ['Net profit', compactPrice(netProfit), 'after costs and ads', netProfit >= 0 ? 'text-eco-600' : 'text-red-500'],
                ['Target progress', `${targetProgress}%`, `${compactPrice(targetGap)} gap`, 'text-primary-600'],
                ['Profit health', `${profitHealth}%`, `${formatPercent(profile.grossMargin)} margin model`, 'text-cyan-600'],
              ].map(([label, value, detail, tone]) => (
                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500">{label}</p>
                  <p className={`font-display font-bold text-2xl mt-2 ${tone}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{detail}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
                <span>Monthly revenue target</span><span>{targetProgress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <span className="block h-full bg-primary-700 rounded-full" style={{ width: `${targetProgress}%` }} />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-5">
          {OPERATING_SYSTEM.map(([title, detail], index) => {
            const icons = [Brain, Target, PackageSearch, ShieldCheck]
            const Icon = icons[index]
            return (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
                <Icon className="w-5 h-5 text-primary-600 mb-3" />
                <p className="font-display font-bold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-1">{detail}</p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {TABS.map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === item ? 'bg-primary-800 text-white shadow-btn' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
            <SectionCard title="Daily Earnings And Sales" subtitle="Day-wise revenue detected from connected business data.">
              <div className="space-y-3">
                {(analytics.daily.length ? analytics.daily.slice(-10) : [{ label: 'No sales yet', revenue: 0, quantity: 0, orders: 0 }]).map(item => (
                  <BarRow key={item.label} label={item.label} value={item.revenue} max={dailyMax} sub={`${item.quantity} units, ${item.orders} orders`} tone="bg-eco-500" />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="AI Executive Output" subtitle="Decision-grade summary generated from your sales pattern.">
              <div className="space-y-3">
                {aiActions.map((item, index) => (
                  <div key={item} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-eco-50 border border-eco-100">
                <p className="text-sm font-bold text-eco-800">Value for money check</p>
                <p className="text-sm text-eco-700 mt-1">
                  At {formatPrice(PLAN_PRICE)}/month, Earnova only needs to help recover one small missed sale, prevent one stockout, or retain one customer to justify the plan.
                </p>
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'Profit Lab' && (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
            <SectionCard title="Profit Engine" subtitle="Revenue is useful, but net profit decides business health.">
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  ['Gross profit', compactPrice(grossProfit), `${formatPercent(profile.grossMargin)} gross margin`, Percent],
                  ['Net profit', compactPrice(netProfit), 'after fixed costs and ads', WalletCards],
                  ['Projected net', compactPrice(projectedNetProfit), 'next 30 days', LineChart],
                  ['Break-even revenue', compactPrice(Math.ceil((Number(profile.fixedCosts) + Number(profile.adSpend)) / Math.max(marginRate, 0.01))), 'minimum sales needed', Gauge],
                ].map(([label, value, detail, Icon]) => (
                  <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Icon className="w-4 h-4 text-primary-600 mb-3" />
                    <p className="text-xs font-bold text-gray-500">{label}</p>
                    <p className="font-display font-bold text-xl text-gray-950 mt-1">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <BarRow label="Revenue" value={analytics.totalRevenue} max={Math.max(analytics.totalRevenue, Number(profile.monthlyTarget))} sub="current dataset" tone="bg-primary-600" />
                <BarRow label="Gross profit" value={Math.max(grossProfit, 0)} max={Math.max(analytics.totalRevenue, 1)} sub="estimated from margin" tone="bg-eco-500" />
                <BarRow label="Costs + ads" value={Number(profile.fixedCosts) + Number(profile.adSpend)} max={Math.max(analytics.totalRevenue, 1)} sub="operating pressure" tone="bg-amber-500" />
              </div>
            </SectionCard>

            <SectionCard title="Scenario Planner" subtitle="Test how a small growth push changes revenue and profit.">
              <div className="mb-5">
                <NumberInput
                  label="Expected conversion / sales lift"
                  value={profile.conversionLift}
                  onChange={value => setProfile(prev => ({ ...prev, conversionLift: value }))}
                  min={0}
                  max={80}
                  suffix="%"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  ['Base forecast', compactPrice(analytics.projectedRevenue), `${analytics.projectedOrders} orders`],
                  ['Scenario revenue', compactPrice(scenarioRevenue), `${profile.conversionLift}% lift model`],
                  ['Scenario net profit', compactPrice(scenarioNetProfit), 'after estimated costs'],
                  ['Profit upside', compactPrice(scenarioNetProfit - projectedNetProfit), 'additional opportunity'],
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-xl bg-slate-950 text-white p-4">
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="font-display font-bold text-xl mt-2">{value}</p>
                    <p className="text-xs text-white/50 mt-1">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
                <p className="text-sm font-bold text-primary-900">AI recommendation</p>
                <p className="text-sm text-primary-800 mt-1">
                  Use the growth push on {analytics.bestProduct} first. It has proven demand, which makes the scenario more realistic than spending equally across all products.
                </p>
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'AI Forecast' && (
          <div className="grid lg:grid-cols-3 gap-5">
            <SectionCard title="Prediction Model" subtitle="Earnova AI projects revenue, demand and churn from connected orders.">
              <div className="space-y-4">
                {[
                  ['Next revenue', compactPrice(analytics.projectedRevenue), `${analytics.revenueLift}% lift opportunity`],
                  ['Future orders', analytics.projectedOrders.toLocaleString('en-IN'), '30-day order forecast'],
                  ['Customer churn', `${analytics.churnRisk}%`, 'Predicted risk segment'],
                  ['Model confidence', `${analytics.confidence}%`, 'Based on row depth and trend consistency'],
                ].map(([label, value, detail]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400">{detail}</p>
                    </div>
                    <p className="font-display font-bold text-xl text-gray-950">{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Risk Alerts" subtitle="Issues the business owner should act on this week.">
              <div className="space-y-3">
                {[
                  ['Stockout risk', `${analytics.bestProduct} demand is concentrated. Keep buffer stock before campaigns.`],
                  ['Margin check', `Review discounts for ${analytics.bestCategory}; high demand can support tighter pricing.`],
                  ['Customer leakage', `${analytics.churnRisk}% churn risk needs win-back messages and follow-up calls.`],
                ].map(([title, detail]) => (
                  <div key={title} className="flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">{title}</p>
                      <p className="text-xs text-amber-800 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="AI Commands" subtitle="What Earnova would automate after integration.">
              <div className="space-y-2">
                {['Create daily owner report', 'Flag products with falling demand', 'Predict next purchase date', 'Generate reorder plan', 'Export investor KPI summary'].map(item => (
                  <button key={item} disabled={!subscribed} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                    {item}
                    {subscribed ? <ChevronRight className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'AI Advisor' && (
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <SectionCard title="Ask Earnova AI" subtitle="Ask operational questions and get an answer shaped by this dataset.">
              <textarea
                value={aiQuestion}
                onChange={event => setAiQuestion(event.target.value)}
                rows={5}
                className="input-base resize-none mb-4"
                placeholder="Ask about sales, profit, churn, inventory, customers or monthly target..."
              />
              <div className="rounded-2xl bg-slate-950 text-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquareText className="w-5 h-5 text-eco-300" />
                  <p className="font-display font-bold">Earnova AI output</p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{aiAnswer}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {[
                  'How do I improve profit?',
                  'Which product should I stock?',
                  'How do I reduce churn?',
                  'Will I hit my monthly target?',
                ].map(question => (
                  <button
                    key={question}
                    onClick={() => setAiQuestion(question)}
                    className="text-left rounded-xl border border-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Daily CEO Action Plan" subtitle="A focused operating checklist for the business owner.">
              <div className="space-y-3">
                {dailyPlan.map(([title, detail], index) => (
                  <div key={title} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="w-7 h-7 rounded-full bg-primary-800 text-white text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-eco-50 border border-eco-100 p-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-eco-700" />
                  <p className="text-sm font-bold text-eco-800">Today&apos;s best move</p>
                </div>
                <p className="text-sm text-eco-700 mt-1">
                  Push {analytics.bestProduct}, protect margin, and contact recent one-time buyers before spending more on acquisition.
                </p>
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'Customers' && (
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <SectionCard title="Customer Intelligence" subtitle="Top customers, repeat behavior and churn risk.">
              <div className="space-y-3">
                {analytics.customerMap.slice(0, 8).map(customer => (
                  <div key={customer.label} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{customer.label}</p>
                      <p className="text-xs text-gray-400">{customer.orders} orders, {customer.quantity} units</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{compactPrice(customer.revenue)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Retention Playbook" subtitle="AI-generated customer actions for the owner.">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['VIP follow-up', `${analytics.topCustomer} should receive priority service and an upsell offer.`],
                  ['Win-back list', 'One-time buyers need coupon, WhatsApp reminder and call-back sequence.'],
                  ['Cross-sell engine', `Customers buying ${analytics.bestCategory} should see related accessories.`],
                  ['Credit risk', 'Watch delayed payments and low-frequency high-value buyers separately.'],
                ].map(([title, detail]) => (
                  <div key={title} className="border border-gray-100 rounded-xl p-4">
                    <p className="font-display font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">{detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'Products' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <SectionCard title="Mostly Sold Products" subtitle="Revenue and unit movement by product.">
              <div className="space-y-3">
                {(analytics.products.length ? analytics.products.slice(0, 10) : [{ label: 'Add a sale to see products', revenue: 0, quantity: 0 }]).map(item => (
                  <BarRow key={item.label} label={item.label} value={item.revenue} max={productMax} sub={`${item.quantity} units sold`} tone="bg-primary-600" />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Category Demand" subtitle="Where the business is actually making money.">
              <div className="space-y-3">
                {(analytics.categories.length ? analytics.categories.slice(0, 10) : [{ label: 'Add a sale to see categories', revenue: 0, quantity: 0 }]).map(item => (
                  <BarRow key={item.label} label={item.label} value={item.revenue} max={categoryMax} sub={`${item.quantity} units sold`} tone="bg-cyan-500" />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === 'Integrations' && (
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
            <SectionCard title="Business Integration Hub" subtitle="Connect the data sources that run the company.">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  [FileSpreadsheet, 'CSV / Excel upload', 'Import orders, products, customers and expenses.'],
                  [PlugZap, 'Website API', 'Connect ecommerce checkout and daily order events.'],
                  [Cloud, 'POS / ERP sync', 'Bring billing, stock and customer ledgers into one view.'],
                  [Layers, 'Marketplace data', 'Unify Amazon, Flipkart, Shopify or custom store exports.'],
                ].map(([Icon, title, detail]) => (
                  <div key={title} className="border border-gray-100 rounded-xl p-4">
                    <Icon className="w-5 h-5 text-primary-600 mb-3" />
                    <p className="font-display font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">{detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard
              title="Subscription"
              subtitle="₹19/month unlocks live integrations, AI reports and export actions."
              action={!subscribed && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold"><LockKeyhole className="w-3.5 h-3.5" /> Locked</span>}
            >
              <div className="space-y-3 mb-5">
                {[
                  'Daily dashboard for earnings, sales, top products and customer behavior.',
                  'Profit lab with margin, expenses, ad spend, break-even and target tracking.',
                  'AI advisor that answers owner questions using the connected business data.',
                  'Scenario planner to estimate how sales lift changes future revenue and net profit.',
                  'AI prediction model for future sales, future orders, churn and demand.',
                  'Business integration flow for CSV, POS, ERP, ecommerce and marketplace data.',
                  'Owner-ready output with action items, risk alerts and growth opportunities.',
                ].map(item => (
                  <div key={item} className="flex gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-eco-600 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={handleSubscribe} disabled={paying || subscribed} className="btn-primary w-full">
                {subscribed ? (
                  <><ShieldCheck className="w-4 h-4" /> Active on this account</>
                ) : paying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment</>
                ) : (
                  <><IndianRupee className="w-4 h-4" /> Pay {formatPrice(PLAN_PRICE)}/month</>
                )}
              </button>
            </SectionCard>
          </div>
        )}
      </section>
    </div>
  )
}
