import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import {
  MOCK_ADMIN_STATS, MOCK_ORDERS, MOCK_USERS,
  MOCK_B2B_QUOTES, MOCK_SUBSIDY_REQUESTS, MOCK_WITHDRAWALS,
} from '../data/mockAdmin'
import { MOCK_PRODUCTS } from '../data/mockProducts'

export function useAdminStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/stats')
      setStats(data.stats)
    } catch {
      setStats(MOCK_ADMIN_STATS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { stats, loading, reload: load }
}

function makeTableHook(apiPath, mockData) {
  return function useTable(params = {}) {
    const [data,    setData]    = useState([])
    const [total,   setTotal]   = useState(0)
    const [loading, setLoading] = useState(true)

    const key = JSON.stringify(params)

    const load = useCallback(async () => {
      setLoading(true)
      try {
        const qs  = new URLSearchParams(params).toString()
        const res = await api.get(`${apiPath}${qs ? '?' + qs : ''}`)
        const arr = res.orders || res.users || res.quotes || res.requests || res.withdrawals || res.products || []
        setData(arr)
        setTotal(res.total || arr.length)
      } catch {
        setData(mockData)
        setTotal(mockData.length)
      } finally {
        setLoading(false)
      }
    }, [key]) // eslint-disable-line

    useEffect(() => { load() }, [load])
    return { data, total, loading, reload: load }
  }
}

export const useAdminOrders     = makeTableHook('/orders/admin/all',  MOCK_ORDERS)
export const useAdminProducts   = makeTableHook('/products',          MOCK_PRODUCTS)
export const useAdminUsers      = makeTableHook('/admin/users',       MOCK_USERS)
export const useAdminB2B        = makeTableHook('/b2b/quotes',        MOCK_B2B_QUOTES)
export const useAdminSubsidy    = makeTableHook('/subsidy/requests',  MOCK_SUBSIDY_REQUESTS)
export const useAdminWithdrawals = makeTableHook('/referral/withdrawals', MOCK_WITHDRAWALS)
