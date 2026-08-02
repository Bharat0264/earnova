import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import {
  MOCK_REFERRAL_STATS, MOCK_TRANSACTIONS,
  MOCK_WITHDRAWALS, MOCK_LEADERBOARD,
} from '../data/mockReferrals'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

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
      setStats(DEMO_MODE ? MOCK_REFERRAL_STATS : null)
      setTransactions(DEMO_MODE ? MOCK_TRANSACTIONS : [])
      setWithdrawals(DEMO_MODE ? MOCK_WITHDRAWALS : [])
      setLeaderboard(DEMO_MODE ? MOCK_LEADERBOARD : [])
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
