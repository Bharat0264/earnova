import { Router } from 'express'
import multer from 'multer'
import { protect } from '../middleware/auth.js'
import { loadBusinessAccess, requireBusinessRole } from '../middleware/businessAccess.js'
import { createRateLimit } from '../middleware/security.js'
import {
  adjustInventory,
  createBusiness,
  createBusinessProduct,
  createCustomer,
  createLead,
  getBusiness,
  listBusinesses,
  listBusinessProducts,
  listCustomers,
  listLeads,
  updateBusiness,
  updateLead,
} from '../controllers/businessCoreController.js'
import {
  askBusinessAssistant,
  createExpense,
  createInvoice,
  createSale,
  getBusinessOverview,
  listExpenses,
  listInvoices,
  listSales,
  updateInvoiceStatus,
} from '../controllers/businessFinanceController.js'
import {
  downloadBusinessTemplate,
  executeBusinessImport,
  previewBusinessImport,
} from '../controllers/businessImportController.js'
import { getBlueprint, getLifecycle, initializeRoadmap, listBusinessEvents, updateRoadmapItem, upsertBlueprint } from '../controllers/businessLifecycleController.js'
import { approveRecoveryPlan, createRecoveryPlan, diagnosis, getRecoveryPlan, getStatus, rejectRecoveryPlan, reverify, verificationHistory } from '../controllers/capabilityController.js'

const router = Router()
const canWrite = requireBusinessRole('owner', 'admin', 'editor')
const canAdminister = requireBusinessRole('owner', 'admin')
const assistantLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many assistant requests. Please wait and try again.' })
const importLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many import requests. Please wait and try again.' })
const verificationLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 8, message: 'Too many verification requests. Please wait and try again.' })
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const safeName = file.originalname.toLowerCase().endsWith('.csv')
    const safeType = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.mimetype)
    callback(safeName && safeType ? null : new Error('Only CSV files up to 2 MB are allowed.'), safeName && safeType)
  },
})
const acceptCsv = (req, res, next) => csvUpload.single('file')(req, res, error => {
  if (error) return res.status(400).json({ success: false, message: error.message })
  next()
})

router.use(protect)
router.route('/').get(listBusinesses).post(createBusiness)

router.use('/:businessId', loadBusinessAccess)
router.route('/:businessId').get(getBusiness).patch(canAdminister, updateBusiness)
router.route('/:businessId/customers').get(listCustomers).post(canWrite, createCustomer)
router.route('/:businessId/leads').get(listLeads).post(canWrite, createLead)
router.patch('/:businessId/leads/:leadId', canWrite, updateLead)
router.route('/:businessId/products').get(listBusinessProducts).post(canWrite, createBusinessProduct)
router.patch('/:businessId/products/:productId/stock', canWrite, adjustInventory)
router.route('/:businessId/sales').get(listSales).post(canWrite, createSale)
router.route('/:businessId/expenses').get(listExpenses).post(canWrite, createExpense)
router.route('/:businessId/invoices').get(listInvoices).post(canWrite, createInvoice)
router.patch('/:businessId/invoices/:invoiceId/status', canWrite, updateInvoiceStatus)
router.get('/:businessId/overview', getBusinessOverview)
router.get('/:businessId/lifecycle', getLifecycle)
router.get('/:businessId/events', listBusinessEvents)
router.get('/:businessId/capabilities', getStatus)
router.post('/:businessId/capabilities/:capabilityKey/reverify', canWrite, verificationLimiter, reverify)
router.get('/:businessId/capabilities/:capabilityKey/diagnosis', diagnosis)
router.post('/:businessId/capabilities/:capabilityKey/recovery-plan', canWrite, createRecoveryPlan)
router.get('/:businessId/recovery-plans/:recoveryPlanId', getRecoveryPlan)
router.post('/:businessId/recovery-plans/:recoveryPlanId/approve', canAdminister, approveRecoveryPlan)
router.post('/:businessId/recovery-plans/:recoveryPlanId/reject', canAdminister, rejectRecoveryPlan)
router.get('/:businessId/verification-runs', verificationHistory)
router.get('/:businessId/blueprint', getBlueprint)
router.put('/:businessId/blueprint', canAdminister, upsertBlueprint)
router.post('/:businessId/roadmap', canAdminister, initializeRoadmap)
router.patch('/:businessId/roadmap/:roadmapItemId', canWrite, updateRoadmapItem)
router.post('/:businessId/assistant', assistantLimiter, askBusinessAssistant)
router.get('/:businessId/imports/:type/template', downloadBusinessTemplate)
router.post('/:businessId/imports/:type/preview', canWrite, importLimiter, acceptCsv, previewBusinessImport)
router.post('/:businessId/imports/:type/execute', canWrite, importLimiter, acceptCsv, executeBusinessImport)

export default router
