import CapabilityEvidence from '../models/CapabilityEvidence.js'
import BusinessProduct from '../models/BusinessProduct.js'
import BusinessEvent from '../models/BusinessEvent.js'
import VerificationRun from '../models/VerificationRun.js'
import RecoveryPlan from '../models/RecoveryPlan.js'
import { CAPABILITIES, TTL, derive, evidenceState, isolateFault, verificationPlan } from '../services/capabilityEngine.js'
import { ADAPTERS } from '../services/evidenceAdapters.js'

export const snapshot = async businessId => {
  const products = await BusinessProduct.countDocuments({ business: businessId, active: true })
  if (products) await CapabilityEvidence.findOneAndUpdate({ business: businessId, capabilityKey: 'PRODUCT_AVAILABILITY', evidenceType: 'inventory' }, { $set: { normalizedStatus: 'VALID', observedAt: new Date(), expiresAt: new Date(Date.now() + TTL.PRODUCT_AVAILABILITY), metadata: { productCount: products } }, $setOnInsert: { business: businessId, sourceProvider: 'earnova' } }, { upsert: true, new: true, runValidators: true })
  const evidence = await CapabilityEvidence.find({ business: businessId }).sort('-observedAt').lean()
  const states = Object.fromEntries(Object.keys(CAPABILITIES).filter(key => key !== 'SELL_ONLINE').map(key => [key, evidenceState(evidence.find(item => item.capabilityKey === key))]))
  states.SELL_ONLINE = derive('SELL_ONLINE', states)
  return { evidence, states }
}
const response = ({ evidence, states }) => ({ success: true, capabilities: Object.entries(states).map(([key, state]) => ({ key, state, reason: state === 'BLOCKED' ? 'A required selling capability is not configured.' : undefined })), evidence: evidence.map(item => ({ capabilityKey: item.capabilityKey, evidenceType: item.evidenceType, sourceProvider: item.sourceProvider, status: evidenceState(item), normalizedStatus: item.normalizedStatus, observedAt: item.observedAt, expiresAt: item.expiresAt })) })
export const getStatus = async (req, res) => res.json(response(await snapshot(req.business._id)))
const validKey = key => Object.hasOwn(CAPABILITIES, key)

export const reverify = async (req, res) => {
  const target = req.params.capabilityKey
  if (!validKey(target)) return res.status(400).json({ success: false, message: 'Unknown capability.' })
  const existing = await VerificationRun.findOne({ business: req.business._id, targetCapability: target, status: { $in: ['PENDING', 'RUNNING'] } }).lean()
  if (existing) return res.status(409).json({ success: false, code: 'VERIFICATION_IN_PROGRESS', run: existing })
  const initial = await snapshot(req.business._id); const plan = verificationPlan(target, initial.states); const startedAt = new Date()
  const run = await VerificationRun.create({ business: req.business._id, requestedBy: req.user._id, targetCapability: target, triggerType: 'MANUAL', status: 'RUNNING', plannedChecks: plan, skippedChecks: Object.keys(CAPABILITIES).filter(key => !plan.includes(key)), affectedCapabilities: [target], initialState: initial.states[target], startedAt })
  try {
    const executed = []
    for (const key of plan) {
      if (key === 'SELL_ONLINE') continue
      if (key === 'PRODUCT_AVAILABILITY') { await snapshot(req.business._id); executed.push(key); continue }
      const adapter = ADAPTERS[key]
      if (!adapter) continue
      const outcome = await adapter.collect(req.business._id)
      if (outcome.state === 'UNCONFIGURED') continue
      await CapabilityEvidence.findOneAndUpdate({ business: req.business._id, capabilityKey: key, evidenceType: 'capability_check' }, { $set: { normalizedStatus: outcome.state === 'VALID' ? 'VALID' : 'UNKNOWN', observedAt: new Date(), expiresAt: new Date(Date.now() + (TTL[key] || TTL.ORDER_CAPTURE)), sourceProvider: 'earnova' }, $setOnInsert: { business: req.business._id } }, { upsert: true, runValidators: true })
      executed.push(key)
    }
    const result = await snapshot(req.business._id); run.status = executed.length === plan.length ? 'COMPLETED' : 'PARTIAL'; run.executedChecks = executed; run.resultingState = result.states[target]; run.completedAt = new Date(); run.durationMs = run.completedAt - startedAt; await run.save()
    await BusinessEvent.create({ business: req.business._id, actor: req.user._id, eventType: 'VERIFICATION_COMPLETED', source: 'engine', metadata: { target, runId: run._id, resultingState: run.resultingState } })
    res.json({ ...response(result), run: { id: run._id, status: run.status, plannedChecks: run.plannedChecks, executedChecks: run.executedChecks, skippedChecks: run.skippedChecks, resultingState: run.resultingState } })
  } catch { run.status = 'FAILED'; run.errorCode = 'VERIFICATION_ERROR'; run.safeErrorMessage = 'Earnova could not complete this verification.'; run.completedAt = new Date(); run.durationMs = run.completedAt - startedAt; await run.save(); res.status(500).json({ success: false, message: run.safeErrorMessage }) }
}
export const diagnosis = async (req, res) => { const target = req.params.capabilityKey; if (!validKey(target)) return res.status(400).json({ success: false, message: 'Unknown capability.' }); const current = await snapshot(req.business._id); const fault = isolateFault(target, current.states); const evidence = current.evidence.find(item => item.capabilityKey === fault.root); res.json({ success: true, capability: target, state: current.states[target], primaryIssue: { capability: fault.root, evidenceType: evidence?.evidenceType || 'CONFIGURATION', state: current.states[fault.root] }, reasonChain: fault.chain, lastObservedAt: evidence?.observedAt, affectedCapabilities: [target], unaffectedCapabilities: fault.unaffected }) }
export const createRecoveryPlan = async (req, res) => { const target = req.params.capabilityKey; if (!validKey(target)) return res.status(400).json({ success: false, message: 'Unknown capability.' }); const current = await snapshot(req.business._id); const fault = isolateFault(target, current.states); const plan = await RecoveryPlan.create({ business: req.business._id, capabilityKey: target, requestedBy: req.user._id, diagnosis: { state: current.states[target], chain: fault.chain, root: fault.root }, proposedActions: [{ type: 'MANUAL_ACTION_REQUIRED', label: `Configure or review ${fault.root.replaceAll('_', ' ').toLowerCase()}.`, externalMutation: false }, { type: 'REVERIFY_EVIDENCE', label: `Reverify ${fault.root.replaceAll('_', ' ').toLowerCase()} after it is configured.`, externalMutation: false }] })
  await BusinessEvent.create({ business: req.business._id, actor: req.user._id, eventType: 'RECOVERY_PLAN_CREATED', source: 'engine', metadata: { target, recoveryPlanId: plan._id } }); res.status(201).json({ success: true, plan }) }
export const getRecoveryPlan = async (req, res) => { const plan = await RecoveryPlan.findOne({ _id: req.params.recoveryPlanId, business: req.business._id }).lean(); if (!plan) return res.status(404).json({ success: false, message: 'Recovery plan not found.' }); res.json({ success: true, plan }) }
export const approveRecoveryPlan = async (req, res) => { const plan = await RecoveryPlan.findOne({ _id: req.params.recoveryPlanId, business: req.business._id }); if (!plan) return res.status(404).json({ success: false, message: 'Recovery plan not found.' }); if (plan.status !== 'AWAITING_CONFIRMATION') return res.status(409).json({ success: false, message: 'This recovery plan is no longer awaiting approval.' }); plan.status = 'APPROVED'; plan.approvedBy = req.user._id; plan.approvedAt = new Date(); plan.executedAt = new Date(); plan.status = 'COMPLETED'; plan.result = 'No external configuration was changed. Reverify after the required manual action.'; await plan.save(); await BusinessEvent.create({ business: req.business._id, actor: req.user._id, eventType: 'RECOVERY_COMPLETED', source: 'engine', metadata: { recoveryPlanId: plan._id, target: plan.capabilityKey } }); res.json({ success: true, plan }) }
export const rejectRecoveryPlan = async (req, res) => { const plan = await RecoveryPlan.findOneAndUpdate({ _id: req.params.recoveryPlanId, business: req.business._id, status: 'AWAITING_CONFIRMATION' }, { status: 'REJECTED' }, { new: true }); if (!plan) return res.status(404).json({ success: false, message: 'Recovery plan not found or already handled.' }); res.json({ success: true, plan }) }
export const verificationHistory = async (req, res) => res.json({ success: true, runs: await VerificationRun.find({ business: req.business._id }).sort('-createdAt').limit(20).lean() })
