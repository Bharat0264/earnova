import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  getHelpArticle, getHelpHome, getHelpIssues, listHelpArticles, searchAuthorizedHelp,
} from '../controllers/helpController.js'

const router = Router()

router.get('/', getHelpHome)
router.get('/articles', listHelpArticles)
router.get('/articles/:articleSlug', getHelpArticle)
router.get('/issues/:service', getHelpIssues)
router.get('/search', protect, searchAuthorizedHelp)

export default router

