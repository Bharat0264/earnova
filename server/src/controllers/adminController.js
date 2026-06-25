import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Withdrawal from '../models/Withdrawal.js'
import B2BQuote from '../models/B2BQuote.js'
import SubsidyRequest from '../models/SubsidyRequest.js'
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
