import crypto from 'crypto'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import { sanitizeFilename } from '../utils/masking.js'

const ALLOWED = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['text/csv', new Set(['.csv'])],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', new Set(['.xlsx'])],
])

const hasSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false
  if (mimeType === 'application/pdf') return buffer.subarray(0, 5).toString() === '%PDF-'
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (mimeType.includes('spreadsheetml')) return buffer[0] === 0x50 && buffer[1] === 0x4b
  if (mimeType === 'text/csv') return !buffer.includes(0)
  return false
}

export const validatePrivateFile = file => {
  if (!file?.buffer) throw Object.assign(new Error('Choose a document to upload.'), { status: 400 })
  if (file.size > 10 * 1024 * 1024) throw Object.assign(new Error('Files must be 10 MB or smaller.'), { status: 400 })
  const extension = path.extname(file.originalname || '').toLowerCase()
  if (!ALLOWED.get(file.mimetype)?.has(extension)) {
    throw Object.assign(new Error('Only PDF, JPG, PNG, CSV and XLSX documents are allowed.'), { status: 400 })
  }
  if (!hasSignature(file.buffer, file.mimetype)) {
    throw Object.assign(new Error('The file content does not match its declared type.'), { status: 400 })
  }
  return { extension, safeName: sanitizeFilename(file.originalname) }
}

export const uploadPrivateFile = async ({ file, domain, ownerId }) => {
  const { safeName } = validatePrivateFile(file)
  const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex')
  const publicId = `earnova/private/${domain}/${ownerId}/${crypto.randomUUID()}`
  const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw'
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      public_id: publicId,
      resource_type: resourceType,
      type: 'authenticated',
      use_filename: false,
      overwrite: false,
    }, (error, uploaded) => error ? reject(error) : resolve(uploaded))
    stream.end(file.buffer)
  })
  return {
    storageProvider: 'cloudinary',
    storageKey: result.public_id,
    resourceType,
    originalFilename: safeName,
    mimeType: file.mimetype,
    fileSize: file.size,
    checksum,
    malwareScanStatus: process.env.MALWARE_SCANNER_MODE === 'trusted_provider' ? 'clean' : 'pending',
  }
}

export const createPrivateDownloadUrl = ({ storageKey, resourceType = 'raw', expiresInSeconds = 300 }) => {
  const expiresAt = Math.floor(Date.now() / 1000) + Math.min(Math.max(expiresInSeconds, 60), 600)
  return cloudinary.url(storageKey, {
    resource_type: resourceType,
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  })
}

export const deletePrivateFile = ({ storageKey, resourceType = 'raw' }) =>
  cloudinary.uploader.destroy(storageKey, { resource_type: resourceType, type: 'authenticated', invalidate: true })

export const PRIVATE_FILE_MIME_TYPES = [...ALLOWED.keys()]

