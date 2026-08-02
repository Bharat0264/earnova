const normalizeApiBase = (value) => {
  const base = (value || '/api').trim().replace(/\/+$/, '')

  if (base.startsWith('/') || /^https?:\/\//i.test(base)) {
    return base
  }

  return `https://${base}`
}

const getApiBase = () => {
  const hostname = globalThis.location?.hostname

  if (hostname === 'earnova.in' || hostname === 'www.earnova.in') {
    return normalizeApiBase(import.meta.env.VITE_API_BASE || 'https://earnova-71uh.onrender.com/api')
  }

  return normalizeApiBase(import.meta.env.VITE_API_BASE)
}

export const API_BASE = getApiBase()

export const apiUrl = (endpoint) => `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

export async function parseJsonResponse(res) {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: `Invalid server response (${res.status})` }
  }
}

const getToken = () => localStorage.getItem('earnova_token')

const DEFAULT_TIMEOUT_MS = 15000

async function request(endpoint, opts = {}) {
  const token = getToken()
  const isFormData = opts.body instanceof FormData
  const controller = new AbortController()
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ?? {}),
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const body = opts.body === undefined
    ? undefined
    : isFormData
      ? opts.body
      : JSON.stringify(opts.body)

  let res
  let data
  try {
    res = await fetch(apiUrl(endpoint), {
      ...opts,
      headers,
      body,
      credentials: 'include',
      signal: opts.signal ?? controller.signal,
    })
    data = await parseJsonResponse(res)
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The request timed out. Please try again.')
      timeoutError.code = 'REQUEST_TIMEOUT'
      throw timeoutError
    }
    const networkError = new Error('Unable to reach Earnova. Check your connection and try again.')
    networkError.code = 'NETWORK_ERROR'
    networkError.cause = error
    throw networkError
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    if (res.status === 401 && ['AUTH_REQUIRED', 'AUTH_INVALID'].includes(data?.code)) {
      localStorage.removeItem('earnova_token')
      window.dispatchEvent(new Event('earnova:auth-expired'))
    }

    const err = new Error(data?.message || `Request failed with status ${res.status}`)
    err.status = res.status
    err.data   = data
    throw err
  }

  return data
}

export const api = {
  get:    (url)       => request(url),
  post:   (url, body) => request(url, { method: 'POST',   body }),
  patch:  (url, body) => request(url, { method: 'PATCH',  body }),
  put:    (url, body) => request(url, { method: 'PUT',    body }),
  delete: (url)       => request(url, { method: 'DELETE' }),
}
