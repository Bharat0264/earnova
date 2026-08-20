import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageMeta from '../components/common/PageMeta'
import { api } from '../utils/api'

const stages = ['Requirements received', 'Quote', 'Development', 'Review', 'Deployment']
const label = value => (value || 'DRAFT').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())

export default function BuildProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get(`/business-modules/build-projects/${id}`).then(data => setProject(data.project)).catch(requestError => setError(requestError.message)) }, [id])
  if (error) return <main className="section-wrapper py-14"><h1 className="page-title">Unable to load this project</h1><p className="mt-3 text-sm text-red-700">{error}</p><Link className="btn-secondary mt-6" to="/build">Back to Build</Link></main>
  if (!project) return <main className="section-wrapper py-14 text-sm text-slate-600">Loading build project…</main>
  return <main className="section-wrapper max-w-4xl py-10"><PageMeta title={project.projectType || 'Build project'} noIndex /><p className="eyebrow">Build project</p><h1 className="page-title mt-2">{project.requirements?.businessName || project.projectType}</h1><p className="mt-2 text-sm text-slate-600">{label(project.status)} · {project.selectedPackage === 'request_quote' ? 'Request quote' : label(project.selectedPackage)}</p><section className="surface-card mt-7 p-6"><h2 className="font-bold text-slate-950">Project progress</h2><div className="mt-5 grid gap-3 sm:grid-cols-5">{stages.map(stage => <div key={stage} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">{stage}</div>)}</div><p className="mt-5 text-sm text-slate-600">Project stages reflect only recorded status updates. No delivery progress is estimated.</p></section><section className="surface-card mt-4 p-6"><h2 className="font-bold text-slate-950">Requirements</h2><p className="mt-3 text-sm leading-6 text-slate-600">{project.requirements?.notes || 'No additional notes supplied.'}</p></section></main>
}
