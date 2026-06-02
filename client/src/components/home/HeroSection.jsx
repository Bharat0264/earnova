import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sun, TrendingUp, Package, Leaf, Zap, Wind } from 'lucide-react'

/* ── Inline SVG product cards ── */
function SolarPanel() {
  return (
    <svg width="148" height="108" viewBox="0 0 148 108" fill="none">
      {/* Frame */}
      <rect width="148" height="102" rx="5" fill="#1E293B" />
      <rect width="148" height="102" rx="5" fill="none" stroke="#64748B" strokeWidth="1.5" />
      {/* Horizontal dividers */}
      <line x1="0" y1="34" x2="148" y2="34" stroke="#334155" strokeWidth="1" />
      <line x1="0" y1="68" x2="148" y2="68" stroke="#334155" strokeWidth="1" />
      {/* Vertical dividers */}
      {[37, 74, 111].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="102" stroke="#334155" strokeWidth="1" />
      ))}
      {/* Solar cells */}
      {[4, 41, 78, 115].map(x =>
        [4, 38, 72].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="29" height="26" rx="2" fill="#1C3A54" />
        ))
      )}
      {/* Shine highlight */}
      <rect x="6" y="4" width="48" height="18" rx="2" fill="white" opacity="0.04" />
      {/* Mount pole */}
      <rect x="62" y="100" width="24" height="8" rx="3" fill="#475569" />
      {/* Sun badge */}
      <circle cx="140" cy="8" r="11" fill="#FCD34D" stroke="white" strokeWidth="1.5" />
      <circle cx="140" cy="8" r="5"  fill="#F59E0B" />
    </svg>
  )
}

function CeilingFan() {
  return (
    <svg width="118" height="118" viewBox="0 0 118 118" fill="none">
      {/* Rod */}
      <rect x="56" y="0" width="6" height="30" rx="3" fill="#9CA3AF" />
      {/* Ceiling cap */}
      <ellipse cx="59" cy="4" rx="12" ry="6" fill="#6B7280" />
      {/* Blade 1 — upward */}
      <ellipse cx="59" cy="25" rx="11" ry="30" fill="#92400E" opacity="0.92" />
      {/* Blade 2 — rotated 120° */}
      <g transform="rotate(120 59 59)">
        <ellipse cx="59" cy="25" rx="11" ry="30" fill="#78350F" opacity="0.92" />
      </g>
      {/* Blade 3 — rotated 240° */}
      <g transform="rotate(240 59 59)">
        <ellipse cx="59" cy="25" rx="11" ry="30" fill="#92400E" opacity="0.92" />
      </g>
      {/* Motor housing */}
      <circle cx="59" cy="59" r="17" fill="#374151" />
      <circle cx="59" cy="59" r="11" fill="#4B5563" />
      <circle cx="59" cy="59" r="5"  fill="#6B7280" />
      {/* Center screw */}
      <circle cx="59" cy="59" r="2"  fill="#9CA3AF" />
    </svg>
  )
}

function ACUnit() {
  return (
    <svg width="116" height="68" viewBox="0 0 116 68" fill="none">
      {/* Body */}
      <rect width="116" height="66" rx="10" fill="#F8FAFC" />
      <rect width="116" height="66" rx="10" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Top accent stripe */}
      <rect x="0" y="0" width="116" height="7" rx="10" fill="#6366F1" opacity="0.25" />
      {/* Vents */}
      {[14, 24, 34, 44, 54].map(y => (
        <rect key={y} x="10" y={y} width="78" height="4" rx="2" fill="#94A3B8" />
      ))}
      {/* Right control panel */}
      <rect x="96" y="8" width="14" height="50" rx="6" fill="#E2E8F0" />
      {/* LED power indicator */}
      <circle cx="103" cy="22" r="4.5" fill="#10B981" />
      <circle cx="103" cy="22" r="4.5" fill="#10B981" opacity="0.3" />
      {/* Mode button */}
      <circle cx="103" cy="40" r="4"   fill="#818CF8" />
      {/* Leaf eco badge */}
      <circle cx="10" cy="0"  r="9"   fill="#10B981" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

/* ── Product showcase card ── */
function ProductShowcase() {
  return (
    <div className="relative">
      {/* Main card */}
      <div
        className="relative rounded-3xl overflow-hidden aspect-[4/3.5]
                   bg-gradient-to-br from-cyan-100 via-sky-50 to-emerald-100
                   shadow-[0_20px_60px_rgba(91,33,182,0.18)] max-w-[420px] mx-auto"
      >
        {/* Ambient blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-violet-300/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />

        {/* Solar panel — top left */}
        <div className="absolute top-7 left-5 animate-float drop-shadow-lg">
          <SolarPanel />
        </div>

        {/* Ceiling fan — center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] animate-float-delay drop-shadow-lg">
          <CeilingFan />
        </div>

        {/* AC unit — bottom right */}
        <div className="absolute bottom-10 right-4 animate-float-slow drop-shadow-lg">
          <ACUnit />
        </div>

        {/* Energy badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5
                        bg-white/75 backdrop-blur-sm border border-white/60
                        px-2.5 py-1.5 rounded-full text-xs font-semibold text-eco-700 shadow-sm">
          <Zap className="w-3 h-3 text-eco-600" />
          Energy Saved: 40%
        </div>

        {/* Razorpay trust badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5
                        bg-white/75 backdrop-blur-sm border border-white/60
                        px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
          <Shield className="w-3 h-3 text-blue-600" />
          Razorpay
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="absolute -left-6 top-1/3 bg-white rounded-2xl shadow-card-hover px-4 py-3 hidden lg:block">
        <div className="font-display font-bold text-xl text-primary-800">5,200+</div>
        <div className="text-gray-500 text-xs">Active Referrers</div>
      </div>
      <div className="absolute -right-6 bottom-1/4 bg-white rounded-2xl shadow-card-hover px-4 py-3 hidden lg:block">
        <div className="font-display font-bold text-xl text-eco-700">₹8 Cr+</div>
        <div className="text-gray-500 text-xs">Total Savings</div>
      </div>
    </div>
  )
}

/* ── Feature pills below hero CTA ── */
const PILLS = [
  { Icon: Shield,     label: 'Razorpay Secure',   color: 'text-blue-600'    },
  { Icon: Sun,        label: 'Solar Subsidy',      color: 'text-yellow-600'  },
  { Icon: TrendingUp, label: 'Referral Earnings',  color: 'text-primary-600' },
  { Icon: Package,    label: 'Bulk Quotes',        color: 'text-orange-600'  },
  { Icon: Leaf,       label: 'Green India',        color: 'text-eco-600'     },
]

/* ═══════════════ HERO ═══════════════ */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 bg-dots opacity-[0.35] pointer-events-none" />

      {/* Large ambient orbs */}
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px]
                      bg-primary-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px]
                      bg-eco-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative section-wrapper pt-10 pb-16 lg:pt-14 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 xl:gap-16 items-center">

          {/* ── Left content ── */}
          <div className="order-2 lg:order-1 text-center lg:text-left">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800
                            text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Leaf className="w-3 h-3" />
              Green India Mission 2026
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-[3.4rem]
                           text-gray-900 leading-[1.13] mb-5">
              Smart Energy Products
              <span className="block text-gradient mt-1">
                for Homes, Businesses
              </span>
              <span className="block text-gray-900 mt-0.5 text-3xl sm:text-4xl xl:text-5xl">
                & Future India
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Shop solar panels, fans, ACs, and energy-saving products.
              Earn through referrals, request bulk quotations, and get
              solar subsidy support — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-9">
              <Link to="/products" className="btn-primary flex items-center gap-2 text-base">
                Shop Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/referral" className="btn-secondary text-base">
                Start Earning
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-3">
              {PILLS.map(({ Icon, label, color }) => (
                <div key={label} className="feature-pill">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: product showcase ── */}
          <div className="order-1 lg:order-2">
            <ProductShowcase />
          </div>
        </div>
      </div>
    </section>
  )
}
