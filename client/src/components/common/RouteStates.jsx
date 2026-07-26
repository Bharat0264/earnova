import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react'

export function PageLoader({ label = 'Loading your workspace' }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin text-brand-700" />
      <p className="font-semibold text-slate-700">{label}</p>
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-panel" role="alert">
      <AlertCircle className="h-7 w-7 text-red-600" />
      <div className="text-center">
        <p className="font-bold text-slate-900">{title}</p>
        {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-panel">
      <Inbox className="h-7 w-7 text-slate-400" />
      <div className="text-center">
        <p className="font-bold text-slate-900">{title}</p>
        {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      </div>
      {action}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="surface-card animate-pulse" aria-hidden="true">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-36 rounded bg-slate-200" />
      <div className="mt-5 h-3 w-full rounded bg-slate-100" />
    </div>
  )
}

