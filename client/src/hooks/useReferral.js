import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import {
  MOCK_REFERRAL_STATS, MOCK_TRANSACTIONS,
  MOCK_WITHDRAWALS, MOCK_LEADERBOARD,
} from '../data/mockReferrals'

export function useReferral(enabled = true) {
  const [stats,        setStats]        = useState(null)
  const [transactions, setTransactions] = useState([])
  const [withdrawals,  setWithdrawals]  = useState([])
  const [leaderboard,  setLeaderboard]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const [s, t, w, lb] = await Promise.all([
        api.get('/referral/stats'),
        api.get('/referral/transactions'),
        api.get('/referral/withdrawals'),
        api.get('/referral/leaderboard'),
      ])
      setStats(s.stats)
      setTransactions(t.transactions || [])
      setWithdrawals(w.withdrawals   || [])
      setLeaderboard(lb.leaderboard  || [])
    } catch (err) {
      setError(err.message)
      /* Fall back to mock data so UI is always populated */
      setStats(MOCK_REFERRAL_STATS)
      setTransactions(MOCK_TRANSACTIONS)
      setWithdrawals(MOCK_WITHDRAWALS)
      setLeaderboard(MOCK_LEADERBOARD)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => { load() }, [load])

  const submitWithdrawal = async (payload) => {
    const data = await api.post('/referral/withdraw', payload)
    /* Refresh stats after withdrawal */
    load()
    return data
  }

  return { stats, transactions, withdrawals, leaderboard, loading, error, reload: load, submitWithdrawal }
}
