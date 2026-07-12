import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer  - File buffer from multer
 * @param {string} folder  - Cloudinary folder path (e.g. 'earnova/products/abc123')
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export const uploadDocumentToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '-')}` },
      (error, result) => {
        if (error) reject(error)
        else resolve({ secure_url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type })
      }
    )
    stream.end(buffer)
  })
}

/**
 * Delete an asset from Cloudinary by public_id.
 */
export const deleteFromCloudinary = (publicId, resourceType = 'image') =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType })

export default cloudinary
