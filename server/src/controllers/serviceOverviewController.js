import BusinessSubscription from '../models/BusinessSubscription.js'
import BusinessWorkspace from '../models/BusinessWorkspace.js'
import CATaxJob from '../models/CATaxJob.js'
import FreelanceJob from '../models/FreelanceJob.js'
import Order from '../models/Order.js'
import ProjectListing from '../models/ProjectListing.js'
import Withdrawal from '../models/Withdrawal.js'

export const getMyServiceOverview = async (req, res) => {
  try {
    const userId = req.user._id
    const [subscription, workspace, caJobs, freelanceJobs, purchases, listings, orders, withdrawals] = await Promise.all([
      BusinessSubscription.findOne({ user: userId }).lean(),
      BusinessWorkspace.findOne({ user: userId }).select('sourceName orders updatedAt').lean(),
      CATaxJob.find({ client: userId }).select('jobId serviceLabel status paymentStatus assignedCA updatedAt').populate('assignedCA', 'name').sort('-updatedAt').limit(8).lean(),
      FreelanceJob.find({ client: userId }).select('jobId title status paymentStatus updatedAt').sort('-updatedAt').limit(8).lean(),
      ProjectListing.find({ buyer: userId }).select('listingId title status price soldAt').sort('-soldAt').limit(8).lean(),
      ProjectListing.find({ seller: userId }).select('listingId title status price updatedAt').sort('-updatedAt').limit(8).lean(),
      Order.find({ user: userId }).select('orderId status paymentStatus total items createdAt').sort('-createdAt').limit(8).lean(),
      Withdrawal.find({ user: userId }).select('source amount status createdAt').sort('-createdAt').limit(8).lean(),
    ])

    const businessActive = subscription?.status === 'active' && new Date(subscription.expiresAt) > new Date()
    res.json({
      success: true,
      overview: {
        walletBalance: req.user.walletBalance || 0,
        business: { subscription, active: businessActive, sourceName: workspace?.sourceName, rows: workspace?.orders?.length || 0, updatedAt: workspace?.updatedAt },
        caJobs,
        freelanceJobs,
        projectPurchases: purchases,
        projectListings: listings,
        orders,
        withdrawals,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
