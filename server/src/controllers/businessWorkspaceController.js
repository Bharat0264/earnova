import BusinessSubscription from '../models/BusinessSubscription.js'
import BusinessWorkspace from '../models/BusinessWorkspace.js'

const hasActiveAccess = (user, subscription) => user?.role === 'admin' || (
  subscription?.status === 'active' && new Date(subscription.expiresAt) > new Date()
)

const getSubscription = async user => {
  let subscription = await BusinessSubscription.findOne({ user: user._id })
  const storedAccess = user.featureAccess instanceof Map ? user.featureAccess.get('businessSolutions') : user.featureAccess?.businessSolutions
  if (!subscription && storedAccess) {
    const startsAt = new Date()
    subscription = await BusinessSubscription.create({ user: user._id, amount: 0, status: 'active', startsAt, expiresAt: new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000) })
  }
  return subscription
}

export const getBusinessWorkspace = async (req, res) => {
  try {
    const [workspace, subscriptionDoc] = await Promise.all([
      BusinessWorkspace.findOne({ user: req.user._id }).lean(),
      getSubscription(req.user),
    ])
    const subscription = subscriptionDoc?.toObject ? subscriptionDoc.toObject() : subscriptionDoc
    const active = hasActiveAccess(req.user, subscription)
    if (subscription?.status === 'active' && !active) {
      await BusinessSubscription.updateOne({ _id: subscription._id }, { status: 'expired' })
      subscription.status = 'expired'
    }
    res.json({ success: true, active, subscription, workspace })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const saveBusinessWorkspace = async (req, res) => {
  try {
    const subscription = await getSubscription(req.user)
    if (!hasActiveAccess(req.user, subscription)) {
      return res.status(403).json({ success: false, code: 'SUBSCRIPTION_REQUIRED', message: 'An active Business Solutions subscription is required.' })
    }
    const orders = Array.isArray(req.body.orders) ? req.body.orders.slice(-10000) : []
    const workspace = await BusinessWorkspace.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        sourceName: String(req.body.sourceName || 'Saved business workspace').trim(),
        profile: req.body.profile && typeof req.body.profile === 'object' ? req.body.profile : {},
        orders,
        lastImportedAt: req.body.lastImportedAt || new Date(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    res.json({ success: true, workspace, message: 'Business workspace saved securely to your account.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
