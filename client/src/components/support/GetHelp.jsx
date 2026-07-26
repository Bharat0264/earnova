import { Link, useLocation } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'

const serviceFromPath = pathname => {
  if (pathname.includes('/ca') || pathname.includes('/services/ca')) return 'ca'
  if (pathname.includes('/business') || pathname.startsWith('/app/')) return 'business'
  if (pathname.includes('/energy') || pathname.includes('/subsidy')) return 'energy'
  if (pathname.includes('/freelance')) return 'freelancing'
  if (pathname.includes('/project')) return 'projects'
  if (pathname.includes('/product') || pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/order')) return 'commerce'
  if (pathname.includes('/referral')) return 'referrals'
  return 'account'
}

export default function GetHelp({ service, entityType, entityRef, className = '' }) {
  const location = useLocation()
  if (location.pathname.startsWith('/help') || location.pathname.includes('/support')) return null
  const params = new URLSearchParams({
    service: service || serviceFromPath(location.pathname),
    source: location.pathname,
  })
  if (entityType && entityRef) {
    params.set('entityType', entityType)
    params.set('entityRef', entityRef)
  }
  return (
    <Link to={`/app/support/new?${params.toString()}`} className={`fixed bottom-5 right-5 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl hover:bg-brand-800 ${className}`}>
      <HelpCircle className="h-4 w-4" />Get Help
    </Link>
  )
}
