import AuditLog from '../models/AuditLog.js'
import PlatformFeeSetting from '../models/PlatformFeeSetting.js'
import { getPlatformFeeDefinition } from '../config/platformFees.js'
import { listCurrentPlatformFees, normalizeFee } from '../services/platformFees.js'

const validateFee = (fee, party) => {
  if (!fee || !['percentage', 'fixed'].includes(fee.type)) {
    return `${party} fee type must be percentage or fixed.`
  }
  const value = Number(fee.value)
  if (!Number.isFinite(value) || value < 0) return `${party} fee must be zero or more.`
  if (fee.type === 'percentage' && value > 100) return `${party} percentage cannot exceed 100%.`
  if (fee.type === 'fixed' && value > 10000000) return `${party} fixed fee is too large.`
  return ''
}

export const getPlatformFees = async (_req, res) => {
  try {
    res.json({ success: true, fees: await listCurrentPlatformFees() })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updatePlatformFee = async (req, res) => {
  try {
    const definition = getPlatformFeeDefinition(req.params.serviceKey)
    if (!definition) return res.status(404).json({ success: false, message: 'Fee category not found.' })

    const customerError = validateFee(req.body.customerFee, definition.customerPartyLabel)
    const providerError = validateFee(req.body.providerFee, definition.providerPartyLabel)
    if (customerError || providerError) {
      return res.status(400).json({ success: false, message: customerError || providerError })
    }

    const reason = String(req.body.reason || '').trim()
    if (reason.length < 3) {
      return res.status(400).json({ success: false, message: 'Add a short reason for this fee change.' })
    }

    const customerFee = normalizeFee(req.body.customerFee)
    const providerFee = normalizeFee(req.body.providerFee)
    const effectiveAt = new Date()
    const current = await PlatformFeeSetting.findOne({ serviceKey: definition.key })
    const nextVersion = current ? current.version + 1 : 2
    const historyEntry = {
      version: nextVersion,
      customerFee,
      providerFee,
      changedBy: req.user._id,
      reason,
      effectiveAt,
    }

    const setting = await PlatformFeeSetting.findOneAndUpdate(
      { serviceKey: definition.key },
      {
        $set: {
          serviceKey: definition.key,
          label: definition.label,
          customerPartyLabel: definition.customerPartyLabel,
          providerPartyLabel: definition.providerPartyLabel,
          customerFee,
          providerFee,
          version: nextVersion,
          effectiveAt,
          updatedBy: req.user._id,
        },
        $push: { history: { $each: [historyEntry], $slice: -100 } },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    await AuditLog.create({
      actor: req.user._id,
      action: 'platform_fee.updated',
      resourceType: 'PlatformFeeSetting',
      resourceId: setting._id,
      summary: `${definition.label} fees updated to version ${nextVersion}.`,
      metadata: {
        serviceKey: definition.key,
        customerFee,
        providerFee,
        version: nextVersion,
        reason,
      },
    })

    res.json({ success: true, fee: setting, message: 'Platform fees updated. New transactions will use these amounts.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
