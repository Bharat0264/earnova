export const ACCOUNT_TYPES = [
  'individual',
  'business_owner',
  'freelancer',
  'ca_consultant',
  'product_seller',
  'energy_partner',
]

export const ONBOARDING_STATUSES = ['not_started', 'in_progress', 'skipped', 'completed']

export const normalizeEmail = value => String(value || '').trim().toLowerCase()
export const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value))
export const isStrongEnoughPassword = value => typeof value === 'string' && value.length >= 8 && value.length <= 128
export const isValidIndianPhone = value => !value || /^[6-9]\d{9}$/.test(String(value).trim())

export const normalizeIntegerList = (value, max = 20) => {
  if (!Array.isArray(value)) return []
  return [...new Set(value
    .map(Number)
    .filter(item => Number.isInteger(item) && item >= 0 && item < max))]
}

export const validateOnboardingPayload = payload => {
  const accountType = String(payload?.accountType || '')
  const status = String(payload?.status || 'in_progress')
  if (!ACCOUNT_TYPES.includes(accountType)) return { error: 'Choose a valid account type.' }
  if (!ONBOARDING_STATUSES.includes(status) || status === 'not_started') return { error: 'Choose a valid onboarding status.' }

  const goals = Array.isArray(payload?.goals)
    ? payload.goals.map(value => String(value).trim()).filter(Boolean).slice(0, 8)
    : []

  return {
    value: {
      accountType,
      status,
      goals,
      completedSteps: normalizeIntegerList(payload.completedSteps),
      skippedSteps: normalizeIntegerList(payload.skippedSteps),
    },
  }
}

