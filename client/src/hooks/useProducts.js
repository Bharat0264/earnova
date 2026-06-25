import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const qs = new URLSearchParams(params).toString()
      const data = await api.get(`/products${qs ? '?' + qs : ''}`)

      setProducts(data.products || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (err) {
      console.error(err)
      setProducts([])
      setTotal(0)
      setPages(1)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  return {
    products,
    loading,
    error,
    total,
    pages,
    reload: load,
  }
}

export function useProduct(idOrSlug) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!idOrSlug) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setNotFound(false)

      try {
        const data = await api.get(`/products/${idOrSlug}`)

        if (!cancelled && data?.product) {
          setProduct(data.product)
          setRelated([])
          setLoading(false)
          return
        }
      } catch (err) {
        console.error(err)
      }

      if (!cancelled) {
        setProduct(null)
        setRelated([])
        setNotFound(true)
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [idOrSlug])

  return {
    product,
    related,
    loading,
    notFound,
  }
}
