const compact = value => String(value || '').replace(/\s+/g, '').toUpperCase()

export const maskPan = value => {
  const pan = compact(value)
  if (!pan) return ''
  if (pan.length < 5) return '*'.repeat(pan.length)
  return `${pan.slice(0, 2)}${'*'.repeat(Math.max(1, pan.length - 4))}${pan.slice(-2)}`
}

export const maskGovernmentId = value => {
  const id = compact(value)
  if (!id) return ''
  return `${'*'.repeat(Math.max(4, id.length - 4))}${id.slice(-4)}`
}

export const sanitizeFilename = value => {
  const cleaned = String(value || 'document')
    .replace(/[^\w.\- ()]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.\-\s]+/, '')
    .slice(0, 180)
  return cleaned || 'document'
}
