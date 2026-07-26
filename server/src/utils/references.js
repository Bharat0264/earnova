import crypto from 'crypto'

export const createPublicReference = (domain, date = new Date()) => {
  const year = date.getUTCFullYear()
  const sequenceLike = crypto.randomInt(0, 100000).toString().padStart(5, '0')
  return `EN-${domain}-${year}-${sequenceLike}`
}

