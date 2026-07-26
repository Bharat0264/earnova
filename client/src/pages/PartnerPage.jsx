import { EmptyState } from '../components/common/RouteStates'

export default function PartnerPage({ title }) {
  return (
    <div>
      <p className="eyebrow">Partner workspace</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
      <div className="mt-7">
        <EmptyState title={`No ${title.toLowerCase()} yet`} message="This route is ready for the matching verified provider workflow. It does not create or imply live records." />
      </div>
    </div>
  )
}

