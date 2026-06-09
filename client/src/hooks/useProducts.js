import { useState, useEffect, useCallback } from 'react'
import { apiUrl, parseJsonResponse } from '../utils/api'

/* ── Apply all filters + sort to the mock array ── */
function applyMockFilters(params) {
  let list = [...MOCK_PRODUCTS]

  if (params.category) list = list.filter(p => p.category === params.category)
  if (params.brand)    list = list.filter(p => p.brand === params.brand)
  if (params.search) {
    const q = params.search.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.shortDesc?.toLowerCase().includes(q)
    )
  }
  if (params.minPrice) list = list.filter(p => p.price >= Number(params.minPrice))
  if (params.maxPrice) list = list.filter(p => p.price <= Number(params.maxPrice))
  if (params.inStock)  list = list.filter(p => p.stock > 0)

  switch (params.sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price);   break
    case 'price-desc': list.sort((a, b) => b.price - a.price);   break
    case 'rating':     list.sort((a, b) => b.rating - a.rating); break
    case 'discount':   list.sort((a, b) => b.discount - a.discount); break
    default: break
  }

  const page  = Number(params.page)  || 1
  const limit = Number(params.limit) || 12
  const total = list.length
  const pages = Math.ceil(total / limit) || 1
  const items = list.slice((page - 1) * limit, page * limit)

  return { items, total, pages }
}

/**
 * Fetch a list of products.
 * Tries the products API first; falls back to MOCK_PRODUCTS if API is offline / returns empty.
 */
export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [total,    setTotal]    = useState(0)
  const [pages,    setPages]    = useState(1)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
  setLoading(true)
  setError(null)

  try {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(apiUrl(`/products${qs ? '?' + qs : ''}`))

    if (!res.ok) {
      throw new Error('Failed to load products')
    }

    const data = await parseJsonResponse(res)

    setProducts(data.products || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)

    setLoading(false)
    return
  } catch (err) {
    console.error(err)

    setProducts([])
    setTotal(0)
    setPages(1)
    setError(err.message)
    setLoading(false)
  }
}, [key])

/**
 * Fetch a single product by id or slug.
 * Tries the products API; falls back to MOCK_PRODUCTS.
 */
export function useProduct(idOrSlug) {
  const [product,  setProduct]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!idOrSlug) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setNotFound(false)

      /* Try API */
      try {
        const res = await fetch(apiUrl(`/products/${idOrSlug}`))
        if (res.ok) {
          const data = await parseJsonResponse(res)
          if (!cancelled && data?.product) {
            setProduct(data.product)
            setRelated(
              MOCK_PRODUCTS
                .filter(p => p.category === data.product.category && p._id !== data.product._id)
                .slice(0, 4)
            )
            setLoading(false)
            return
          }
        }
      } catch { /* fall through */ }

      /* No mock fallback */
if (!cancelled) {
  setProduct(null)
  setRelated([])
  setNotFound(true)
  setLoading(false)
}