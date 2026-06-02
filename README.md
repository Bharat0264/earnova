# Earnova — Smart Energy Products Platform

> Shop energy-saving products, save money, go green, and earn through referrals.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS              |
| Routing    | React Router v6                             |
| Backend    | Node.js + Express 4                         |
| Database   | MongoDB + Mongoose                          |
| Auth       | JWT + bcryptjs                              |
| Payments   | Razorpay (checkout + payouts)               |
| Email      | Nodemailer (Gmail SMTP)                     |
| Images     | Cloudinary                                  |
| Deployment | Docker + Railway / Render (Phase 6)         |

---

## Project Structure

```
earnova/
├── client/                  # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Footer, Button, Badge, Card, Modal
│   │   │   └── home/        # HeroSection, CategoryGrid, FeaturesStrip, ...
│   │   ├── context/         # CartContext, AuthContext
│   │   └── pages/           # One file per route
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                  # Express backend
    ├── src/
    │   ├── config/          # db.js
    │   ├── middleware/       # auth.js (protect, adminOnly, ...)
    │   ├── models/          # User.js, Product.js, Order.js
    │   └── routes/          # index.js (stubs → filled per phase)
    ├── .env.example
    └── package.json
```

---

## Local Setup

### 1 — Clone & install

```bash
git clone https://github.com/your-username/earnova.git
cd earnova

# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

### 2 — Configure environment

```bash
cd server
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET at minimum
```

### 3 — Run both servers

```bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Visit **http://localhost:5173**

---

## Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **1** | ✅ Done | Project scaffold, Home page, routes, server setup |
| **2** | 🔜 Next | Product catalogue, cart, product detail, Cloudinary |
| **3** | ⏳      | Auth, checkout, Razorpay payments, order tracking |
| **4** | ⏳      | Referral engine, earnings wallet, Razorpay Payouts |
| **5** | ⏳      | B2B bulk quotes, solar subsidy checker & guidance |
| **6** | ⏳      | Admin dashboard, Docker deployment, CI/CD |

---

## Brand

- **Primary colour:** `#5B21B6` (deep purple)
- **Accent colour:** `#059669` (emerald green)
- **Display font:** Sora (headings)
- **Body font:** Plus Jakarta Sans

---

## Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `RAZORPAY_KEY_ID` | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `EMAIL_USER` | Gmail for Nodemailer |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

---

© 2026 Earnova Energy — Pioneering a sustainable future.

---

## Phase 2 — What's New

### New client files
| File | Purpose |
|---|---|
| `src/utils/formatters.js` | `formatPrice`, `discountPercent`, GST calc, Indian locale |
| `src/data/mockProducts.js` | 16 realistic products (4 per category) — dev fallback |
| `src/hooks/useProducts.js` | `useProducts()` + `useProduct()` with API → mock fallback |
| `src/components/products/ProductCard.jsx` | Full card — wishlist, discount badge, add-to-cart |
| `src/components/products/ProductFilters.jsx` | Category, price, brand, rating, in-stock filters |
| `src/components/products/ImageGallery.jsx` | Gallery with zoom modal and thumbnail strip |
| `src/components/products/SpecsTable.jsx` | Specs table + FAQ accordion per category |
| `src/components/products/StarRating.jsx` | Half-star capable rating display |
| `src/components/cart/CartItem.jsx` | Cart row with quantity stepper, remove, move-to-wishlist |
| `src/components/cart/CartSummary.jsx` | GST breakdown, shipping calc, Razorpay trust strip |
| `src/pages/ProductsPage.jsx` | URL-based filters, sort, pagination, mobile filter modal |
| `src/pages/ProductDetailPage.jsx` | Gallery, info panel, tabs (Specs/Reviews/FAQ), related |
| `src/pages/CartPage.jsx` | Full cart with empty state and "You may also like" |

### New server files
| File | Purpose |
|---|---|
| `src/utils/apiFeatures.js` | Chainable filter → search → sort → paginate builder |
| `src/config/cloudinary.js` | Cloudinary v2 upload/delete helpers |
| `src/controllers/productController.js` | Full CRUD + image upload + review endpoints |
| `src/routes/productRoutes.js` | Product routes with multer + auth guards |
| `src/data/seedProducts.js` | 16 seed product records for Mongoose insertMany |
| `src/data/seed.js` | CLI seed script |

### Seed the database
```bash
cd server
cp .env.example .env   # fill in MONGO_URI
npm run seed           # insert 16 products
npm run seed:clear     # wipe + reseed
```

### Navigation to test Phase 2
- `/products` — full catalogue with filters
- `/products?category=solar-panels` — category filter via URL
- `/products/atomberg-renesa-plus-1200mm-bldc` — product detail page
- `/cart` — cart with GST breakdown

---

## Phase 3 — What's New

### New server files
| File | Purpose |
|---|---|
| `src/utils/email.js` | Nodemailer transporter + HTML templates (welcome, order confirmation, password reset) |
| `src/controllers/authController.js` | Register, login, getMe, updateProfile, address CRUD, forgotPassword, resetPassword |
| `src/controllers/paymentController.js` | Razorpay order creation, HMAC signature verify, DB order creation, commission credit, webhook handler |
| `src/controllers/orderController.js` | List orders (paginated), get single order, cancel order, admin status update |
| `src/routes/authRoutes.js` | `/api/auth/*` — all auth + profile + address endpoints |
| `src/routes/orderRoutes.js` | `/api/orders/*` — customer + admin order endpoints |
| `src/routes/paymentRoutes.js` | `/api/payment/*` — create-order, verify, webhook (raw body) |

### New client files
| File | Purpose |
|---|---|
| `src/utils/api.js` | Fetch wrapper — injects auth header, throws typed errors |
| `src/components/auth/AuthModal.jsx` | Combined login + register modal with validation |
| `src/components/checkout/AddressStep.jsx` | Select saved address or add new with Indian states |
| `src/components/checkout/ReviewStep.jsx` | Order review + Razorpay script loader + pay button |
| `src/components/account/ProfileForm.jsx` | Editable profile, password change, wallet balance |
| `src/components/account/OrderHistory.jsx` | Expandable order cards + AddressBook component |

### Updated files
- `Navbar.jsx` — profile dropdown (logged in), login/sign-up buttons (guest), auth modal
- `CheckoutPage.jsx` — 4-step flow: Address → Review → Razorpay → Confirmation
- `AccountPage.jsx` — tabbed dashboard: Orders | Profile | Addresses | Wishlist
- `AuthContext.jsx` — clean session management with token persistence
- `server/src/routes/index.js` — wires in auth, orders, payment routes

### Razorpay test mode setup
```bash
# In server/.env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Test card: 4111 1111 1111 1111
# Test UPI: success@razorpay
```

### Test the auth flow
- `/` — click "Sign Up" in Navbar → register modal
- `/products/atomberg-renesa-plus-1200mm-bldc` → add to cart → checkout → login redirect
- `/account` — full dashboard (orders, profile, addresses, wishlist)

---

## Phase 4 — What's New

### New server files
| File | Purpose |
|---|---|
| `src/models/Referral.js` | Click + conversion tracking with IP-hash deduplication |
| `src/models/Withdrawal.js` | Withdrawal requests with Razorpay Payouts fields |
| `src/controllers/referralController.js` | Stats, transactions, leaderboard, click tracking, withdrawal + Razorpay Payouts |
| `src/routes/referralRoutes.js` | `/api/referral/*` — public + protected + admin endpoints |

### New client files
| File | Purpose |
|---|---|
| `src/data/mockReferrals.js` | 7 realistic transactions, 2 withdrawals, 10-person leaderboard |
| `src/hooks/useReferral.js` | Loads stats/transactions/withdrawals/leaderboard with mock fallback |
| `src/components/referral/ReferralLinkCard.jsx` | Link card with copy, WhatsApp share, QR code, commission tiers |
| `src/components/referral/ReferralStats.jsx` | 4 stat cards — clicks, conversions, earned, balance |
| `src/components/referral/EarningsTable.jsx` | Paginated earnings history table with status chips |
| `src/components/referral/WithdrawalModal.jsx` | UPI withdrawal form + history panel |
| `src/components/referral/Leaderboard.jsx` | Top-10 earners with medals, anonymised names |
| `src/pages/ReferralPage.jsx` | Full dashboard: link card, stats, 3-tab panel (earnings/withdrawals/leaderboard) |
| `src/pages/RefLandingPage.jsx` | `/ref/:code` — tracks click, stores in localStorage, redirects to products |

### Updated files
- `App.jsx` — added `/ref/:code` route
- `AuthModal.jsx` — auto-fills referral code from localStorage if user arrived via a referral link

### Referral flow end-to-end
1. Referrer shares `earnova.in/ref/RAJU7X2K`
2. Visitor lands on `/ref/RAJU7X2K` → click tracked in DB → redirected to `/products`
3. Visitor shops → registers (referral code auto-filled) → pays
4. Commission credited to referrer's wallet (done in Phase 3 `paymentController.js`)
5. Referrer visits `/referral` → sees earnings → requests UPI withdrawal

### Razorpay Payouts setup (for withdrawals)
```
RAZORPAY_ACCOUNT_NUMBER=your_current_account_number
# Enable Payouts at: dashboard.razorpay.com → Payouts
```

---

## Phase 5 — What's New

### New server files
| File | Purpose |
|---|---|
| `src/models/B2BQuote.js` | B2B quotation schema — org, business type, product lines, referral, admin status |
| `src/models/SubsidyRequest.js` | Subsidy assistance schema — property details, system size, auto eligibility flag |
| `src/controllers/b2bController.js` | Quote submission (+ admin + customer emails), admin list, status update + PDF notification |
| `src/controllers/subsidyController.js` | Stateless eligibility calculation (PM Surya Ghar formula), request submission, admin list |
| `src/routes/b2bRoutes.js` | `POST /api/b2b/quote` (public) + admin CRUD |
| `src/routes/subsidyRoutes.js` | `POST /api/subsidy/check-eligibility` + request + admin CRUD |

### New client files
| File | Purpose |
|---|---|
| `src/components/b2b/QuoteForm.jsx` | 3-step form — Business details → Product requirements → Confirmation |
| `src/components/subsidy/EligibilityChecker.jsx` | Interactive eligibility tool with instant results and subsidy calculation |
| `src/components/subsidy/SubsidySteps.jsx` | PM Surya Ghar 7-step accordion guide with tips for each step |
| `src/components/subsidy/DocumentChecklist.jsx` | State-wise document list with checkboxes, progress bar, copy button |
| `src/components/subsidy/AssistanceForm.jsx` | 4-type assistance request form with expert contact promise |

### Updated pages
- `B2BPage.jsx` — Full page: hero + 8-segment grid + benefits + B2B referral callout + quote form
- `SubsidyPage.jsx` — Full page: hero + scheme info + 4-tab panel (Eligibility / How to Apply / Documents / Get Help)

### Subsidy eligibility formula (PM Surya Ghar Yojana)
```
1 kW system  → ₹30,000 central subsidy
2 kW system  → ₹60,000 central subsidy
3+ kW system → ₹78,000 central subsidy (maximum)

Eligible if: owned property + active electricity connection + no existing solar
```

### B2B quote flow
```
Business fills 3-step form → POST /api/b2b/quote
→ Admin gets email notification
→ Customer gets confirmation email
→ Admin reviews + sets status = 'quoted' + uploads PDF URL
→ Customer receives quote PDF email automatically
```

---

## Phase 6 — What's New

### New server files
| File | Purpose |
|---|---|
| `src/controllers/adminController.js` | Dashboard stats aggregation, user list + role update |
| `src/routes/adminRoutes.js` | `/api/admin/*` — all admin-only endpoints |
| `src/data/createAdmin.js` | One-time script to create the first admin user |

### New client files
| File | Purpose |
|---|---|
| `src/data/mockAdmin.js` | Realistic mock data for all admin tables |
| `src/hooks/useAdmin.js` | Generic table hook factory + stats hook with mock fallback |
| `src/components/admin/DashboardStats.jsx` | 4 stat cards + SVG revenue bar chart with hover tooltips |
| `src/components/admin/OrdersTable.jsx` | Filterable order table with expandable rows + quick status update |
| `src/components/admin/ProductsTable.jsx` | Product grid with add/edit modal + toggle active |
| `src/components/admin/UsersTable.jsx` | User list with role change + toggle active |
| `src/components/admin/B2BInbox.jsx` | B2B quote inbox with expandable details + quote PDF workflow |
| `src/components/admin/SubsidyInbox.jsx` | Subsidy request inbox with status + admin notes |
| `src/components/admin/WithdrawalQueue.jsx` | Approve/reject withdrawal requests |
| `src/pages/AdminPage.jsx` | Full admin panel: protected, sidebar nav, 7 tabs |

### Deployment files
| File | Purpose |
|---|---|
| `docker-compose.yml` | Orchestrates MongoDB + Express + Nginx containers |
| `server/Dockerfile` | Node 20 Alpine production image (non-root user) |
| `client/Dockerfile` | Multi-stage: Vite build → Nginx serve |
| `client/nginx.conf` | SPA routing, API proxy, gzip, security headers |
| `.gitignore` | Ignores node_modules, .env, build artifacts |

---

## Deployment Guide

### Quick Start (Docker)

```bash
# 1. Clone & configure
git clone https://github.com/your-username/earnova.git
cd earnova
cp server/.env.example server/.env
# Edit server/.env with your real values

# 2. Build & start all containers
docker-compose up -d --build

# 3. Seed the database
docker-compose exec server npm run seed

# 4. Create admin user
docker-compose exec server npm run create-admin

# 5. Visit http://localhost
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy server
cd server
railway login && railway init
railway up

# Set environment variables in Railway dashboard
# Connect MongoDB Atlas as the database
```

### Deploy to Render

```bash
# server → New Web Service → connect GitHub repo → set root to /server
# client → New Static Site → connect GitHub repo → build: npm run build → publish: dist
# Set CORS_ORIGIN in server env vars to your Render client URL
```

---

## Admin Panel Access

```bash
# Create first admin (after seeding)
cd server && npm run create-admin

# Default credentials (change immediately!)
Email:    admin@earnova.in
Password: Admin@1234

# Visit: http://localhost/admin
# Or:    http://localhost:5173/admin (dev)
```

---

## Complete Tech Stack Summary

| Layer | Technology | Phase |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | 1 |
| Routing | React Router v6 | 1 |
| Product Catalogue | MongoDB + Express + Cloudinary | 2 |
| Auth | JWT + bcryptjs | 3 |
| Payments | Razorpay (checkout + webhooks) | 3 |
| Email | Nodemailer + HTML templates | 3 |
| Referrals | Custom engine + Razorpay Payouts | 4 |
| B2B Quotes | Multi-step form + PDF workflow | 5 |
| Solar Subsidy | PM Surya Ghar eligibility + guide | 5 |
| Admin Panel | Full dashboard + CRUD + analytics | 6 |
| Deployment | Docker + Nginx + Railway/Render | 6 |
