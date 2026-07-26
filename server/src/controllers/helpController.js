import HelpArticle from '../models/HelpArticle.js'
import CACase from '../models/CACase.js'
import Order from '../models/Order.js'
import PaymentAttempt from '../models/PaymentAttempt.js'
import ProjectListing from '../models/ProjectListing.js'
import { DEFAULT_HELP_ARTICLES, HELP_CATEGORIES, SUPPORT_ISSUES } from '../config/caSupport.js'

const safeQuery = value => String(value || '').trim().slice(0, 100)
const CONFIG_REVIEW_DATE = '2026-07-26T00:00:00.000Z'

export const getHelpHome = async (_req, res, next) => {
  try {
    let articles = await HelpArticle.find({ published: true })
      .select('title slug service category summary lastReviewedAt updatedAt')
      .sort({ feedbackHelpful: -1, updatedAt: -1 }).limit(8).lean()
    if (!articles.length) articles = DEFAULT_HELP_ARTICLES.map(article => ({ ...article, lastReviewedAt: CONFIG_REVIEW_DATE }))
    res.json({
      success: true,
      heading: 'How can we help you?',
      categories: HELP_CATEGORIES.map(([slug, label]) => ({ slug, label })),
      articles,
      urgentSecurityPath: '/help/report-abuse',
      contactPath: '/help/contact',
      responseTimeNote: 'Response timing depends on issue severity, queue workload and required specialist review.',
    })
  } catch (error) {
    next(error)
  }
}

export const listHelpArticles = async (req, res, next) => {
  try {
    const service = safeQuery(req.query.service)
    const query = safeQuery(req.query.q)
    const filter = { published: true, ...(service ? { service } : {}) }
    if (query) filter.$text = { $search: query }
    let articles = await HelpArticle.find(filter)
      .select('title slug service category summary lastReviewedAt updatedAt')
      .sort(query ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
      .limit(50).lean()
    if (!articles.length) {
      articles = DEFAULT_HELP_ARTICLES
        .filter(article => (!service || article.service === service) && (!query || `${article.title} ${article.summary} ${article.searchKeywords.join(' ')}`.toLowerCase().includes(query.toLowerCase())))
        .map(article => ({ ...article, lastReviewedAt: CONFIG_REVIEW_DATE }))
    }
    res.json({ success: true, articles })
  } catch (error) {
    next(error)
  }
}

export const getHelpArticle = async (req, res, next) => {
  try {
    const article = await HelpArticle.findOne({ slug: req.params.articleSlug, published: true })
      .select('-feedbackHelpful -feedbackNotHelpful').lean()
      || (() => {
        const configured = DEFAULT_HELP_ARTICLES.find(item => item.slug === req.params.articleSlug)
        return configured ? { ...configured, lastReviewedAt: CONFIG_REVIEW_DATE } : null
      })()
    if (!article) return res.status(404).json({ success: false, message: 'Help article not found.' })
    res.json({ success: true, article })
  } catch (error) {
    next(error)
  }
}

export const getHelpIssues = (req, res) => {
  const service = safeQuery(req.params.service)
  const issues = SUPPORT_ISSUES[service]
  if (!issues) return res.status(404).json({ success: false, message: 'Support category not found.' })
  res.json({ success: true, service, issues })
}

export const searchAuthorizedHelp = async (req, res, next) => {
  try {
    const query = safeQuery(req.query.q)
    if (query.length < 2) return res.json({ success: true, articles: [], cases: [], orders: [], categories: [] })
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const [storedArticles, cases, orders, payments, projects] = await Promise.all([
      HelpArticle.find({ published: true, $text: { $search: query } }).select('title slug service category summary lastReviewedAt').limit(10).lean(),
      CACase.find({ customer: req.user._id, reference: regex }).select('reference serviceSlug status updatedAt').limit(10).lean(),
      Order.find({ user: req.user._id, orderId: regex }).select('orderId status paymentStatus updatedAt').limit(10).lean(),
      PaymentAttempt.find({
        user: req.user._id,
        $or: [{ razorpayOrderId: regex }, { razorpayPaymentId: regex }],
      }).select('razorpayOrderId razorpayPaymentId status amount updatedAt').limit(10).lean(),
      ProjectListing.find({
        $and: [
          { $or: [{ seller: req.user._id }, { buyer: req.user._id }] },
          { $or: [{ listingId: regex }, { title: regex }] },
        ],
      }).select('listingId title status updatedAt').limit(10).lean(),
    ])
    const articles = storedArticles.length
      ? storedArticles
      : DEFAULT_HELP_ARTICLES.filter(article => `${article.title} ${article.summary}`.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    const categories = HELP_CATEGORIES
      .filter(([slug, label]) => `${slug} ${label}`.toLowerCase().includes(query.toLowerCase()))
      .map(([slug, label]) => ({ slug, label }))
    res.json({ success: true, articles, cases, orders, payments, projects, categories })
  } catch (error) {
    next(error)
  }
}
