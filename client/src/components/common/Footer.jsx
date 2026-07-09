import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, Sparkles, Youtube } from 'lucide-react'

const SERVICES = [
  { label: 'Earnova Energy Solutions', to: '/energy-solutions' },
  { label: 'Earnova Business Solutions', to: '/business-solutions' },
  { label: 'Earnova CA Services', to: '/ca-services' },
  { label: 'Hire a Freelancer', to: '/freelance?mode=hire' },
  { label: 'Become a Freelancer', to: '/freelance?mode=freelancer' },
  { label: 'Browse Products', to: '/products' },
]
const COMPANY = [
  { label: 'About Earnova', to: '/' },
  { label: 'Investor Snapshot', to: '/investors' },
  { label: 'How Escrow Works', to: '/freelance' },
  { label: 'Support', to: '/' },
  { label: 'Privacy Policy', to: '/' },
  { label: 'Terms of Service', to: '/' },
]
const PARTNER = [
  { label: 'Solar Subsidy', to: '/subsidy' },
  { label: 'E-commerce Partners', to: '/products' },
  { label: 'B2B Bulk Orders', to: '/b2b' },
  { label: 'Verified CA Network', to: '/ca-services' },
  { label: 'Referral Program', to: '/referral' },
  { label: 'Dealer Portal', to: '/b2b' },
  { label: 'Affiliate Program', to: '/referral' },
]
const SOCIALS = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Youtube, href: '#', label: 'YouTube' },
  { Icon: Mail, href: '#', label: 'Email' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-gray-500 mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link to={to} className="text-gray-400 hover:text-primary-300 transition-colors text-sm">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="section-wrapper py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="inline-flex mb-4">
              <img src="/earnova-logo.png" alt="Earnova" className="w-[220px] h-auto object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-[260px]">
              A trusted marketplace for freelance work and e-commerce—built to help people earn, hire, and grow safely.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 bg-primary-900/40 border border-primary-700/30 text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Work. Earn. Grow.
            </div>
          </div>
          <FooterColumn title="Services" links={SERVICES} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Partner" links={PARTNER} />
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Earnova Marketplace. Freelancing and e-commerce, together.</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Secure payments powered by</span>
            <span className="text-primary-300 font-bold tracking-wide">RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
