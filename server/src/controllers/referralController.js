import crypto     from 'crypto'
import Razorpay   from 'razorpay'
import User       from '../models/User.js'
import Order      from '../models/Order.js'
import Referral   from '../models/Referral.js'
import Withdrawal from '../models/Withdrawal.js'

/* ────────────────────────────────────────
   GET /api/referral/stats  (protected)
────────────────────────────────────────── */
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id

    const [user, clickCount, conversionCount, pendingSum] = await Promise.all([
      User.findById(userId).select('referralCode referralCount referralEarnings walletBalance'),
      Referral.countDocuments({ referrer: userId }),
      Referral.countDocuments({ referrer: userId, converted: true }),
      Referral.aggregate([
        { $match: { referrer: userId, commissionStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
    ])

    const pending = pendingSum[0]?.total || 0

    res.json({
      success: true,
      stats: {
        referralCode:     user.referralCode,
        totalClicks:      clickCount,
        totalConversions: conversionCount,
        conversionRate:   clickCount > 0 ? +((conversionCount / clickCount) * 100).toFixed(1) : 0,
        totalEarned:      user.referralEarnings || 0,
        walletBalance:    user.walletBalance    || 0,
        pendingAmount:    pending,
        totalReferrals:   user.referralCount    || 0,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/referral/transactions  (protected)
────────────────────────────────────────── */
export const getReferralTransactions = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)

    const [transactions, total] = await Promise.all([
      Referral.find({ referrer: req.user._id, converted: true })
        .sort('-convertedAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('order',   'orderId total items createdAt')
        .populate('referee', 'name')
        .lean(),
      Referral.countDocuments({ referrer: req.user._id, converted: true }),
    ])

    res.json({ success: true, total, page, transactions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/referral/leaderboard  (public)
────────────────────────────────────────── */
export const getLeaderboard = async (_req, res) => {
  try {
    const top = await User.find(
      { referralEarnings: { $gt: 0 } },
      'name referralEarnings referralCount'
    )
      .sort('-referralEarnings')
      .limit(10)
      .lean()

    /* Anonymise — show first name + last initial only */
    const board = top.map((u, i) => {
      const parts = u.name.trim().split(' ')
      const display = parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : parts[0]
      return {
        rank:     i + 1,
        name:     display,
        earned:   u.referralEarnings,
        referrals: u.referralCount,
      }
    })

    res.json({ success: true, leaderboard: board })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/referral/track/:code  (public)
   Track a referral link click
────────────────────────────────────────── */
export const trackClick = async (req, res) => {
  try {
    const { code } = req.params
    const referrer  = await User.findOne({ referralCode: code.toUpperCase() })
      .select('name referralCode').lean()

    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Invalid referral code.' })
    }

    /* Deduplicate by hashed IP + code within 24h */
    const ip     = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + code).digest('hex').slice(0, 16)
    const clickId = `${referrer._id}-${ipHash}-${Math.floor(Date.now() / 86400000)}`

    /* Upsert — don't double-count the same visitor on the same day */
    await Referral.updateOne(
      { clickId },
      {
        $setOnInsert: {
          referrer:   referrer._id,
          clickId,
          ipHash,
          clickedAt:  new Date(),
          converted:  false,
        },
      },
      { upsert: true }
    ).catch(() => {/* duplicate clickId is fine, just skip */})

    res.json({
      success: true,
      referrerName: referrer.name.split(' ')[0],
      code: referrer.referralCode,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   POST /api/referral/withdraw  (protected)
────────────────────────────────────────── */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId, accountName } = req.body
    const user = await User.findById(req.user._id)

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹100.' })
    }
    if (amount > user.walletBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${user.walletBalance}.`,
      })
    }
    if (!upiId?.trim() || !accountName?.trim()) {
      return res.status(400).json({ success: false, message: 'UPI ID and account name are required.' })
    }

    /* Deduct from wallet immediately (hold) */
    user.walletBalance -= amount
    await user.save()

    const withdrawal = await Withdrawal.create({
      user: user._id, amount, upiId: upiId.trim(), accountName: accountName.trim(),
    })

    /* Attempt Razorpay Payout if configured */
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_ACCOUNT_NUMBER) {
      try {
        await initiateRazorpayPayout(withdrawal, user)
        withdrawal.status = 'processing'
        await withdrawal.save()
      } catch (payoutErr) {
        console.warn('[Payout] Razorpay payout failed, will be processed manually:', payoutErr.message)
        /* Keep status as 'pending' for manual processing */
      }
    }

    res.status(201).json({
      success: true,
      withdrawal,
      newBalance: user.walletBalance,
      message: withdrawal.status === 'processing'
        ? 'Withdrawal initiated. Funds will arrive in 24–48 hours.'
        : 'Withdrawal request submitted. Our team will process it within 2 business days.',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   GET /api/referral/withdrawals  (protected)
────────────────────────────────────────── */
export const getWithdrawals = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
    const query = Withdrawal.find(filter)
      .sort('-createdAt')
      .limit(50)

    if (req.user.role === 'admin') {
      query.populate('user', 'name email phone walletBalance referralEarnings')
    }

    const withdrawals = await query.lean()

    res.json({ success: true, withdrawals })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   PATCH /api/referral/withdrawals/:id  (admin)
────────────────────────────────────────── */
export const updateWithdrawal = async (req, res) => {
  try {
    const { status, adminNote, failureReason } = req.body
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user')

    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found.' })

    const prev = withdrawal.status
    withdrawal.status = status
    if (adminNote)     withdrawal.adminNote = adminNote
    if (failureReason) withdrawal.failureReason = failureReason
    if (status === 'completed' || status === 'failed') withdrawal.processedAt = new Date()

    /* Refund wallet if failed */
    if (status === 'failed' && prev !== 'failed') {
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { walletBalance: withdrawal.amount },
      })
    }

    await withdrawal.save()
    res.json({ success: true, withdrawal })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ────────────────────────────────────────
   Razorpay Payouts helper (internal)
────────────────────────────────────────── */
async function initiateRazorpayPayout(withdrawal, user) {
  const rzp = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

  /* 1. Create contact */
  const contact = await rzp.contacts.create({
    name:    user.name,
    email:   user.email,
    contact: user.phone || '',
    type:    'employee',
    reference_id: `user_${user._id}`,
  })

  /* 2. Create fund account (UPI VPA) */
  const fundAccount = await rzp.fundAccount.create({
    contact_id:   contact.id,
    account_type: 'vpa',
    vpa:          { address: withdrawal.upiId },
  })

  /* 3. Create payout */
  const payout = await rzp.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account_id: fundAccount.id,
    amount:   withdrawal.amount * 100,
    currency: 'INR',
    mode:     'UPI',
    purpose:  'payout',
    queue_if_low_balance: true,
    reference_id: `EARN_WD_${withdrawal._id}`,
    narration: 'Earnova Referral Earnings',
  })

  withdrawal.razorpayPayoutId      = payout.id
  withdrawal.razorpayFundAccountId = fundAccount.id
  withdrawal.razorpayContactId     = contact.id
  await withdrawal.save()

  return payout
}
