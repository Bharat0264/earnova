import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

export default function AppModulePage({ title, description }) {
  return (
    <>
      <PageMeta title={title} noIndex />
      <div className="max-w-3xl">
        <p className="eyebrow">Business workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
        <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-7">
          <Construction className="h-8 w-8 text-brand-700" />
          <h2 className="mt-5 text-xl font-bold text-slate-950">Planned as a complete Phase 2 workflow</h2>
          <p className="mt-2 leading-relaxed text-slate-600">{description} This screen is intentionally read-only until its tenant-safe data model, validation, authorization and tests are implemented together.</p>
          <Link to="/app/overview" className="btn-secondary mt-6">Return to overview</Link>
        </div>
      </div>
    </>
  )
}

