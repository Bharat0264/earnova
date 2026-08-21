export const normalizeRazorpayOrder = response => {
  const { orderId, amount, currency, keyId } = response || {}
  const valid = typeof orderId === 'string' && orderId.trim() &&
    Number.isFinite(Number(amount)) && Number(amount) > 0 &&
    typeof currency === 'string' && currency.trim() &&
    typeof keyId === 'string' && keyId.trim()
  if (!valid) throw new Error('Unable to initialize payment. Please try again.')
  return { orderId, amount: Number(amount), currency, keyId }
}

export const checkoutTotal = (subtotal, deliveryCharge) => {
  const shipping = deliveryCharge ?? 0
  if (!Number.isFinite(Number(subtotal)) || !Number.isFinite(Number(shipping))) return null
  return Number(subtotal) + Number(shipping)
}
