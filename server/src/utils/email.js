import nodemailer from 'nodemailer'

/* ── Transporter ── */
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const FROM = process.env.EMAIL_FROM || 'Earnova <noreply@earnova.in>'

/* ── Base send helper ── */
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: FROM, to, subject, html })
}

export const sendFreelanceJobPostedEmail = async (user, job) => {
  const baseUrl = (process.env.CLIENT_URL || 'https://earnova.in').replace(/\/+$/, '')
  const jobUrl = `${baseUrl}/freelance?job=${job._id}`
  const skills = (job.skills || []).length ? job.skills.join(', ') : 'Open to relevant skills'
  const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN') : 'Flexible'

  const html = layout(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px">New freelance job posted</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
      Hi ${user.name.split(' ')[0]}, a new Earnova freelance job is open for active members.
    </p>

    <div style="background:#f5f3ff;border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Job</p>
      <p style="color:#111827;font-size:20px;font-weight:900;margin:0">${job.title}</p>
      <p style="color:#6b7280;font-size:13px;margin:8px 0 0">${job.category} - ${job.workMode} - ${job.duration}</p>
    </div>

    <table style="width:100%;margin-bottom:20px">
      <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Freelancer payout</td><td style="text-align:right;font-size:13px;color:#111827;font-weight:700">INR ${job.freelancerAmount.toLocaleString('en-IN')}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Skills</td><td style="text-align:right;font-size:13px;color:#111827">${skills}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Deadline</td><td style="text-align:right;font-size:13px;color:#111827">${deadline}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Reference</td><td style="text-align:right;font-size:13px;color:#111827">${job.jobId}</td></tr>
    </table>

    <div style="background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#374151">
      <p style="font-weight:700;margin:0 0 6px">Work details</p>
      <p style="margin:0;line-height:1.6">${String(job.description || '').slice(0, 700)}</p>
    </div>

    <a href="${jobUrl}"
       style="display:inline-block;background:#5b21b6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      View freelance job
    </a>`)

  await sendEmail({
    to: user.email,
    subject: `New freelance job: ${job.title}`,
    html,
  })
}

/* ── Layout wrapper ── */
const layout = (content) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif}a{color:#5b21b6}</style>
</head><body>
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#5b21b6,#4c1d95);padding:28px 32px;text-align:center">
    <span style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px">⚡ Earnova</span>
    <p style="color:#c4b5fd;font-size:13px;margin:4px 0 0">Smart Energy Products for India</p>
  </div>
  <div style="padding:32px">${content}</div>
  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Earnova Energy · <a href="#">Unsubscribe</a></p>
  </div>
</div></body></html>`

/* ── Welcome email ── */
export const sendWelcomeEmail = async (user) => {
  const html = layout(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px">Welcome to Earnova, ${user.name.split(' ')[0]}! 🎉</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
      You're now part of India's fastest-growing energy-saving community.
      Shop premium solar panels, BLDC fans, 5-star ACs, and earn through referrals.
    </p>
    <div style="background:#f5f3ff;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#5b21b6;font-size:12px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">YOUR REFERRAL CODE</p>
      <p style="color:#111827;font-size:24px;font-weight:900;margin:0;letter-spacing:2px">${user.referralCode}</p>
      <p style="color:#7c3aed;font-size:12px;margin:4px 0 0">Share to earn commission on every sale</p>
    </div>
    <table style="width:100%;margin-bottom:24px">
      <tr>
        <td style="padding:8px;background:#ecfdf5;border-radius:8px;text-align:center;width:33%">
          <p style="margin:0;font-size:18px">☀️</p>
          <p style="margin:4px 0 0;font-size:12px;color:#065f46;font-weight:600">Solar Subsidy</p>
        </td>
        <td style="width:8px"></td>
        <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:33%">
          <p style="margin:0;font-size:18px">💰</p>
          <p style="margin:4px 0 0;font-size:12px;color:#065f46;font-weight:600">Earn Commissions</p>
        </td>
        <td style="width:8px"></td>
        <td style="padding:8px;background:#faf5ff;border-radius:8px;text-align:center;width:33%">
          <p style="margin:0;font-size:18px">📦</p>
          <p style="margin:4px 0 0;font-size:12px;color:#5b21b6;font-weight:600">Bulk Orders</p>
        </td>
      </tr>
    </table>
    <a href="${process.env.CLIENT_URL || 'https://earnova.in'}/products"
       style="display:inline-block;background:#5b21b6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Start Shopping →
    </a>`)

  await sendEmail({ to: user.email, subject: `Welcome to Earnova, ${user.name.split(' ')[0]}!`, html })
}

/* ── Order confirmation email ── */
export const sendOrderConfirmation = async (order, user) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
        <p style="margin:0;font-size:13px;font-weight:600;color:#111827">${item.name}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#9ca3af">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;font-weight:700;color:#111827;white-space:nowrap">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`).join('')

  const addr = order.shippingAddress
  const html = layout(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 4px">Order Confirmed! ✅</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Hi ${user.name.split(' ')[0]}, your order has been placed successfully.</p>
    
    <div style="background:#f5f3ff;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0">Order ID</p>
        <p style="color:#111827;font-size:18px;font-weight:900;margin:2px 0 0">${order.orderId}</p>
      </div>
      <div style="text-align:right">
        <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0">Est. Delivery</p>
        <p style="color:#111827;font-size:13px;font-weight:700;margin:2px 0 0">5–7 business days</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">${itemsHTML}</table>

    <table style="width:100%;margin-bottom:20px">
      <tr><td style="font-size:13px;color:#6b7280;padding:3px 0">Subtotal</td><td style="text-align:right;font-size:13px;color:#111827">₹${order.subtotal.toLocaleString('en-IN')}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding:3px 0">GST</td><td style="text-align:right;font-size:13px;color:#111827">₹${order.gstAmount.toLocaleString('en-IN')}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding:3px 0">Shipping</td><td style="text-align:right;font-size:13px;color:#059669">${order.shippingCharge === 0 ? 'Free' : '₹' + order.shippingCharge}</td></tr>
      <tr style="border-top:2px solid #e5e7eb"><td style="font-size:15px;font-weight:700;color:#111827;padding:8px 0 0">Total Paid</td><td style="text-align:right;font-size:15px;font-weight:700;color:#5b21b6;padding:8px 0 0">₹${order.total.toLocaleString('en-IN')}</td></tr>
    </table>

    <div style="background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#374151">
      <p style="font-weight:700;margin:0 0 6px">📍 Delivering to</p>
      <p style="margin:0;line-height:1.6">${addr.name}<br>${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br>${addr.city}, ${addr.state} – ${addr.pincode}</p>
    </div>

    <a href="${process.env.CLIENT_URL || 'https://earnova.in'}/account?tab=orders"
       style="display:inline-block;background:#5b21b6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Track Your Order →
    </a>`)

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed: ${order.orderId} — Earnova`,
    html,
  })
}

/* ── Password reset email ── */
export const sendPasswordResetEmail = async (user, resetURL) => {
  const html = layout(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px">Reset Your Password 🔐</h2>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
      We received a request to reset the password for your Earnova account (${user.email}).
      This link expires in <strong>1 hour</strong>.
    </p>
    <a href="${resetURL}"
       style="display:inline-block;background:#5b21b6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:20px">
      Reset Password →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">
      If you didn't request this, please ignore this email. Your password will remain unchanged.
    </p>`)

  await sendEmail({ to: user.email, subject: 'Reset your Earnova password', html })
}

/* ── Order status update ── */
export const sendOrderStatusUpdate = async (order, user, newStatus) => {
  const statusMessages = {
    processing: { emoji: '⚙️', text: 'Your order is being processed and packed.' },
    shipped:    { emoji: '🚚', text: `Your order is on its way! Tracking: ${order.trackingId || 'TBD'}` },
    delivered:  { emoji: '✅', text: 'Your order has been delivered. Enjoy your product!' },
    cancelled:  { emoji: '❌', text: 'Your order has been cancelled. Refund will be processed in 5–7 days.' },
  }
  const msg = statusMessages[newStatus] || { emoji: '📦', text: 'Your order status has been updated.' }

  const html = layout(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px">${msg.emoji} Order Update</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px">${msg.text}</p>
    <div style="background:#f5f3ff;border-radius:12px;padding:14px 18px;margin-bottom:24px">
      <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0">Order ID</p>
      <p style="color:#111827;font-size:18px;font-weight:900;margin:2px 0 0">${order.orderId}</p>
    </div>
    <a href="${process.env.CLIENT_URL || 'https://earnova.in'}/account?tab=orders"
       style="display:inline-block;background:#5b21b6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      View Order →
    </a>`)

  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderId} — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html,
  })
}
