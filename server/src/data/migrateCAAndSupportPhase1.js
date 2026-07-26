import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { CA_SERVICE_CATALOG, DEFAULT_HELP_ARTICLES } from '../config/caSupport.js'
import CAService from '../models/CAService.js'
import HelpArticle from '../models/HelpArticle.js'
import CAFirm from '../models/CAFirm.js'
import CAFirmMember from '../models/CAFirmMember.js'
import CACase from '../models/CACase.js'
import CACaseAssignment from '../models/CACaseAssignment.js'
import CACaseStatusHistory from '../models/CACaseStatusHistory.js'
import CACaseDocument from '../models/CACaseDocument.js'
import SupportTicket from '../models/SupportTicket.js'
import SupportTicketMessage from '../models/SupportTicketMessage.js'
import SupportInternalNote from '../models/SupportInternalNote.js'
import SupportStatusHistory from '../models/SupportStatusHistory.js'
import SupportEscalation from '../models/SupportEscalation.js'
import SupportAttachment from '../models/SupportAttachment.js'

dotenv.config()

const apply = process.argv.includes('--apply')

const run = async () => {
  console.log(`Earnova CA/support Phase 1 migration: ${apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`CA services to upsert: ${CA_SERVICE_CATALOG.length}`)
  console.log(`Professionally reviewed Help articles to upsert: ${DEFAULT_HELP_ARTICLES.length}`)
  console.log('Legacy CA profiles, tax jobs and public document URLs will not be modified.')
  console.log('No firm will be invented or auto-verified.')
  if (!apply) {
    console.log('Run with --apply only after reviewing this output and the implementation plan.')
    return
  }

  await connectDB()
  const legacyTickets = await SupportTicket.collection.find({
    $or: [
      { serviceCategory: { $exists: false } },
      { status: { $in: ['open', 'in_progress'] } },
      { replies: { $exists: true } },
    ],
  }).toArray()
  for (const ticket of legacyTickets) {
    const status = ticket.status === 'in_progress' ? 'under_review' : ticket.status === 'open' ? 'submitted' : ticket.status
    const serviceCategory = ticket.serviceCategory || (ticket.category === 'account' ? 'account' : 'business')
    const supportQueue = ticket.supportQueue || (serviceCategory === 'account' ? 'account_support' : 'business_workspace_support')
    const existingMessages = await SupportTicketMessage.countDocuments({ ticket: ticket._id })
    if (!existingMessages) {
      await SupportTicketMessage.create({
        ticket: ticket._id,
        author: ticket.user,
        authorType: 'customer',
        message: ticket.description || ticket.subject || 'Legacy support request',
        createdAt: ticket.createdAt,
        updatedAt: ticket.createdAt,
      })
      for (const reply of ticket.replies || []) {
        if (reply.internal) {
          await SupportInternalNote.create({ ticket: ticket._id, author: reply.author, note: reply.message, createdAt: reply.createdAt, updatedAt: reply.updatedAt })
        } else {
          await SupportTicketMessage.create({ ticket: ticket._id, author: reply.author, authorType: String(reply.author) === String(ticket.user) ? 'customer' : 'agent', message: reply.message, createdAt: reply.createdAt, updatedAt: reply.updatedAt })
        }
      }
    }
    await SupportTicket.collection.updateOne(
      { _id: ticket._id },
      {
        $set: { serviceCategory, issueCategory: ticket.issueCategory || 'Other', supportQueue, status },
        $unset: { category: '', replies: '', attachments: '' },
      }
    )
  }
  await Promise.all(CA_SERVICE_CATALOG.map((service, index) =>
    CAService.findOneAndUpdate(
      { slug: service.slug },
      { ...service, sortOrder: (index + 1) * 10, active: true },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
  ))
  await Promise.all(DEFAULT_HELP_ARTICLES.map(article =>
    HelpArticle.findOneAndUpdate(
      { slug: article.slug },
      {
        $set: { ...article, published: true, lastReviewedAt: new Date() },
        $setOnInsert: { version: 1 },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
  ))

  const models = [
    CAFirm, CAFirmMember, CAService, CACase, CACaseAssignment, CACaseStatusHistory,
    CACaseDocument, SupportTicket, SupportTicketMessage, SupportInternalNote,
    SupportStatusHistory, SupportEscalation, SupportAttachment, HelpArticle,
  ]
  await Promise.all(models.map(model => model.syncIndexes()))
  console.log('Phase 1 configuration and indexes applied.')
  await mongoose.connection.close()
}

run().catch(async error => {
  console.error(`Migration failed: ${error.message}`)
  await mongoose.connection.close().catch(() => {})
  process.exitCode = 1
})
