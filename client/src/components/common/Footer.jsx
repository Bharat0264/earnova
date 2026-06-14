import { Link } from 'react-router-dom'
import { Zap, Instagram, Facebook, Youtube, Mail, Leaf } from 'lucide-react'

const SERVICES = [
  { label: 'Secure Payments',  to: '/checkout' },
  { label: 'Subsidy Support',  to: '/subsidy'  },
  { label: 'Order Tracking',   to: '/account'  },
  { label: 'EMI Options',      to: '/checkout' },
  { label: 'Bulk Quotations',  to: '/b2b'      },
]
const COMPANY = [
  { label: 'Green Initiatives', to: '/'         },
  { label: 'About Us',          to: '/'         },
  { label: 'Support',           to: '/'         },
  { label: 'Privacy Policy',    to: '/'         },
  { label: 'Terms of Service',  to: '/'         },
]
const PARTNER = [
  { label: 'B2B Bulk Orders',    to: '/b2b'      },
  { label: 'Referral Program',   to: '/referral' },
  { label: 'Dealer Portal',      to: '/b2b'      },
  { label: 'Contractor Quotes',  to: '/b2b'      },
  { label: 'Affiliate Program',  to: '/referral' },
]
const SOCIALS = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook'  },
  { Icon: Youtube,   href: '#', label: 'YouTube'   },
  { Icon: Mail,      href: '#', label: 'Email'     },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="section-wrapper py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand column ── */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <img src="/earnova-logo.png" alt="Earnova" className="w-[220px] h-auto object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-[240px]">
              Pioneering a sustainable future through smart energy products and green initiatives.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/8 border border-white/10 rounded-lg flex items-center justify-center
                             hover:bg-primary-600 hover:border-primary-500 transition-all duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>

            {/* Green India badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 bg-eco-900/40 border border-eco-700/30
                            text-eco-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Leaf className="w-3 h-3" />
              Green India Mission
            </div>
          </div>

          {/* ── Services ── */}
          <FooterColumn title="Services" links={SERVICES} />

          {/* ── Company ── */}
          <FooterColumn title="Company" links={COMPANY} />

          {/* ── Partner ── */}
          <FooterColumn title="Partner" links={PARTNER} />
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Earnova Energy. Pioneering a sustainable future.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Payments secured by</span>
            <span className="text-eco-400 font-bold tracking-wide">RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-gray-500 mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="text-gray-400 hover:text-eco-400 transition-colors text-sm"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
