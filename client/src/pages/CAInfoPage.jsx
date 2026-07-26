import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

const CONTENT = {
  pricing: {
    title: 'Clear CA service pricing',
    intro: 'The pricing method depends on scope, complexity, government charges and whether work is recurring.',
    points: ['Fixed price for clearly bounded work', 'Starting price where complexity can vary', 'Custom quotation after requirements review', 'Recurring plan for ongoing virtual-CA support', 'Separate professional, government, platform, tax and add-on line items'],
  },
  'how-it-works': {
    title: 'How the online CA office works',
    intro: 'Each request becomes an authorized case with a verified firm, clear next action and trackable history.',
    points: ['Review a configurable service description', 'Submit requirements and consultation needs', 'Receive firm allocation and a quotation where required', 'Pay only through verified Earnova payment flows', 'Use the private case room for documents and progress', 'Approve deliverables or raise contextual support'],
  },
  faq: {
    title: 'CA services frequently asked questions',
    intro: 'Common answers before you start a professional-service request.',
    points: ['Earnova does not guarantee approval, tax savings or completion dates.', 'A firm employee is not labelled as a Chartered Accountant unless the designation is verified.', 'Authority-controlled processing can extend handling time.', 'Sensitive files should be uploaded only inside the private case room.', 'Refund eligibility depends on completed work, third-party charges and the accepted quote.'],
  },
  'book-consultation': {
    title: 'Book a CA consultation',
    intro: 'Choose the service closest to your question, then start a case. Consultation type, availability and fee are confirmed by the assigned firm.',
    points: ['Introductory consultation', 'Document-review consultation', 'Tax consultation', 'Clarification meeting', 'Final-review meeting'],
  },
}

export default function CAInfoPage({ page }) {
  const content = CONTENT[page] || CONTENT.faq
  return (
    <>
      <PageMeta title={content.title} path={`/services/ca/${page}`} />
      <main className="section-wrapper py-12 lg:py-16">
        <p className="eyebrow">Earnova CA Services</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950">{content.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{content.intro}</p>
        <div className="mt-8 max-w-3xl surface-card p-6">
          <ul className="space-y-4">{content.points.map(point => <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{point}</li>)}</ul>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/services/ca" className="btn-primary">Browse services <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/help/ca" className="btn-secondary"><HelpCircle className="h-4 w-4" />Get help</Link>
        </div>
      </main>
    </>
  )
}
