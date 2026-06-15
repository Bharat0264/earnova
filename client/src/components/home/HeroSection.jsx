import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'

const PARTNERS = ['Havells', 'Prestige']

const METRICS = [
  { label: 'Active products', value: '680+' },
  { label: 'Mission year', value: '2030' },
  { label: 'Member income', value: 'Wallet ready' },
]

const CATALOG = [
  { name: 'Solar Rooftop', detail: 'Pay on delivery enabled', Icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { name: 'Efficient Fans', detail: 'Low power consumption', Icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Home Appliances', detail: 'Partner brand catalog', Icon: PackageCheck, color: 'text-eco-600', bg: 'bg-eco-50' },
]

function CatalogPanel() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="rounded-3xl bg-white border border-gray-100 shadow-card-hover overflow-hidden">
        <div className="bg-gray-950 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/earnova-logo-cropped.png" alt="Earnova" className="h-8 w-auto bg-white rounded-md px-1.5 py-1" />
            <div>
              <p className="text-white text-sm font-bold">Earnova Storefront</p>
              <p className="text-gray-400 text-xs">Renewable commerce dashboard</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-eco-200 bg-eco-500/15 border border-eco-400/20 px-2.5 py-1 rounded-full">
            Live
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map(metric => (
              <div key={metric.label} className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3">
                <p className="text-gray-950 font-display font-extrabold text-lg leading-tight">{metric.value}</p>
                <p className="text-gray-500 text-[11px] leading-tight mt-1">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {CATALOG.map(({ name, detail, Icon, color, bg }) => (
              <div key={name} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-950 text-sm">{name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{detail}</p>
                </div>
                <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-3/4 bg-eco-500" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-eco-50 border border-eco-100 p-4 flex items-start gap-3">
            <Leaf className="w-5 h-5 text-eco-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-eco-900">Mission 2030 Green India</p>
              <p className="text-xs text-eco-700 mt-1 leading-relaxed">
                Make clean energy products easier to discover, buy, track, and earn from.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbf8] border-b border-gray-100">
      <div className="absolute inset-0 bg-dots opacity-[0.28] pointer-events-none" />

      <div className="relative section-wrapper py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 xl:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-eco-100 text-eco-800 text-xs font-bold px-3 py-1.5 rounded-full mb-5 shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5" />
              Partner brands: {PARTNERS.join(' + ')}
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-[3.6rem] text-gray-950 leading-[1.05] mb-5">
              Clean energy products for modern India.
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Shop verified solar and efficient home products, earn member income on eligible orders, and support Mission 2030 Green India from one simple storefront.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <Link to="/products" className="btn-primary flex items-center gap-2 text-base">
                Shop Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/subsidy" className="btn-secondary text-base flex items-center gap-2">
                Solar Support
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0">
              {[
                { Icon: ShieldCheck, label: 'Secure checkout' },
                { Icon: TrendingUp, label: 'Member earnings' },
                { Icon: Building2, label: 'Bulk quotes' },
                { Icon: Leaf, label: 'Green mission' },
              ].map(({ Icon, label }) => (
                <div key={label} className="rounded-2xl bg-white border border-gray-100 p-3 text-left shadow-sm">
                  <Icon className="w-4 h-4 text-primary-700 mb-2" />
                  <p className="text-xs font-bold text-gray-700 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <CatalogPanel />
        </div>
      </div>
    </section>
  )
}
