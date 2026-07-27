import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'

const GROUPS = [
  ['Company', [['About', '/about'], ['Pricing', '/pricing'], ['Current fees', '/fees'], ['Contact', '/contact'], ['Help Centre', '/help']]],
  ['Shopping', [['All products', '/products'], ['Solar products', '/products?category=solar-panels'], ['Projects', '/projects'], ['B2B orders', '/b2b']]],
  ['Services', [['All services', '/services'], ['Freelancers', '/services/freelancers'], ['CA & tax', '/services/ca'], ['Consulting', '/services/business-consulting']]],
  ['Business & Earn', [['Business workspace', '/app/overview'], ['Business AI', '/business-ai'], ['Energy', '/energy'], ['Earn & Partner', '/referral']]],
  ['Legal', [['Privacy', '/privacy'], ['Terms', '/terms'], ['Refund policy', '/refund-policy']]],
]

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="section-wrapper py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link to="/"><img src="/earnova-logo.png" alt="Earnova" className="h-11 w-auto rounded bg-white/95 px-2" /></Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">AI-powered business tools, trusted professional services and sustainable energy solutions for Indian businesses.</p>
            <div className="mt-5 space-y-2 text-sm text-slate-400">
              <a href="mailto:earnova.fam@gmail.com" className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4" /> earnova.fam@gmail.com</a>
              <a href="https://www.instagram.com/earnova.in__?igsh=MXZkZ2hoZmlwM3k0eQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Open Earnova on Instagram" className="flex items-center gap-2 hover:text-white"><Instagram className="h-4 w-4" /> @earnova.in__</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> India</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-5">
            {GROUPS.map(([title, links]) => (
              <div key={title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</h2>
                <ul className="mt-4 space-y-3">
                  {links.map(([label, to]) => <li key={to}><Link to={to} className="text-sm text-slate-400 hover:text-white">{label}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Earnova. All rights reserved.</p>
          <p>Payment availability and provider verification vary by service.</p>
        </div>
      </div>
    </footer>
  )
}
