const DAY_MS = 24 * 60 * 60 * 1000

export const positiveInteger = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

export const moneyPaise = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null
}

export const calculateLine = ({
  quantity,
  unitPricePaise,
  discountPaise = 0,
  taxRateBps = 0,
  integerQuantity = false,
}) => {
  const qty = Number(quantity)
  const price = moneyPaise(unitPricePaise)
  const discount = moneyPaise(discountPaise)
  const taxBps = positiveInteger(taxRateBps)

  if (!Number.isFinite(qty) || qty <= 0 || (integerQuantity && !Number.isInteger(qty))) {
    throw new Error('Quantity must be a positive number.')
  }
  if (price === null || discount === null || taxBps > 10000) {
    throw new Error('Invalid price, discount or tax rate.')
  }

  const grossPaise = Math.round(qty * price)
  if (discount > grossPaise) throw new Error('Discount cannot exceed the line amount.')
  const taxablePaise = grossPaise - discount
  const taxPaise = Math.round(taxablePaise * taxBps / 10000)
  return {
    quantity: qty,
    unitPricePaise: price,
    discountPaise: discount,
    taxRateBps: taxBps,
    taxPaise,
    lineTotalPaise: taxablePaise + taxPaise,
    grossPaise,
  }
}

export const calculateDocumentTotals = lines => {
  const subtotalPaise = lines.reduce((total, line) => total + line.grossPaise, 0)
  const discountPaise = lines.reduce((total, line) => total + line.discountPaise, 0)
  const taxPaise = lines.reduce((total, line) => total + line.taxPaise, 0)
  return {
    subtotalPaise,
    discountPaise,
    taxPaise,
    totalPaise: subtotalPaise - discountPaise + taxPaise,
  }
}

export const getDateRange = ({ preset = 'last_30_days', start, end } = {}) => {
  const now = new Date()
  const endDate = end ? new Date(end) : now
  let startDate

  if (preset === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (preset === 'last_7_days') {
    startDate = new Date(now.getTime() - 6 * DAY_MS)
  } else if (preset === 'current_quarter') {
    startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  } else if (preset === 'current_year') {
    startDate = new Date(now.getFullYear(), 0, 1)
  } else if (preset === 'custom') {
    startDate = new Date(start)
  } else {
    startDate = new Date(now.getTime() - 29 * DAY_MS)
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    throw new Error('Invalid date range.')
  }
  endDate.setHours(23, 59, 59, 999)
  return { startDate, endDate, preset }
}

export const buildBusinessRecommendations = metrics => {
  const recommendations = []

  if (metrics.lowStockCount > 0) {
    recommendations.push({
      category: 'inventory',
      summary: `${metrics.lowStockCount} product${metrics.lowStockCount === 1 ? ' is' : 's are'} at or below the reorder level.`,
      action: 'Review low-stock items and confirm demand before placing purchase orders.',
      confidence: 'High',
      basis: 'Current inventory quantities and reorder levels',
    })
  }
  if (metrics.overdueInvoicePaise > 0) {
    recommendations.push({
      category: 'cash_flow',
      summary: `Overdue invoices total ₹${(metrics.overdueInvoicePaise / 100).toLocaleString('en-IN')}.`,
      action: 'Prioritize customer follow-ups and record any payments already received.',
      confidence: 'High',
      basis: 'Invoice due dates and payment status',
    })
  }
  if (metrics.revenuePaise > 0 && metrics.expensePaise / metrics.revenuePaise > 0.8) {
    recommendations.push({
      category: 'expenses',
      summary: 'Recorded expenses are above 80% of revenue for the selected period.',
      action: 'Review the largest expense categories and validate whether costs are recurring.',
      confidence: 'Medium',
      basis: 'Recorded sales and expenses only',
    })
  }
  if (metrics.followUpsDue > 0) {
    recommendations.push({
      category: 'crm',
      summary: `${metrics.followUpsDue} lead follow-up${metrics.followUpsDue === 1 ? ' is' : 's are'} due.`,
      action: 'Contact qualified and proposal-stage leads first.',
      confidence: 'High',
      basis: 'Lead follow-up dates and stages',
    })
  }
  if (!recommendations.length) {
    recommendations.push({
      category: 'data_quality',
      summary: 'No immediate operational risk is visible in the available records.',
      action: 'Keep sales, expenses, invoices and stock updated for stronger recommendations.',
      confidence: 'Limited',
      basis: 'Available records may be incomplete',
    })
  }

  return recommendations.slice(0, 5)
}
