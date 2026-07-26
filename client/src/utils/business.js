export const rupeesToPaise = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null
}

export const formatMoney = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format((Number(value) || 0) / 100)

export const todayInput = () => new Date().toISOString().slice(0, 10)

export const futureDateInput = (days = 14) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
