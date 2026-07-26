import mongoose from 'mongoose'

export const FIRM_ROLES = [
  'firm_owner', 'firm_administrator', 'partner_ca', 'ca_employee', 'accountant',
  'article_assistant', 'case_manager', 'reviewer', 'billing_administrator', 'support_coordinator',
]

const caFirmMemberSchema = new mongoose.Schema({
  firm: { type: mongoose.Schema.Types.ObjectId, ref: 'CAFirm', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platformRole: { type: String, enum: FIRM_ROLES, required: true, index: true },
  professionalDesignation: { type: String, trim: true, maxlength: 120 },
  designationVerified: { type: Boolean, default: false },
  membershipNumberMasked: { type: String, trim: true, maxlength: 40 },
  status: { type: String, enum: ['invited', 'active', 'suspended', 'removed'], default: 'invited', index: true },
  permissions: [{ type: String, trim: true, maxlength: 80 }],
  joinedAt: Date,
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

caFirmMemberSchema.index({ firm: 1, user: 1 }, { unique: true })
caFirmMemberSchema.index({ user: 1, status: 1 })

export default mongoose.model('CAFirmMember', caFirmMemberSchema)

