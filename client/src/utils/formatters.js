/** Format a number as Indian Rupee currency */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

/** Discount percentage off MRP */
export const discountPercent = (price, mrp) => {
  if (!mrp || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

/** Amount saved vs MRP */
export const savedAmount = (price, mrp) => (mrp && mrp > price ? mrp - price : 0)

/** GST amount on a price */
export const calcGST = (price, gstRate = 18) => Math.round((price * gstRate) / 100)

/** Shipping cost (free above ₹5,000) */
export const shippingCost = (subtotal) => (subtotal >= 5000 ? 0 : 150)

/** Truncate text to maxLength with ellipsis */
export const truncate = (text = '', max = 60) =>
  text.length > max ? text.slice(0, max).trim() + '…' : text

/** Human-readable date in Indian locale */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

/** Convert text to URL-friendly slug */
export const slugify = (text = '') =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

/** Clamp a number between min and max */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/** Category display labels */
export const CATEGORY_LABELS = {
  'solar-panels': 'Solar Panels',
  'fans':         'Fans',
  'acs':          'ACs',
  'accessories':  'Accessories',
}

/** Category gradient bg classes for image placeholders */
export const CATEGORY_PLACEHOLDER_BG = {
  'solar-panels': 'from-yellow-950 via-slate-900 to-slate-800',
  'fans':         'from-indigo-950 via-purple-900 to-indigo-900',
  'acs':          'from-sky-950 via-blue-900 to-cyan-900',
  'accessories':  'from-emerald-950 via-teal-900 to-emerald-900',
}
