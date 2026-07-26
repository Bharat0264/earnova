import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'

const BusinessContext = createContext(null)
const SELECTED_KEY = 'earnova_selected_business'

export function BusinessProvider({ children }) {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => localStorage.getItem(SELECTED_KEY) || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/businesses')
      const next = data?.businesses || []
      setBusinesses(next)
      setSelectedBusinessId(current => {
        const valid = next.some(business => business._id === current)
        const selected = valid ? current : next[0]?._id || ''
        if (selected) localStorage.setItem(SELECTED_KEY, selected)
        else localStorage.removeItem(SELECTED_KEY)
        return selected
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshBusinesses()
  }, [refreshBusinesses])

  const selectBusiness = useCallback(id => {
    setSelectedBusinessId(id)
    if (id) localStorage.setItem(SELECTED_KEY, id)
  }, [])

  const createBusiness = useCallback(async payload => {
    const data = await api.post('/businesses', payload)
    setBusinesses(current => [data.business, ...current])
    selectBusiness(data.business._id)
    return data.business
  }, [selectBusiness])

  const selectedBusiness = businesses.find(business => business._id === selectedBusinessId) || null
  const value = useMemo(() => ({
    businesses,
    selectedBusiness,
    selectedBusinessId,
    loading,
    error,
    createBusiness,
    refreshBusinesses,
    selectBusiness,
  }), [businesses, selectedBusiness, selectedBusinessId, loading, error, createBusiness, refreshBusinesses, selectBusiness])

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) throw new Error('useBusiness must be used inside BusinessProvider')
  return context
}
