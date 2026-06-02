import SubsidyRequest from '../models/SubsidyRequest.js'
import { sendEmail }   from '../utils/email.js'

/* ── Eligibility + subsidy calculation ── */
function calcSubsidy(systemSize) {
  const kw = Math.min(Math.max(Number(systemSize) || 0, 0), 10)
  if (kw <= 0)  return 0
  if (kw <= 1)  return 30000
  if (kw <= 2)  return 60000
  return 78000 // max for 3 kW and above
}

function calcAnnualSavings(systemSize, tariff = 8) {
  const kw         = Number(systemSize) || 0
  const generation = kw * 4 * 365  // 4 peak sun hours/day
  return Math.round(generation * tariff)
}

/* ── POST /api/subsidy/check-eligibility ── */
export const checkEligibility = (req, res) => {
  const { state, propertyType, hasElectricity, existingSolar, systemSize } = req.body

  const reasons = []
  if (!state)                          reasons.push('State is required for eligibility check')
  if (propertyType !== 'owned')        reasons.push('Subsidy is only available for property owners (not renters)')
  if (hasElectricity !== 'yes')        reasons.push('An active electricity connection in your name is required')
  if (existingSolar === 'yes')         reasons.push('PM Surya Ghar subsidy is not available for expanded/existing solar systems')

  const isEligible      = reasons.length === 0
  const subsidy         = isEligible ? calcSubsidy(systemSize) : 0
  const annualSavings   = calcAnnualSavings(systemSize)
  const annualGeneration = Math.round((Number(systemSize) || 0) * 4 * 365)
  const paybackYears    = subsidy > 0
    ? Math.round(((Number(systemSize) || 0) * 45000 - subsidy) / annualSavings * 10) / 10
    : null

  res.json({
    success: true,
    isEligible,
    subsidy,
    systemSize: Number(systemSize) || 0,
    annualSavings,
    annualGeneration,
    paybackYears,
    reasons,
    /* State-level info */
    stateBonusNote: getStateBonusNote(state),
  })
}

/* ── POST /api/subsidy/request ── */
export const submitRequest = async (req, res) => {
  try {
    const required = ['name', 'email', 'phone', 'state']
    const missing  = required.filter(k => !req.body[k])
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    }

    /* Auto-compute eligibility */
    const { propertyType, existingSolar, systemSize } = req.body
    const isEligible = propertyType === 'owned' && existingSolar !== 'yes'
    const estimatedSubsidy = isEligible ? calcSubsidy(systemSize) : 0

    const request = await SubsidyRequest.create({
      ...req.body, isEligible, estimatedSubsidy,
    })

    /* Admin notification */
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New Subsidy Request: ${request.name} — ${request.state}`,
        html: `<div style="font-family:sans-serif;max-width:600px;padding:24px">
          <h2 style="color:#5b21b6">New Solar Subsidy Assistance Request</h2>
          <p><strong>Name:</strong> ${request.name}</p>
          <p><strong>Email:</strong> ${request.email} | <strong>Phone:</strong> ${request.phone}</p>
          <p><strong>State:</strong> ${request.state} | <strong>City:</strong> ${request.city || 'N/A'}</p>
          <p><strong>System Size:</strong> ${request.systemSize || 'N/A'} kW</p>
          <p><strong>Assistance Type:</strong> ${request.assistanceType || 'Not specified'}</p>
          <p><strong>Estimated Subsidy:</strong> ₹${estimatedSubsidy.toLocaleString('en-IN')}</p>
          ${request.message ? `<p><strong>Message:</strong> ${request.message}</p>` : ''}
        </div>`,
      }).catch(e => console.warn('[Subsidy Email] admin:', e.message))
    }

    /* Customer confirmation */
    sendEmail({
      to: request.email,
      subject: 'Solar Subsidy Assistance Request Received — Earnova',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:20px;border-radius:10px;text-align:center;margin-bottom:20px">
          <span style="font-size:22px;font-weight:900;color:#fff">⚡ Earnova</span>
        </div>
        <h2 style="color:#111827">Request Received! ☀️</h2>
        <p>Hi ${request.name.split(' ')[0]}, thanks for reaching out. Our solar subsidy expert will contact you within 48 hours.</p>
        ${isEligible ? `<div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:10px;padding:14px;margin:16px 0">
          <p style="margin:0;font-weight:700;color:#065f46">✅ Based on your details, you appear ELIGIBLE for PM Surya Ghar subsidy</p>
          <p style="margin:6px 0 0;color:#064e3b;font-size:13px">Estimated subsidy: ₹${estimatedSubsidy.toLocaleString('en-IN')}</p>
        </div>` : ''}
        <p style="color:#6b7280;font-size:13px">Questions? Visit <a href="${process.env.CLIENT_URL || 'https://earnova.in'}/subsidy" style="color:#059669">earnova.in/subsidy</a></p>
      </div>`,
    }).catch(e => console.warn('[Subsidy Email] customer:', e.message))

    res.status(201).json({
      success: true,
      requestId: request._id,
      isEligible,
      estimatedSubsidy,
      message: 'Request submitted. Our expert will contact you within 48 hours.',
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── GET /api/subsidy/requests  (admin) ── */
export const getRequests = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.state)  filter.state  = req.query.state

    const [requests, total] = await Promise.all([
      SubsidyRequest.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit).lean(),
      SubsidyRequest.countDocuments(filter),
    ])
    res.json({ success: true, total, page, pages: Math.ceil(total/limit), requests })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── PATCH /api/subsidy/requests/:id  (admin) ── */
export const updateRequest = async (req, res) => {
  try {
    const request = await SubsidyRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' })
    res.json({ success: true, request })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── State bonus helper ── */
function getStateBonusNote(state) {
  const bonuses = {
    'Gujarat':       'Gujarat also offers additional ₹10,000 state subsidy through GEDA.',
    'Rajasthan':     'Rajasthan offers additional state subsidies through RRECL for rural households.',
    'Uttar Pradesh': 'UP government offers additional 30% capital subsidy for farmers (Kisan).',
    'Maharashtra':   'Maharashtra has net-metering policy; excess units credited at ₹3/unit.',
    'Karnataka':     'Karnataka offers state-level subsidy for SC/ST households through KREDL.',
  }
  return bonuses[state] || null
}
