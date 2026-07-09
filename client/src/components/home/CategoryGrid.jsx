import { Link } from 'react-router-dom'
import { Sun, Wind, Thermometer, Settings, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    id:       'solar-panels',
    Icon:     Sun,
    label:    'Solar Panels',
    desc:     'Rooftop & off-grid solar solutions',
    count:    '24+ Products',
    cardBg:   'bg-yellow-50  hover:bg-yellow-100/80',
    iconBg:   'bg-yellow-100 group-hover:bg-yellow-200',
    iconColor:'text-yellow-600',
    arrowColor:'text-yellow-600',
    to:       '/energy-solutions',
  },
  {
    id:       'fans',
    Icon:     Wind,
    label:    'Fans',
    desc:     'BLDC energy-saving ceiling fans',
    count:    '18+ Products',
    cardBg:   'bg-primary-50  hover:bg-primary-100/60',
    iconBg:   'bg-primary-100 group-hover:bg-primary-200',
    iconColor:'text-primary-600',
    arrowColor:'text-primary-600',
    to:       '/products?category=fans',
  },
  {
    id:       'acs',
    Icon:     Thermometer,
    label:    'ACs',
    desc:     '5-star inverter air conditioners',
    count:    '12+ Products',
    cardBg:   'bg-cyan-50  hover:bg-cyan-100/70',
    iconBg:   'bg-cyan-100 group-hover:bg-cyan-200',
    iconColor:'text-cyan-600',
    arrowColor:'text-cyan-600',
    to:       '/products?category=acs',
  },
  {
    id:       'accessories',
    Icon:     Settings,
    label:    'Accessories',
    desc:     'Inverters, charge controllers & more',
    count:    '30+ Products',
    cardBg:   'bg-eco-50  hover:bg-eco-100/70',
    iconBg:   'bg-eco-100 group-hover:bg-eco-200',
    iconColor:'text-eco-600',
    arrowColor:'text-eco-600',
    to:       '/products?category=accessories',
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="section-wrapper">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-sub max-w-xl mx-auto">
            Discover our full range of energy-saving products for homes, offices, and businesses.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
          {CATEGORIES.map(({ id, Icon, label, desc, count, cardBg, iconBg, iconColor, arrowColor, to }) => (
            <Link
              key={id}
              to={to}
              className={`group flex flex-col items-center text-center p-5 lg:p-7 rounded-2xl
                          border border-transparent hover:border-gray-100 transition-all duration-300
                          hover:shadow-card-hover hover:-translate-y-1 ${cardBg}`}
            >
              {/* Icon bubble */}
              <div className={`w-14 h-14 lg:w-16 lg:h-16 ${iconBg} rounded-2xl flex items-center justify-center
                               mb-4 transition-all duration-300 group-hover:scale-110`}>
                <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${iconColor}`} />
              </div>

              {/* Text */}
              <h3 className="font-display font-bold text-gray-900 text-base mb-1">{label}</h3>
              <p className="text-gray-500 text-xs leading-snug mb-2 hidden sm:block">{desc}</p>
              <span className={`text-xs font-bold ${iconColor} mb-3`}>{count}</span>

              {/* Arrow */}
              <ArrowRight
                className={`w-4 h-4 ${arrowColor} transition-transform duration-200
                            group-hover:translate-x-1`}
              />
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary-700 font-semibold text-sm
                       hover:underline underline-offset-4"
          >
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
