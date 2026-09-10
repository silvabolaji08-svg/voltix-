/**
 * The single place the frontend talks to the API.
 *
 * Every request goes through `request()`, so the base URL, the auth header,
 * JSON parsing and error shape are decided once instead of at 30 call sites.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const TOKEN_KEY = 'voltix-token'

/* Storage throws in private windows and when site data is blocked, so every
   access is guarded — same reasoning as useLocalStorage. */
export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* in-memory only for this session */
  }
}

export function clearToken() {
  setToken(null)
}

/* Carries the HTTP status so callers can branch on it — 401 means sign in
   again, 409 means a real conflict to show the user, and so on. */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (err) {
    /* fetch only rejects when the request never completed — server down,
       no network, DNS failure. An HTTP 500 is a resolved promise. */
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, 'Could not reach the server. Is the API running?')
  }

  /* 204 has no body; parsing it would throw. */
  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401) clearToken()
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`, data)
  }

  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

/* Named endpoints. Components call these, never fetch directly — so a change
   to a URL is one edit here, not a search across the codebase. */
export const productsApi = {
  list: (params, opts) => api.get(`/products${toQuery(params)}`, opts),
  meta: (opts) => api.get('/products/meta', opts),
  bySlug: (slug, opts) => api.get(`/products/${slug}`, opts),
  create: (data) => api.post('/products', data, { auth: true }),
  update: (id, data) => api.put(`/products/${id}`, data, { auth: true }),
  remove: (id) => api.del(`/products/${id}`, { auth: true }),
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: (opts) => api.get('/auth/me', { ...opts, auth: true }),
}

export const ordersApi = {
  create: (data) => api.post('/orders', data, { auth: Boolean(getToken()) }),
  mine: (opts) => api.get('/orders/mine', { ...opts, auth: true }),
  byReference: (reference, opts) => api.get(`/orders/${reference}`, opts),
  list: (params, opts) => api.get(`/orders${toQuery(params)}`, { ...opts, auth: true }),
  setStatus: (reference, status) => api.patch(`/orders/${reference}/status`, { status }, { auth: true }),
  stats: (opts) => api.get('/orders/stats/summary', { ...opts, auth: true }),
}

/* Skips empty values so the URL stays clean — ?category=audio, never
   ?category=audio&brand=&maxPrice=. */
function toQuery(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}