import mongoose from 'mongoose'

const helpArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 220 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  service: { type: String, required: true, trim: true, maxlength: 80, index: true },
  category: { type: String, required: true, trim: true, maxlength: 100, index: true },
  summary: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true, trim: true, maxlength: 20000 },
  relatedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HelpArticle' }],
  searchKeywords: [{ type: String, trim: true, maxlength: 80 }],
  published: { type: Boolean, default: false, index: true },
  version: { type: Number, default: 1, min: 1 },
  lastReviewedAt: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedbackHelpful: { type: Number, default: 0, min: 0 },
  feedbackNotHelpful: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

helpArticleSchema.index({ title: 'text', summary: 'text', content: 'text', searchKeywords: 'text' })
helpArticleSchema.index({ published: 1, service: 1, updatedAt: -1 })

export default mongoose.model('HelpArticle', helpArticleSchema)

