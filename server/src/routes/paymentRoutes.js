import { Router }  from 'express'
import express     from 'express'
import {
  createRazorpayOrder, verifyPayment, createCodOrder, createBusinessSubscriptionOrder,
  verifyBusinessSubscription, handleWebhook,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/create-order', protect, createRazorpayOrder)
router.post('/cod-order',    protect, createCodOrder)
router.post('/verify',       protect, verifyPayment)
router.post('/business-subscription/create-order', protect, createBusinessSubscriptionOrder)
router.post('/business-subscription/verify',       protect, verifyBusinessSubscription)

/* Webhook — raw body for signature verification */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

export default router
