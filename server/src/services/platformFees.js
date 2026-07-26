import PlatformFeeSetting from '../models/PlatformFeeSetting.js'
import { DEFAULT_PLATFORM_FEES } from '../config/platformFees.js'

export const normalizeFee = fee => ({
  type: fee?.type === 'fixed' ? 'fixed' : 'percentage',
  value: Math.max(0, Number(fee?.value) || 0),
})

export const calculateFeeAmount = (baseAmount, fee) => {
  const amount = Math.max(0, Number(baseAmount) || 0)
  const normalized = normalizeFee(fee)
  return normalized.type === 'fixed'
    ? Math.round(normalized.value)
    : Math.round(amount * normalized.value / 100)
}

export const getCurrentPlatformFee = async serviceKey => {
  const fallback = DEFAULT_PLATFORM_FEES[serviceKey]
  if (!fallback) throw new Error('Unknown platform fee service.')
  const setting = await PlatformFeeSetting.findOne({ serviceKey }).lean()
  return setting ? { ...setting, source: 'admin' } : fallback
}

export const listCurrentPlatformFees = async () => {
  const saved = await PlatformFeeSetting.find({})
    .select('serviceKey label customerPartyLabel providerPartyLabel customerFee providerFee version effectiveAt')
    .lean()
  const savedByKey = Object.fromEntries(saved.map(item => [item.serviceKey, item]))
  return Object.values(DEFAULT_PLATFORM_FEES).map(item =>
    savedByKey[item.key]
      ? { ...savedByKey[item.key], key: item.key, source: 'admin' }
      : item
  )
}
