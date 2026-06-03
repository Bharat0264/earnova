const BASE = import.meta.env.PROD
  ? 'https://earnova-xi9n.onrender.com/api'
  : 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('earnova_token')

async function request(endpoint, opts = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ?? {}),
  }

  const res  = await fetch(`${BASE}${endpoint}`, { ...opts, headers })
  const data = await res.json().catch(() => ({ message: `Server error (${res.status})` }))

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('earnova_token')
      window.dispatchEvent(new Event('earnova:auth-expired'))
    }

    const err = new Error(data.message || `Request failed with status ${res.status}`)
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
