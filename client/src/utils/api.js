const normalizeApiBase = (value) => {
  const base = (value || '/api').trim().replace(/\/+$/, '')

  if (base.startsWith('/') || /^https?:\/\//i.test(base)) {
    return base
  }

  return `https://${base}`
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE)

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

async function request(endpoint, opts = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ?? {}),
  }

  const res  = await fetch(apiUrl(endpoint), { ...opts, headers })
  const data = await parseJsonResponse(res)

  if (!res.ok) {
    if (res.status === 401) {
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
  post:   (url, body) => request(url, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (url, body) => request(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    (url, body) => request(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)       => request(url, { method: 'DELETE' }),
}
