import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-50 px-4 py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="eyebrow">Earnova</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">We could not load this page.</h1>
            <p className="mt-3 text-slate-600">Your data has not been changed. Refresh the page or return home and try again.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary" onClick={() => window.location.reload()}>Refresh</button>
              <Link to="/" className="btn-secondary">Return home</Link>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

