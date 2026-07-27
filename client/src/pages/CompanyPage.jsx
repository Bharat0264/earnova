import PageMeta from '../components/common/PageMeta'

const CONTENT = {
  about: ['About Earnova', 'Built to make business growth less fragmented.', 'Earnova brings business tools, trusted professional services and sustainable energy solutions into one connected platform for Indian businesses.'],
  contact: ['Contact Earnova', 'Tell us what you are trying to achieve.', 'For product help, partnerships, professional services or business enquiries, email earnova.fam@gmail.com. You can also find us on Instagram at @earnova.in__. Do not send passwords, payment credentials or sensitive identity documents by email.'],
  privacy: ['Privacy policy', 'How Earnova approaches personal and business data.', 'Earnova should collect only the data needed to provide requested services, protect access with appropriate controls, and avoid using one customer’s business data for another customer. A complete lawyer-reviewed production policy is still required before broader launch.'],
  terms: ['Terms of service', 'Clear rules for using Earnova.', 'Users must provide accurate information, respect intellectual property, and use payment and marketplace features lawfully. Professional, financial, tax, legal, energy and forecast information must not be treated as a guarantee. A lawyer-reviewed production agreement is still required.'],
  refund: ['Refund policy', 'Refund handling depends on the product or service state.', 'Eligible cancellation and refund requests are reviewed against payment status, fulfilment progress, provider work completed and applicable law. Earnova does not promise an automatic refund until the request has been reviewed and approved.'],
}

export default function CompanyPage({ page }) {
  const [title, heading, text] = CONTENT[page]
  return (
    <>
      <PageMeta title={title} description={text} />
      <section className="section-wrapper py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{title}</p>
          <h1 className="page-title mt-4">{heading}</h1>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-base leading-8 text-slate-700 shadow-sm sm:p-9">
            <p>{text}</p>
            {(page === 'privacy' || page === 'terms') && <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Current status: interim MVP notice. Formal legal review is required before production-scale use.</p>}
          </div>
        </div>
      </section>
    </>
  )
}
