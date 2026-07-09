export const FEATURE_KEYS = ['freelancing', 'ecommerce', 'businessSolutions']

export const DEFAULT_PUBLIC_ACCESS = {
  freelancing: true,
  ecommerce: false,
  businessSolutions: true,
}

export const normalizeFeatureAccess = (value = {}, fallback = DEFAULT_PUBLIC_ACCESS) => {
  const source = value instanceof Map ? Object.fromEntries(value) : value
  return FEATURE_KEYS.reduce((result, key) => {
    result[key] = source?.[key] === undefined ? Boolean(fallback[key]) : Boolean(source[key])
    return result
  }, {})
}
