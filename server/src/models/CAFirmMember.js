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
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
    default: 'pending',
    index: true,
  },
  verificationNote: { type: String, trim: true, maxlength: 1000 },
  verificationSubmittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['invited', 'active', 'suspended', 'removed'], default: 'invited', index: true },
  permissions: [{ type: String, trim: true, maxlength: 80 }],
  joinedAt: Date,
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

caFirmMemberSchema.index({ firm: 1, user: 1 }, { unique: true })
caFirmMemberSchema.index({ user: 1, status: 1 })
caFirmMemberSchema.index({ verificationStatus: 1, createdAt: -1 })

export default mongoose.model('CAFirmMember', caFirmMemberSchema)
