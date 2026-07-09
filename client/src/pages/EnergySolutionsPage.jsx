import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BatteryCharging, Home, ShieldCheck, SlidersHorizontal, SunMedium, Wrench } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '../components/products/ProductCard'
import { useProducts } from '../hooks/useProducts'

const SOLAR_GROUPS = [
  { label: 'Solar panels', detail: 'Mono PERC, bifacial, rooftop and commercial modules' },
  { label: 'Hybrid inverters', detail: 'Grid, battery and solar priority switching' },
  { label: 'Solar batteries', detail: 'Deep-cycle tubular storage for daily backup' },
  { label: 'Mounting kits', detail: 'RCC rooftop frames, rails, clamps and fasteners' },
  { label: 'Charge controllers', detail: 'MPPT controllers for efficient energy harvest' },
  { label: 'Installation support', detail: 'Site survey, sizing, subsidy guidance and delivery' },
]

const SOLUTION_STEPS = [
  ['01', 'Survey', 'Roof area, sanctioned load, bill history and backup need are captured.'],
  ['02', 'Design', 'Earnova sizes panels, inverter, battery and structure as one system.'],
  ['03', 'Install', 'Products, delivery, installation partner and subsidy documents are coordinated.'],
]
const SOLAR_TERMS = ['solar', 'rooftop', 'mppt', 'charge controller', 'mounting structure', 'hybrid inverter']

const isSolarRelated = (product = {}) => {
  if (product.category === 'solar-panels') return true
  const text = [
    product.name,
    product.slug,
    product.brand,
    product.shortDesc,
    product.description,
    product.energySaving,
    ...(product.highlights || []),
  ].filter(Boolean).join(' ').toLowerCase()
  return SOLAR_TERMS.some(term => text.includes(term))
}

export default function EnergySolutionsPage() {
  const { products, loading } = useProducts({ limit: 'all', sort: 'newest' })
  const solarProducts = useMemo(() => products.filter(isSolarRelated), [products])

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-10 lg:py-14">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold mb-4">
                <SunMedium className="w-4 h-4" /> Earnova Energy Solutions
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-gray-950 leading-tight">
                Solar products, system design and installation support in one place.
              </h1>
              <p className="text-gray-500 text-base md:text-lg mt-4 max-w-2xl">
                Shop solar panels and complete rooftop components separately from the regular Earnova ecommerce store.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <a href="#solar-products" className="btn-primary">
                  View solar products <ArrowRight className="w-4 h-4" />
                </a>
                <Link to="/subsidy" className="btn-secondary">
                  Check subsidy
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl p-5 lg:p-6 shadow-card">
              <div className="grid grid-cols-2 gap-3">
                {[
                  [Home, 'Residential', '1-10 kW rooftop systems'],
                  [BatteryCharging, 'Backup', 'Hybrid inverter + battery'],
                  [Wrench, 'Install', 'Survey to commissioning'],
                  [ShieldCheck, 'Warranty', 'Panel and service support'],
                ].map(([Icon, title, desc]) => (
                  <div key={title} className="bg-white/8 border border-white/10 rounded-xl p-4">
                    <Icon className="w-5 h-5 text-yellow-300 mb-3" />
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-white/60 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOLAR_GROUPS.map(item => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
              <p className="font-display font-bold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="solar-products" className="section-wrapper pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="section-title text-2xl md:text-3xl">Solar Catalog</h2>
            <p className="text-gray-500 text-sm mt-1">
              Solar items have been moved here from the main ecommerce shop.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            {loading ? 'Loading products' : `${solarProducts.length} solar products`}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : solarProducts.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {solarProducts.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-card">
            <SunMedium className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-gray-900">No solar products available</h3>
            <p className="text-sm text-gray-500 mt-1">Add solar inventory from the admin product panel.</p>
          </div>
        )}
      </section>

      <section className="bg-white border-t border-gray-100">
        <div className="section-wrapper py-10">
          <div className="grid md:grid-cols-3 gap-4">
            {SOLUTION_STEPS.map(([n, title, desc]) => (
              <div key={n} className="border border-gray-100 rounded-2xl p-5">
                <span className="text-xs font-bold text-yellow-600">{n}</span>
                <h3 className="font-display font-bold text-gray-900 mt-2">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
