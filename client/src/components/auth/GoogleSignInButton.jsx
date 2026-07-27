import { useEffect, useRef, useState } from 'react'

const SCRIPT_ID = 'google-identity-services'

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const [error, setError] = useState('')

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
    if (!clientId) {
      setError('Google sign-in is not configured.')
      return
    }

    let cancelled = false
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !containerRef.current) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: response => callbackRef.current?.(response.credential),
        })
        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: Math.min(containerRef.current.clientWidth || 360, 400),
        })
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google sign-in. Please check your connection.')
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div ref={containerRef} className="flex min-h-10 w-full justify-center" />
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
