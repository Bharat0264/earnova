import B2BQuote from '../models/B2BQuote.js'
import User     from '../models/User.js'
import { sendEmail } from '../utils/email.js'

/* ── Email templates ── */
const adminEmailHTML = (q) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <div style="background:#5b21b6;padding:20px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">⚡ New B2B Quote Request</h2>
  </div>
  <div style="padding:24px;font-size:14px;color:#374151;line-height:1.7">
    <table style="width:100%;border-collapse:collapse">
      ${[
        ['Organization', q.organization], ['Business Type', q.businessType],
        ['Contact', `${q.name} (${q.designation || 'N/A'})`],
        ['Email', q.email], ['Phone', q.phone],
        ['Location', `${q.city}, ${q.state}`],
        ['Timeline', q.timeline || 'Not specified'],
        ['Budget', q.budget || 'Not specified'],
      ].map(([k, v]) => `<tr><td style="padding:4px 0;font-weight:600;color:#6b7280;width:35%">${k}</td><td style="padding:4px 0">${v}</td></tr>`).join('')}
    </table>
    ${q.products?.length ? `
    <div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px">
      <strong>Products Required:</strong><br>
      ${q.products.map(p => `• ${p.category}: ${p.quantity} units — ${p.specifications || 'No specs'}`).join('<br>')}
    </div>` : ''}
    ${q.message ? `<div style="margin-top:12px;padding:12px;background:#faf5ff;border-radius:8px"><strong>Message:</strong> ${q.message}</div>` : ''}
    ${q.referralCode ? `<p style="margin-top:12px;color:#7c3aed"><strong>Referral Code:</strong> ${q.referralCode}</p>` : ''}
  </div>
</div>`

const customerEmailHTML = (q) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <div style="background:linear-gradient(135deg,#5b21b6,#4c1d95);padding:24px;text-align:center">
    <span style="font-size:24px;font-weight:900;color:#fff">⚡ Earnova</span>
  </div>
  <div style="padding:28px;font-size:14px;color:#374151;line-height:1.7">
    <h2 style="color:#111827;margin:0 0 8px">Quote Request Received! 📋</h2>
    <p>Hi ${q.name.split(' ')[0]}, thanks for your bulk enquiry. Our B2B team will review your requirements and contact you within <strong>24 business hours</strong>.</p>
    <div style="background:#f5f3ff;border-radius:10px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:600;color:#5b21b6">Your enquiry summary</p>
      <p style="margin:8px 0 0;color:#374151">${q.organization} · ${q.businessType} · ${q.city}, ${q.state}</p>
    </div>
    <p style="color:#6b7280">Meanwhile, you can <a href="${process.env.CLIENT_URL || 'https://earnova.in'}/products" style="color:#5b21b6">browse our products</a> or call us at <strong>1800-XXX-XXXX</strong> (toll-free).</p>
  </div>
</div>`

/* ── POST /api/b2b/quote ── */
export const submitQuote = async (req, res) => {
  try {
    const required = ['name','email','phone','organization','businessType','state','city']
    const missing  = required.filter(k => !req.body[k])
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` })
    }

    /* Validate products array */
    const products = req.body.products || []

    /* Resolve referral */
    let referredBy = null
    if (req.body.referralCode) {
      const ref = await User.findOne({ referralCode: req.body.referralCode.trim().toUpperCase() })
      if (ref) referredBy = ref._id
    }

    const quote = await B2BQuote.create({ ...req.body, products, referredBy })

    /* Notifications (non-blocking) */
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    if (adminEmail) {
      sendEmail({ to: adminEmail, subject: `B2B Quote: ${quote.organization} — ${quote.businessType}`, html: adminEmailHTML(quote) })
        .catch(e => console.warn('[B2B Email] admin:', e.message))
    }
    sendEmail({ to: quote.email, subject: 'Your Bulk Quote Request — Earnova', html: customerEmailHTML(quote) })
      .catch(e => console.warn('[B2B Email] customer:', e.message))

    res.status(201).json({ success: true, quoteId: quote._id, message: 'Quote request submitted successfully.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── GET /api/b2b/quotes  (admin) ── */
export const getQuotes = async (req, res) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100)
    const filter = {}
    if (req.query.status)       filter.status       = req.query.status
    if (req.query.businessType) filter.businessType = req.query.businessType

    const [quotes, total] = await Promise.all([
      B2BQuote.find(filter).sort('-createdAt').skip((page-1)*limit).limit(limit).lean(),
      B2BQuote.countDocuments(filter),
    ])

    res.json({ success: true, total, page, pages: Math.ceil(total/limit), quotes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ── PATCH /api/b2b/quotes/:id  (admin) ── */
export const updateQuote = async (req, res) => {
  try {
    const { status, adminNote, quotePdfUrl, quotedAmount, followUpDate } = req.body
    const updates = {}
    if (status)       updates.status       = status
    if (adminNote)    updates.adminNote    = adminNote
    if (quotePdfUrl)  updates.quotePdfUrl  = quotePdfUrl
    if (quotedAmount) updates.quotedAmount = quotedAmount
    if (followUpDate) updates.followUpDate = followUpDate
    if (status === 'won' || status === 'lost') updates.closedAt = new Date()

    const quote = await B2BQuote.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' })

    /* If quote is now 'quoted', send PDF link to customer */
    if (status === 'quoted' && quotePdfUrl) {
      sendEmail({
        to: quote.email,
        subject: `Your Custom Quote is Ready — Earnova`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
          <h2 style="color:#5b21b6">Your Quote is Ready! 📄</h2>
          <p>Hi ${quote.name.split(' ')[0]}, your custom bulk quotation from Earnova is ready.</p>
          <a href="${quotePdfUrl}" style="display:inline-block;background:#5b21b6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:12px">View & Download Quote →</a>
          <p style="margin-top:16px;color:#6b7280">Valid for 7 days. Contact us at 1800-XXX-XXXX to discuss further.</p>
        </div>`,
      }).catch(e => console.warn('[B2B Email] quote-ready:', e.message))
    }

    res.json({ success: true, quote })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
