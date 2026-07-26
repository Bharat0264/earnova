import CACase from '../models/CACase.js'
import CACaseAssignment from '../models/CACaseAssignment.js'
import CACaseDocument from '../models/CACaseDocument.js'
import SupportAttachment from '../models/SupportAttachment.js'
import SupportTicket from '../models/SupportTicket.js'
import AuditLog from '../models/AuditLog.js'
import { getActiveFirmMembership, getAuthorizedBusinessIds } from '../services/caPermissions.js'
import { createPrivateDownloadUrl, uploadPrivateFile } from '../services/privateStorage.js'

const canAccessCase = async (user, foundCase) => {
  if (user.role === 'admin' || String(foundCase.customer) === String(user._id)) return true
  if (foundCase.business) {
    const businessIds = await getAuthorizedBusinessIds(user._id)
    if (businessIds.includes(String(foundCase.business))) return true
  }
  const membership = await getActiveFirmMembership(user._id)
  if (!membership || String(membership.firm._id) !== String(foundCase.firm)) return false
  if (['firm_owner', 'firm_administrator'].includes(membership.platformRole)) return true
  return Boolean(await CACaseAssignment.exists({ case: foundCase._id, member: membership._id, active: true }))
}

export const uploadCaseDocument = async (req, res, next) => {
  try {
    const foundCase = await CACase.findOne({ _id: req.params.caseId, customer: req.user._id })
    if (!foundCase) return res.status(404).json({ success: false, message: 'CA case not found.' })
    const stored = await uploadPrivateFile({ file: req.file, domain: 'ca-cases', ownerId: foundCase._id })
    const document = await CACaseDocument.create({
      case: foundCase._id,
      user: foundCase.customer,
      firm: foundCase.firm,
      documentType: String(req.body.documentType || req.file.originalname).trim().slice(0, 160),
      ...stored,
      uploadedBy: req.user._id,
      retentionAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
    })
    await AuditLog.create({
      actor: req.user._id,
      action: 'ca_document.uploaded',
      resourceType: 'CACaseDocument',
      resourceId: document._id,
      summary: `Uploaded a private document to case ${foundCase.reference}`,
      requestId: req.id,
      metadata: { caseId: String(foundCase._id), mimeType: stored.mimeType, fileSize: stored.fileSize },
    })
    const safe = document.toObject()
    delete safe.storageKey
    delete safe.checksum
    res.status(201).json({ success: true, document: safe, message: stored.malwareScanStatus === 'pending' ? 'Document uploaded and quarantined pending security scanning.' : 'Document uploaded securely.' })
  } catch (error) {
    next(error)
  }
}

export const getCaseDocumentDownload = async (req, res, next) => {
  try {
    const document = await CACaseDocument.findById(req.params.documentId)
    if (!document || document.deletedAt || document.revokedAt) return res.status(404).json({ success: false, message: 'Document not found.' })
    if (document.malwareScanStatus !== 'clean' && req.user.role !== 'admin') {
      return res.status(423).json({ success: false, message: 'Document access is unavailable until security scanning completes.' })
    }
    const foundCase = await CACase.findById(document.case).select('customer business firm reference')
    if (!foundCase || !await canAccessCase(req.user, foundCase)) {
      return res.status(404).json({ success: false, message: 'Document not found.' })
    }
    const downloadUrl = createPrivateDownloadUrl({ storageKey: document.storageKey, resourceType: document.resourceType })
    await AuditLog.create({
      actor: req.user._id,
      action: 'ca_document.download_link_created',
      resourceType: 'CACaseDocument',
      resourceId: document._id,
      summary: `Authorized private document access for case ${foundCase.reference}`,
      requestId: req.id,
      metadata: { caseId: String(foundCase._id) },
    })
    res.set('Cache-Control', 'no-store')
    res.json({ success: true, downloadUrl, expiresInSeconds: 300 })
  } catch (error) {
    next(error)
  }
}

export const getSupportAttachmentDownload = async (req, res, next) => {
  try {
    const attachment = await SupportAttachment.findById(req.params.attachmentId)
    if (!attachment || attachment.deletedAt || attachment.revokedAt) return res.status(404).json({ success: false, message: 'Attachment not found.' })
    const ticket = await SupportTicket.findById(attachment.ticket).select('user assignedAgent assignedFirm ticketNumber')
    const allowed = ticket && (
      req.user.role === 'admin'
      || String(ticket.user) === String(req.user._id)
      || String(ticket.assignedAgent || '') === String(req.user._id)
    )
    if (!allowed) return res.status(404).json({ success: false, message: 'Attachment not found.' })
    if (attachment.malwareScanStatus !== 'clean' && req.user.role !== 'admin') {
      return res.status(423).json({ success: false, message: 'Attachment access is unavailable until security scanning completes.' })
    }
    const downloadUrl = createPrivateDownloadUrl({ storageKey: attachment.storageKey, resourceType: attachment.resourceType })
    await AuditLog.create({
      actor: req.user._id,
      action: 'support_attachment.download_link_created',
      resourceType: 'SupportAttachment',
      resourceId: attachment._id,
      summary: `Authorized private attachment access for ticket ${ticket.ticketNumber}`,
      requestId: req.id,
      metadata: { ticketId: String(ticket._id) },
    })
    res.set('Cache-Control', 'no-store')
    res.json({ success: true, downloadUrl, expiresInSeconds: 300 })
  } catch (error) {
    next(error)
  }
}

export const uploadSupportAttachment = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.ticketId, user: req.user._id })
    if (!ticket) return res.status(404).json({ success: false, message: 'Support ticket not found.' })
    const stored = await uploadPrivateFile({ file: req.file, domain: 'support', ownerId: ticket._id })
    const attachment = await SupportAttachment.create({
      ticket: ticket._id,
      user: ticket.user,
      ...stored,
      uploadedBy: req.user._id,
      retentionAt: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
    })
    await AuditLog.create({
      actor: req.user._id,
      action: 'support_attachment.uploaded',
      resourceType: 'SupportAttachment',
      resourceId: attachment._id,
      summary: `Uploaded a private attachment to ticket ${ticket.ticketNumber}`,
      requestId: req.id,
      metadata: { ticketId: String(ticket._id), mimeType: stored.mimeType, fileSize: stored.fileSize },
    })
    const safe = attachment.toObject()
    delete safe.storageKey
    delete safe.checksum
    res.status(201).json({ success: true, attachment: safe, message: stored.malwareScanStatus === 'pending' ? 'Attachment uploaded and quarantined pending security scanning.' : 'Attachment uploaded securely.' })
  } catch (error) {
    next(error)
  }
}
