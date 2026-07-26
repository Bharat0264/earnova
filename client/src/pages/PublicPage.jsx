import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

const PAGE_CONTENT = {
  business: {
    title: 'Earnova Business',
    heading: 'A clearer way to run your business.',
    description: 'Bring sales, customers, inventory, invoices, expenses and business insights into one practical workspace.',
    items: ['Business overview and health signals', 'Sales, CRM and follow-up workflows', 'Inventory, expenses and invoices', 'Data-grounded Business AI'],
    cta: 'Start your business workspace',
    to: '/register',
  },
  services: {
    title: 'Earnova Services',
    heading: 'Trusted professionals for the work that moves your business forward.',
    description: 'Hire freelancers, connect with CA and tax professionals, find consultants, and explore ready-made projects through organized service journeys.',
    items: ['Freelancers for digital and operational work', 'CA and tax service requests', 'Business consulting and B2B requirements', 'Project marketplace with moderated listings'],
    cta: 'Explore the marketplace',
    to: '/marketplace',
  },
  businessAi: {
    title: 'Business AI',
    heading: 'Ask better questions about your business data.',
    description: 'Earnova Business AI is designed to explain authorized metrics, show the period used, and separate calculations from forecasts and general recommendations.',
    items: ['Revenue and expense trends', 'Inventory and customer follow-ups', 'Outstanding invoice summaries', 'Forecasts with visible limitations'],
    cta: 'Open the workspace',
    to: '/app/ai',
  },
  consulting: {
    title: 'Business consulting',
    heading: 'Practical support for important business decisions.',
    description: 'Share your requirement and connect with suitable professionals for planning, operations, sales, finance and growth.',
    items: ['Clear requirement capture', 'Relevant provider matching', 'Visible request status', 'Organized updates and completion'],
    cta: 'Create an account',
    to: '/register',
  },
}

export default function PublicPage({ page }) {
  const content = PAGE_CONTENT[page]
  return (
    <>
      <PageMeta title={content.title} description={content.description} />
      <section className="page-hero">
        <div className="section-wrapper grid gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow">{content.title}</p>
            <h1 className="page-title mt-4">{content.heading}</h1>
            <p className="page-lead mt-5">{content.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={content.to} className="btn-primary">{content.cta}<ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="btn-secondary">Talk to Earnova</Link>
            </div>
          </div>
          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">What you can do</p>
            <div className="mt-6 space-y-4">
              {content.items.map(item => (
                <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="font-semibold text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

