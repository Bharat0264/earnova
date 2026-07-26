import { Router } from 'express'
import multer from 'multer'
import { protect } from '../middleware/auth.js'
import { createRateLimit } from '../middleware/security.js'
import { PRIVATE_FILE_MIME_TYPES } from '../services/privateStorage.js'
import {
  getCaseDocumentDownload, getSupportAttachmentDownload, uploadCaseDocument,
  uploadSupportAttachment,
} from '../controllers/privateFileController.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, PRIVATE_FILE_MIME_TYPES.includes(file.mimetype)),
})
const uploadLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 })

router.use(protect)
router.post('/ca-cases/:caseId/documents', uploadLimit, upload.single('document'), uploadCaseDocument)
router.post('/support-tickets/:ticketId/attachments', uploadLimit, upload.single('attachment'), uploadSupportAttachment)
router.get('/ca-documents/:documentId/download', getCaseDocumentDownload)
router.get('/support-attachments/:attachmentId/download', getSupportAttachmentDownload)

export default router
