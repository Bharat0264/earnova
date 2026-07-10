import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Withdrawal from '../models/Withdrawal.js'
import B2BQuote from '../models/B2BQuote.js'
import SubsidyRequest from '../models/SubsidyRequest.js'
import FreelanceJob from '../models/FreelanceJob.js'
import FreelancerProfile from '../models/FreelancerProfile.js'
import CAProfile from '../models/CAProfile.js'
import CATaxJob from '../models/CATaxJob.js'
import ProjectListing from '../models/ProjectListing.js'
import { DEFAULT_PUBLIC_ACCESS, normalizeFeatureAccess } from '../config/features.js'

/* ────────────────────────────────────────
   GET /api/admin/stats
──────────────────────────────────────── */
export const getDashboardStats = async (_req, res) => {
  try {
    const now = new Date()
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const start6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [
      totalRevenueAgg,
      thisMonthRevenueAgg,
      lastMonthRevenueAgg,
      orderStatusAgg,
      totalUsers,
      newUsersThisMonth,
      activeProducts,
      lowStockProducts,
      withdrawalAgg,
      b2bPending,
      subsidyPending,
      monthlyRevenueAgg,
      adminMemberEarningsAgg,
      freelanceStatusAgg,
      caProfileStatusAgg,
      caTaxStatusAgg,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startThisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: {
              $gte: startLastMonth,
              $lt: startThisMonth
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      User.countDocuments({ role: 'customer' }),

      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startThisMonth }
      }),

      Product.countDocuments({ isActive: true }),

      Product.countDocuments({
        isActive: true,
        stock: { $lte: 5, $gt: 0 }
      }),

      Withdrawal.aggregate([
        {
          $facet: {
            pending: [
              { $match: { status: 'pending' } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  amount: { $sum: '$amount' }
                }
              }
            ],
            completed: [
              { $match: { status: 'completed' } },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$amount' }
                }
              }
            ]
          }
        }
      ]),

      B2BQuote.countDocuments({ status: 'pending' }),

      SubsidyRequest.countDocuments({ status: 'pending' }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: start6MonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]),

      Order.aggregate([
        { $match: { adminEarningsRecognized: true } },
        { $group: { _id: null, total: { $sum: '$adminEarningsAmount' } } }
      ]),

      FreelanceJob.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      CAProfile.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      CATaxJob.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    const MONTHS = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ]

    const monthlyRevenue = monthlyRevenueAgg.map(m => ({
      month: MONTHS[m._id.month - 1],
      revenue: m.revenue,
      orders: m.orders
    }))

    const statusMap = {}
    orderStatusAgg.forEach(s => {
      statusMap[s._id] = s.count
    })
    const freelanceStatusMap = {}
    freelanceStatusAgg.forEach(s => {
      freelanceStatusMap[s._id] = s.count
    })
    const caProfileStatusMap = {}
    caProfileStatusAgg.forEach(s => {
      caProfileStatusMap[s._id] = s.count
    })
    const caTaxStatusMap = {}
    caTaxStatusAgg.forEach(s => {
      caTaxStatusMap[s._id] = s.count
    })

    const wdPending = withdrawalAgg[0]?.pending?.[0] || {
      count: 0,
      amount: 0
    }

    const wdCompleted = withdrawalAgg[0]?.completed?.[0] || {
      total: 0
    }

    const totalRev = totalRevenueAgg[0]?.total || 0
    const thisRev = thisMonthRevenueAgg[0]?.total || 0
    const lastRev = lastMonthRevenueAgg[0]?.total || 0

    const revGrowth =
      lastRev > 0
        ? +(((thisRev - lastRev) / lastRev) * 100).toFixed(1)
        : 0

    res.json({
      success: true,
      stats: {
        revenue: {
          total: totalRev,
          thisMonth: thisRev,
          lastMonth: lastRev,
          growth: revGrowth
        },
        orders: {
          total: Object.values(statusMap).reduce((a, b) => a + b, 0),
          pending: (statusMap.placed || 0) + (statusMap.received || 0) + (statusMap.processing || 0),
          shipped: statusMap.shipped || 0,
          delivered: statusMap.delivered || 0,
          cancelled: statusMap.cancelled || 0,
          thisMonth: 0
        },
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth
        },
        products: {
          active: activeProducts,
          lowStock: lowStockProducts
        },
        withdrawals: {
          pending: wdPending.count,
          pendingAmount: wdPending.amount,
          totalPaid: wdCompleted.total
        },
        adminEarnings: {
          memberIncome: adminMemberEarningsAgg[0]?.total || 0
        },
        b2bPending,
        subsidyPending,
        freelanceJobs: {
          total: Object.values(freelanceStatusMap).reduce((a, b) => a + b, 0),
          awaitingPayment: freelanceStatusMap['awaiting-payment'] || 0,
          open: freelanceStatusMap.open || 0,
          inProgress: freelanceStatusMap['in-progress'] || 0,
          submitted: freelanceStatusMap.submitted || 0,
          completed: freelanceStatusMap.completed || 0,
        },
        caWork: {
          pendingProfiles: caProfileStatusMap.pending || 0,
          verifiedProfiles: caProfileStatusMap.verified || 0,
          activeTaxJobs: (caTaxStatusMap.submitted || 0)
            + (caTaxStatusMap['under-review'] || 0)
            + (caTaxStatusMap['documents-needed'] || 0)
            + (caTaxStatusMap.verified || 0)
            + (caTaxStatusMap.filed || 0),
          completedTaxJobs: caTaxStatusMap.completed || 0,
        },
        monthlyRevenue
      }
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/* ────────────────────────────────────────
   GET /api/admin/users
──────────────────────────────────────── */
export const getAdminUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 25, 100)

    const filter = {}

    if (req.query.role) {
      filter.role = req.query.role
    }

    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i')
      filter.$or = [
        { name: re },
        { email: re }
      ]
    }

    const [rawUsers, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ])
    const users = rawUsers.map(user => ({
      ...user,
      featureAccess: normalizeFeatureAccess(user.featureAccess, DEFAULT_PUBLIC_ACCESS),
    }))

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/* ────────────────────────────────────────
   POST /api/admin/users
   Create Member
──────────────────────────────────────── */
export const createAdminUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'customer',
      featureAccess
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists.'
      })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      role,
      featureAccess: normalizeFeatureAccess(featureAccess, DEFAULT_PUBLIC_ACCESS),
      isActive: true
    })

    res.status(201).json({
      success: true,
      user: user.toPublicJSON()
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/* ────────────────────────────────────────
   PATCH /api/admin/users/:id
──────────────────────────────────────── */
export const updateAdminUser = async (req, res) => {
  try {
    const allowed = ['role', 'isActive']

    const updates = {}

    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    })

    if (req.body.featureAccess !== undefined) {
      updates.featureAccess = normalizeFeatureAccess(req.body.featureAccess, DEFAULT_PUBLIC_ACCESS)
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    res.json({
      success: true,
      user: user.toPublicJSON()
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

export const getAdminFreelanceJobs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const filter = {}

    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status
    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') filter.paymentStatus = req.query.paymentStatus
    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i')
      filter.$or = [
        { jobId: re },
        { title: re },
        { clientName: re },
        { clientEmail: re },
        { category: re },
      ]
    }

    const [jobs, total, freelancers] = await Promise.all([
      FreelanceJob.find(filter)
        .populate('client', 'name email phone role')
        .populate({
          path: 'assignedFreelancer',
          select: 'name email whatsapp phone title city skills status user',
          populate: { path: 'user', select: 'name email phone role' },
        })
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      FreelanceJob.countDocuments(filter),
      FreelancerProfile.find({ status: { $in: ['verified', 'pending'] } })
        .select('name email whatsapp phone title city skills status user')
        .populate('user', 'name email phone role')
        .sort({ status: 1, name: 1 })
        .lean(),
    ])

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      jobs,
      freelancers,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateAdminFreelanceJob = async (req, res) => {
  try {
    const allowedStatuses = ['awaiting-payment', 'open', 'in-progress', 'submitted', 'completed', 'cancelled', 'disputed']
    const updates = {}
    const history = []

    if (req.body.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid freelance job status.' })
      }
      updates.status = req.body.status
      if (req.body.status === 'completed') updates.completedAt = new Date()
      history.push({ status: req.body.status, note: `Admin changed status to ${req.body.status}.` })
    }

    if (req.body.assignedFreelancer !== undefined) {
      if (req.body.assignedFreelancer) {
        const profile = await FreelancerProfile.findById(req.body.assignedFreelancer)
        if (!profile) return res.status(404).json({ success: false, message: 'Freelancer profile not found.' })
        updates.assignedFreelancer = profile._id
        if (!updates.status) updates.status = 'in-progress'
        history.push({ status: updates.status || 'in-progress', note: `Assigned to ${profile.name}.` })
      } else {
        updates.assignedFreelancer = null
        history.push({ status: req.body.status || 'open', note: 'Freelancer assignment removed.' })
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid updates provided.' })
    }

    const updateDoc = { $set: updates }
    if (history.length) updateDoc.$push = { statusHistory: { $each: history } }

    const job = await FreelanceJob.findByIdAndUpdate(
      req.params.id,
      updateDoc,
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone role')
      .populate({
        path: 'assignedFreelancer',
        select: 'name email whatsapp phone title city skills status user',
        populate: { path: 'user', select: 'name email phone role' },
      })
      .lean()

    if (!job) return res.status(404).json({ success: false, message: 'Freelance job not found.' })
    res.json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getAdminCAProfiles = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const filter = {}

    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status
    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i')
      filter.$or = [
        { name: re },
        { email: re },
        { whatsapp: re },
        { membershipNumber: re },
        { firmName: re },
        { city: re },
      ]
    }

    const [profiles, total] = await Promise.all([
      CAProfile.find(filter)
        .populate('user', 'name email phone role')
        .populate('verifiedBy', 'name email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CAProfile.countDocuments(filter),
    ])

    res.json({ success: true, profiles, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateAdminCAProfile = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'verified', 'paused', 'rejected']
    const updates = {}

    if (req.body.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid CA profile status.' })
      }
      updates.status = req.body.status
      updates.verifiedAt = req.body.status === 'verified' ? new Date() : null
      updates.verifiedBy = req.body.status === 'verified' ? req.user._id : null
    }

    if (req.body.adminNote !== undefined) updates.adminNote = String(req.body.adminNote || '').trim()

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid updates provided.' })
    }

    const profile = await CAProfile.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone role')
      .populate('verifiedBy', 'name email')
      .lean()

    if (!profile) return res.status(404).json({ success: false, message: 'CA profile not found.' })
    res.json({ success: true, profile })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getAdminCATaxJobs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const filter = {}

    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status
    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i')
      filter.$or = [
        { jobId: re },
        { clientName: re },
        { clientEmail: re },
        { clientWhatsapp: re },
        { pan: re },
        { filingType: re },
      ]
    }

    const [jobs, total, caProfiles] = await Promise.all([
      CATaxJob.find(filter)
        .populate('client', 'name email phone role')
        .populate({
          path: 'assignedCA',
          select: 'name email whatsapp phone firmName membershipNumber city state specializations status user',
          populate: { path: 'user', select: 'name email phone role' },
        })
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CATaxJob.countDocuments(filter),
      CAProfile.find({ status: 'verified' })
        .select('name email whatsapp phone firmName membershipNumber city state specializations status user')
        .populate('user', 'name email phone role')
        .sort({ name: 1 })
        .lean(),
    ])

    res.json({ success: true, jobs, caProfiles, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateAdminCATaxJob = async (req, res) => {
  try {
    const allowedStatuses = ['submitted', 'under-review', 'documents-needed', 'verified', 'filed', 'completed', 'cancelled']
    const updates = {}
    const history = []

    if (req.body.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid CA tax job status.' })
      }
      updates.status = req.body.status
      if (req.body.status === 'completed') updates.completedAt = new Date()
      history.push({ status: req.body.status, note: `Admin changed status to ${req.body.status}.` })
    }

    if (req.body.assignedCA !== undefined) {
      if (req.body.assignedCA) {
        const currentJob = await CATaxJob.findById(req.params.id).select('paymentStatus')
        if (!currentJob) return res.status(404).json({ success: false, message: 'CA tax job not found.' })
        if (!['paid', 'admin-waived'].includes(currentJob.paymentStatus)) {
          return res.status(400).json({ success: false, message: 'CA work can be assigned only after payment is confirmed.' })
        }
        const profile = await CAProfile.findById(req.body.assignedCA)
        if (!profile) return res.status(404).json({ success: false, message: 'CA profile not found.' })
        if (profile.status !== 'verified') {
          return res.status(400).json({ success: false, message: 'Only verified Earnova CAs can be assigned.' })
        }
        updates.assignedCA = profile._id
        if (!updates.status) updates.status = 'under-review'
        history.push({ status: updates.status || 'under-review', note: `Assigned to CA ${profile.name}.` })
      } else {
        updates.assignedCA = null
        history.push({ status: req.body.status || 'submitted', note: 'CA assignment removed.' })
      }
    }

    if (req.body.caNotes !== undefined) updates.caNotes = String(req.body.caNotes || '').trim()
    if (req.body.adminNote !== undefined) updates.adminNote = String(req.body.adminNote || '').trim()

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid updates provided.' })
    }

    const updateDoc = { $set: updates }
    if (history.length) updateDoc.$push = { statusHistory: { $each: history } }

    let job = await CATaxJob.findByIdAndUpdate(
      req.params.id,
      updateDoc,
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone role')
      .populate({
        path: 'assignedCA',
        select: 'name email whatsapp phone firmName membershipNumber city state specializations status user',
        populate: { path: 'user', select: 'name email phone role' },
      })
      .lean()

    if (!job) return res.status(404).json({ success: false, message: 'CA tax job not found.' })

    if (job.status === 'completed' && job.assignedCA?.user?._id && !job.caPayoutCreditedAt) {
      const creditedJob = await CATaxJob.findOneAndUpdate(
        { _id: job._id, caPayoutCreditedAt: null },
        {
          $set: { caPayoutCreditedAt: new Date() },
          $push: {
            statusHistory: {
              status: 'completed',
              note: `Admin marked CA work completed. CA wallet credited INR ${job.caPayoutAmount || 0}.`,
            },
          },
        },
        { new: true }
      )

      if (creditedJob) {
        await User.findByIdAndUpdate(job.assignedCA.user._id, { $inc: { walletBalance: job.caPayoutAmount || 0 } })
        job = await CATaxJob.findById(job._id)
          .populate('client', 'name email phone role')
          .populate({
            path: 'assignedCA',
            select: 'name email whatsapp phone firmName membershipNumber city state specializations status user',
            populate: { path: 'user', select: 'name email phone role' },
          })
          .lean()
      }
    }

    res.json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getAdminProjectListings = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const filter = {}

    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status
    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i')
      filter.$or = [
        { listingId: re },
        { title: re },
        { category: re },
        { sellerName: re },
        { sellerEmail: re },
        { sellerWhatsapp: re },
      ]
    }

    const [listings, total] = await Promise.all([
      ProjectListing.find(filter)
        .populate('seller', 'name email phone walletBalance')
        .populate('buyer', 'name email phone')
        .populate('approvedBy', 'name email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProjectListing.countDocuments(filter),
    ])

    res.json({ success: true, listings, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateAdminProjectListing = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'approved', 'rejected', 'sold', 'paused']
    const updates = {}

    if (req.body.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid project listing status.' })
      }
      updates.status = req.body.status
      if (req.body.status === 'approved') {
        updates.approvedAt = new Date()
        updates.approvedBy = req.user._id
      }
    }

    if (req.body.adminNote !== undefined) updates.adminNote = String(req.body.adminNote || '').trim()
    if (req.body.price !== undefined) {
      const price = Math.round(Number(req.body.price) || 0)
      if (price < 100) return res.status(400).json({ success: false, message: 'Price must be at least INR 100.' })
      updates.price = price
      updates.sellerPayout = price
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid updates provided.' })
    }

    const listing = await ProjectListing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('seller', 'name email phone walletBalance')
      .populate('buyer', 'name email phone')
      .populate('approvedBy', 'name email')
      .lean()

    if (!listing) return res.status(404).json({ success: false, message: 'Project listing not found.' })
    res.json({ success: true, listing })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
