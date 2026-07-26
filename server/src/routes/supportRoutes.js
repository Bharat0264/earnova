import { Router } from 'express'
import { protect, supportAgentOnly } from '../middleware/auth.js'
import { createRateLimit } from '../middleware/security.js'
import {
  createSupportTicket, getAgentTicket, getMySupportTicket, listAgentQueue,
  listMySupportTickets,
} from '../controllers/supportController.js'

const router = Router()
const ticketLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

router.use(protect)
router.get('/tickets', listMySupportTickets)
router.post('/tickets', ticketLimit, createSupportTicket)
router.get('/tickets/:ticketId', getMySupportTicket)
router.get('/agent/queue', supportAgentOnly, listAgentQueue)
router.get('/agent/tickets/:ticketId', supportAgentOnly, getAgentTicket)

export default router

