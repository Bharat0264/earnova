import { Router }      from 'express'
import productRoutes   from './productRoutes.js'
import authRoutes      from './authRoutes.js'
import orderRoutes     from './orderRoutes.js'
import paymentRoutes   from './paymentRoutes.js'
import referralRoutes  from './referralRoutes.js'
import b2bRoutes       from './b2bRoutes.js'
import subsidyRoutes   from './subsidyRoutes.js'
import adminRoutes     from './adminRoutes.js'
import freelanceRoutes from './freelanceRoutes.js'
import caRoutes        from './caRoutes.js'

const router = Router()

router.use('/products', productRoutes)   /* ✅ Phase 2 */
router.use('/auth',     authRoutes)      /* ✅ Phase 3 */
router.use('/orders',   orderRoutes)     /* ✅ Phase 3 */
router.use('/payment',  paymentRoutes)   /* ✅ Phase 3 */
router.use('/referral', referralRoutes)  /* ✅ Phase 4 */
router.use('/b2b',      b2bRoutes)       /* ✅ Phase 5 */
router.use('/subsidy',  subsidyRoutes)   /* ✅ Phase 5 */
router.use('/admin',    adminRoutes)     /* ✅ Phase 6 */

router.use('/freelance', freelanceRoutes)
router.use('/ca', caRoutes)

export default router
