import { Router } from 'express'
import { optionalAuth, protect } from '../middleware/auth.js'
import {
  createEnergyEnquiry,
  createServiceRequest,
  createTicket,
  getMyProviderProfile,
  getMySubscription,
  listMyEnergyEnquiries,
  listMyServiceRequests,
  listMyTickets,
  listNotifications,
  listPlans,
  listProviders,
  markNotificationRead,
  replyToTicket,
  reviewServiceRequest,
  saveMyProviderProfile,
  submitProposal,
  trackPlatformEvent,
  updateServiceRequest,
} from '../controllers/operationsController.js'

const router = Router()

router.get('/providers', listProviders)
router.get('/plans', listPlans)
router.post('/events', optionalAuth, trackPlatformEvent)
router.use(protect)
router.route('/provider-profile').get(getMyProviderProfile).put(saveMyProviderProfile)
router.route('/service-requests').get(listMyServiceRequests).post(createServiceRequest)
router.post('/service-requests/:id/proposals', submitProposal)
router.patch('/service-requests/:id', updateServiceRequest)
router.post('/service-requests/:id/review', reviewServiceRequest)
router.route('/energy-enquiries').get(listMyEnergyEnquiries).post(createEnergyEnquiry)
router.get('/notifications', listNotifications)
router.patch('/notifications/:id/read', markNotificationRead)
router.route('/support-tickets').get(listMyTickets).post(createTicket)
router.post('/support-tickets/:id/replies', replyToTicket)
router.get('/subscription', getMySubscription)

export default router
