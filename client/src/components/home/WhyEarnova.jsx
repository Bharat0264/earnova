import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'

const POINTS = [
  'Curated energy-saving products with BEE star certification',
  'Solar subsidy guidance under PM Surya Ghar Yojana scheme',
  'Earn commissions through our transparent referral program',
  'Custom bulk quotations for businesses, dealers & contractors',
  'Secure Razorpay checkout with EMI options available',
  'Pan India delivery with real-time order tracking dashboard',
]

const MINI_STATS = [
  { value: '15,000+', label: 'Happy Customers'    },
  { value: '₹8,000',  label: 'Avg. Annual Saving' },
  { value: '5,200+',  label: 'Active Referrers'   },
  { value: '98%',     label: 'Satisfaction Rate'  },
]

export default function WhyEarnova() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="section-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Stat card ── */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary-700 to-primary-950
                            rounded-3xl p-8 lg:p-10 text-white overflow-hidden">
              {/* Headline */}
              <div className="text-5xl lg:text-6xl font-display font-extrabold mb-1 tracking-tight">
                ₹2.4 Cr+
              </div>
              <div className="text-primary-300 text-sm font-medium mb-8">
                Referral commissions paid to date
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {MINI_STATS.map(({ value, label }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="font-display font-bold text-2xl text-white">{value}</div>
                    <div className="text-primary-300 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-eco-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl" />
            </div>

            {/* Floating tag below card */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2
                            bg-eco-50 border border-eco-100 text-eco-700
                            text-xs font-bold px-4 py-2 rounded-full shadow-sm whitespace-nowrap">
              🌱 1 product sold = 1 tree planted
            </div>
          </div>

          {/* ── Right: copy ── */}
          <div>
            <div className="inline-flex items-center gap-2 bg-eco-50 text-eco-700
                            text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              Why Choose Earnova
            </div>

            <h2 className="section-title mb-4">
              More Than Just
              <span className="text-gradient block mt-1">an Online Store</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-7">
              Earnova is a complete energy ecosystem — shop premium products,
              earn through referrals, save with solar subsidies, and contribute
              to India's green mission all in one place.
            </p>

            {/* Checklist */}
            <ul className="space-y-3 mb-8">
              {POINTS.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-eco-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>

            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Explore Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
