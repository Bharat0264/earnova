import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import {
  MOCK_ADMIN_STATS, MOCK_ORDERS, MOCK_USERS,
  MOCK_B2B_QUOTES, MOCK_SUBSIDY_REQUESTS, MOCK_WITHDRAWALS,
} from '../data/mockAdmin'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export function useAdminStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/stats')
      setStats(data.stats)
    } catch (err) {
      setStats(DEMO_MODE ? MOCK_ADMIN_STATS : null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { stats, loading, error, isDemo: DEMO_MODE && !!error, reload: load }
}

function makeTableHook(apiPath, mockData) {
  return function useTable(params = {}) {
    const [data,    setData]    = useState([])
    const [total,   setTotal]   = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const key = JSON.stringify(params)

    const load = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
        const qs  = new URLSearchParams(params).toString()
        const res = await api.get(`${apiPath}${qs ? '?' + qs : ''}`)
        const arr = res.orders || res.users || res.quotes || res.requests || res.withdrawals || res.products || res.listings || []
        setData(arr)
        setTotal(res.total || arr.length)
      } catch (err) {
        const fallback = DEMO_MODE ? mockData : []
        setData(fallback)
        setTotal(fallback.length)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, [key]) // eslint-disable-line

    useEffect(() => { load() }, [load])
    return { data, total, loading, error, isDemo: DEMO_MODE && !!error, reload: load }
  }
}

export const useAdminOrders     = makeTableHook('/orders/admin/all',  MOCK_ORDERS)
export const useAdminProducts   = makeTableHook('/products/admin/all', MOCK_PRODUCTS)
export const useAdminUsers      = makeTableHook('/admin/users',       MOCK_USERS)
export const useAdminB2B        = makeTableHook('/b2b/quotes',        MOCK_B2B_QUOTES)
export const useAdminSubsidy    = makeTableHook('/subsidy/requests',  MOCK_SUBSIDY_REQUESTS)
export const useAdminWithdrawals = makeTableHook('/referral/withdrawals', MOCK_WITHDRAWALS)
export const useAdminProjectListings = makeTableHook('/admin/project-listings', [])

export function useAdminFreelanceJobs(params = {}) {
  const [data, setData] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await api.get(`/admin/freelance-jobs${qs ? '?' + qs : ''}`)
      setData(res.jobs || [])
      setFreelancers(res.freelancers || [])
      setTotal(res.total || res.jobs?.length || 0)
    } catch {
      setData([])
      setFreelancers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [key]) // eslint-disable-line

  useEffect(() => { load() }, [load])
  return { data, freelancers, total, loading, reload: load }
}

export function useAdminCAProfiles(params = {}) {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await api.get(`/admin/ca-profiles${qs ? '?' + qs : ''}`)
      setData(res.profiles || [])
      setTotal(res.total || res.profiles?.length || 0)
    } catch {
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [key]) // eslint-disable-line

  useEffect(() => { load() }, [load])
  return { data, total, loading, reload: load }
}

export function useAdminCATaxJobs(params = {}) {
  const [data, setData] = useState([])
  const [caProfiles, setCAProfiles] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await api.get(`/admin/ca-tax-jobs${qs ? '?' + qs : ''}`)
      setData(res.jobs || [])
      setCAProfiles(res.caProfiles || [])
      setTotal(res.total || res.jobs?.length || 0)
    } catch {
      setData([])
      setCAProfiles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [key]) // eslint-disable-line

  useEffect(() => { load() }, [load])
  return { data, caProfiles, total, loading, reload: load }
}
