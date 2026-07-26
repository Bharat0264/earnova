import { Link } from 'react-router-dom'
import { Briefcase, Calculator, Code2, SunMedium, UsersRound } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

const CATEGORIES = [
  ['Freelancers', 'Hire professionals for development, design, marketing, writing, data and operations.', '/services/freelancers', Briefcase],
  ['CA and tax services', 'Request help with tax, accounts and business documentation from reviewed professionals.', '/services/ca', Calculator],
  ['Business consultants', 'Find practical support for business planning, operations and growth.', '/services/business-consulting', UsersRound],
  ['Ready-made projects', 'Explore moderated project listings and clear purchase states.', '/projects', Code2],
  ['Energy solutions', 'Browse solar products and share residential or commercial energy requirements.', '/energy', SunMedium],
]

export default function MarketplacePage() {
  return (
    <>
      <PageMeta title="Marketplace" description="Explore Earnova professionals, projects and energy solutions through clear, organized service journeys." />
      <section className="page-hero">
        <div className="section-wrapper py-16 lg:py-24">
          <p className="eyebrow">Earnova marketplace</p>
          <h1 className="page-title mt-4 max-w-4xl">Find the right professional, project or energy solution.</h1>
          <p className="page-lead mt-5">Browse focused categories instead of sorting through one crowded catalogue.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES.map(([title, description, to, Icon]) => (
              <Link key={title} to={to} className="surface-card group p-6 hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
                <h2 className="mt-5 text-xl font-bold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                <span className="mt-5 inline-block text-sm font-bold text-brand-700">Explore category →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
