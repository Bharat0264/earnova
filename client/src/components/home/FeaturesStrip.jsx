import { Shield, Sun, TrendingUp, Package, Truck, Leaf } from 'lucide-react'

const FEATURES = [
  {
    Icon:  Shield,
    title: 'Razorpay Secure',
    desc:  'UPI, cards, net banking & EMI',
    color: 'text-blue-600', bg: 'bg-blue-50',
  },
  {
    Icon:  Sun,
    title: 'Solar Subsidy',
    desc:  'PM Surya Ghar guidance',
    color: 'text-yellow-600', bg: 'bg-yellow-50',
  },
  {
    Icon:  TrendingUp,
    title: 'Referral Earnings',
    desc:  'Earn on every referred sale',
    color: 'text-primary-600', bg: 'bg-primary-50',
  },
  {
    Icon:  Package,
    title: 'Bulk Quotes',
    desc:  'Custom pricing for businesses',
    color: 'text-orange-600', bg: 'bg-orange-50',
  },
  {
    Icon:  Truck,
    title: 'Pan India Delivery',
    desc:  'Free shipping above ₹5,000',
    color: 'text-eco-600', bg: 'bg-eco-50',
  },
  {
    Icon:  Leaf,
    title: 'Green India',
    desc:  'Every purchase plants a tree',
    color: 'text-eco-700', bg: 'bg-eco-50',
  },
]

export default function FeaturesStrip() {
  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="section-wrapper">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
          {FEATURES.map(({ Icon, title, desc, color, bg }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="font-display font-semibold text-gray-800 text-sm leading-tight">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
