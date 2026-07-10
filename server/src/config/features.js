export const FEATURE_KEYS = [
  'freelancing',
  'ecommerce',
  'businessSolutions',
  'energySolutions',
  'caServices',
  'b2bPrograms',
  'subsidies',
  'referrals',
]

export const DEFAULT_PUBLIC_ACCESS = {
  freelancing: true,
  ecommerce: false,
  businessSolutions: false,
  energySolutions: false,
  caServices: false,
  b2bPrograms: false,
  subsidies: false,
  referrals: false,
}

export const normalizeFeatureAccess = (value = {}, fallback = DEFAULT_PUBLIC_ACCESS) => {
  const source = value instanceof Map ? Object.fromEntries(value) : value
  return FEATURE_KEYS.reduce((result, key) => {
    result[key] = source?.[key] === undefined ? Boolean(fallback[key]) : Boolean(source[key])
    return result
  }, {})
}
