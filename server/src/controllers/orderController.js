import Order from '../models/Order.js'
import User  from '../models/User.js'
import { sendOrderStatusUpdate } from '../utils/email.js'

/* ── GET /api/orders  (my orders) ── */
export const getMyOrders = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)

    const filter = { user: req.user._id }
    if (req.query.status) filter.status = req.query.status

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.product', 'name images thumbnail slug')
        .lean(),
      Order.countDocuments(filter),
    ])

    res.json({
      success: true, total, page,
      pages: Math.ceil(total / limit) || 1,
      orders,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── GET /api/orders/:id ── */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    })
      .populate('items.product', 'name images thumbnail slug category brand')
      .populate('user', 'name email phone')

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

    /* Only owner or admin can view */
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── POST /api/orders/:id/cancel ── */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
      user: req.user._id,
    })

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

    if (!['placed', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}".`,
      })
    }

    order.status      = 'cancelled'
    order.cancelledAt = new Date()
    order.statusHistory.push({
      status: 'cancelled',
      note:   req.body.reason || 'Cancelled by customer',
    })
    await order.save()

    /* Reverse referral commission if applied */
    if (order.commissionPaid && order.referredBy && order.commissionAmount > 0) {
      await User.findByIdAndUpdate(order.referredBy, {
        $inc: {
          referralEarnings: -order.commissionAmount,
          walletBalance:    -order.commissionAmount,
        },
      })
      order.commissionPaid = false
      await order.save()
    }

    res.json({ success: true, order, message: 'Order cancelled. Refund will be processed in 5–7 business days.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── PATCH /api/orders/:id/status  (admin) ── */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingId, courier } = req.body
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    }).populate('user', 'name email')

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

    const VALID = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` })
    }

    order.status = status
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` })

    if (trackingId) order.trackingId = trackingId
    if (courier)    order.courier    = courier
    if (status === 'shipped')   order.shippedAt   = new Date()
    if (status === 'delivered') order.deliveredAt = new Date()
    if (status === 'cancelled') order.cancelledAt = new Date()

    await order.save()

    /* Email notification (non-blocking) */
    sendOrderStatusUpdate(order, order.user, status)
      .catch(err => console.warn('[Email] status-update failed:', err.message))

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── GET /api/orders  (admin — all orders) ── */
export const getAllOrders = async (req, res) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100)
    const filter = {}
    if (req.query.status)        filter.status        = req.query.status
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email phone')
        .lean(),
      Order.countDocuments(filter),
    ])

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
