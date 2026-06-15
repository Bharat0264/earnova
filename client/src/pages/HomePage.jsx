import HeroSection   from '../components/home/HeroSection'
import { ArrowRight, BadgeCheck, Leaf, ShieldCheck, SunMedium, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const BRANDS = [
  {
    name: 'Havells',
    focus: 'Solar, fans, smart energy appliances',
    tone: 'from-red-50 to-white',
    mark: 'H',
  },
  {
    name: 'Prestige',
    focus: 'Efficient home and lifestyle products',
    tone: 'from-blue-50 to-white',
    mark: 'P',
  },
]

function PartnerBrands() {
  return (
    <section className="bg-white py-14 lg:py-20 border-y border-gray-100">
      <div className="section-wrapper">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-eco-50 text-eco-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <BadgeCheck className="w-3.5 h-3.5" />
              Our Partner Brands
            </div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-gray-950">
              Trusted brands powering Earnova
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl">
              We are starting with reliable Indian household names and expanding the renewable-energy catalog with quality-first partners.
            </p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
            Explore Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BRANDS.map(brand => (
            <div
              key={brand.name}
              className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${brand.tone} p-6 lg:p-8 shadow-card`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                  <span className="font-display font-extrabold text-3xl text-gray-900">{brand.mark}</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-gray-950">{brand.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{brand.focus}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {['Verified', 'Warranty', 'Energy Smart'].map(item => (
                  <div key={item} className="rounded-xl bg-white/80 border border-white px-3 py-3">
                    <p className="text-xs font-bold text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Mission2030() {
  const goals = [
    { Icon: SunMedium, label: 'Renewable Energy', value: 'Solar-first homes' },
    { Icon: Zap, label: 'Energy Efficiency', value: 'Lower monthly bills' },
    { Icon: Leaf, label: 'Green India', value: 'Cleaner local impact' },
    { Icon: ShieldCheck, label: 'Trusted Commerce', value: 'Verified brands' },
  ]

  return (
    <section className="bg-gray-950 py-16 lg:py-24 text-white">
      <div className="section-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-eco-200 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Leaf className="w-3.5 h-3.5" />
              Mission 2030 Green India
            </div>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl leading-tight">
              Renewable energy for everyday Indian homes.
            </h2>
            <p className="text-gray-300 mt-5 text-base lg:text-lg leading-relaxed max-w-2xl">
              Earnova's 2030 mission is to make solar adoption, efficient appliances, and clean-energy upgrades easier to discover, buy, and benefit from.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products?category=solar-panels" className="btn-primary inline-flex items-center gap-2">
                Start with Solar <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/subsidy" className="bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                Subsidy Support
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {goals.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/[0.08] border border-white/10 p-5">
                <div className="w-11 h-11 rounded-xl bg-eco-400/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-eco-300" />
                </div>
                <p className="font-display font-bold text-white">{label}</p>
                <p className="text-gray-400 text-sm mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PartnerBrands />
      <Mission2030 />
    </>
  )
}
