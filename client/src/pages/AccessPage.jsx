import { Link } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import PageMeta from '../components/common/PageMeta'

export default function AccessPage({ forbidden = false }) {
  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-20">
      <PageMeta title={forbidden ? 'Access not available' : 'Login required'} noIndex />
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <LockKeyhole className="mx-auto h-9 w-9 text-brand-700" />
        <h1 className="mt-5 text-3xl font-bold text-slate-950">{forbidden ? 'This workspace is not available for your role.' : 'Please sign in to continue.'}</h1>
        <p className="mt-3 text-slate-600">{forbidden ? 'Choose a relevant account type in onboarding or contact Earnova if your provider access should be reviewed.' : 'Your requested page is protected.'}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to={forbidden ? '/onboarding' : '/login'} className="btn-primary">{forbidden ? 'Review account setup' : 'Sign in'}</Link>
          <Link to="/" className="btn-secondary">Return home</Link>
        </div>
      </div>
    </section>
  )
}
