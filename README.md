# Earnova

Tagline: **Work. Sell. Earn.**

Earnova is a full-stack modern startup marketplace app with Fiverr-inspired UI, blue-white SaaS styling, and production-ready architecture.

## Tech Stack
- Frontend: Next.js App Router + TypeScript + Tailwind CSS + Axios + Context API
- Backend: Node.js + Express + MongoDB Atlas (Mongoose)
- Authentication: JWT + bcryptjs
- Payments: Razorpay
- Deployment targets: Vercel (frontend), Render (backend)

## Folder Structure

### Frontend
- `frontend/src/app`
- `frontend/src/components`
- `frontend/src/context`
- `frontend/src/hooks`
- `frontend/src/services`
- `frontend/src/utils`

### Backend
- `backend/src/controllers`
- `backend/src/models`
- `backend/src/routes`
- `backend/src/middleware`
- `backend/src/config`
- `backend/src/services` (reserved for future service modules)

## MongoDB Collections
- `users`
- `products`
- `services`
- `orders`
- `wallets`
- `payments`
- `reviews`
- `supporttickets`

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure env files
```bash
# backend
copy .env.example .env

# frontend
copy .env.example .env.local
```

### 3. Run backend
```bash
cd backend
npm run dev
```

### 4. Run frontend
```bash
cd frontend
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Implemented Features
- Signup/Login with hashed passwords and JWT auth
- Protected user/admin routes middleware
- Product and service marketplace APIs with search/filter
- Wallet balance, withdrawal request, and transaction history API
- Razorpay order creation and signature verification
- Ratings/reviews APIs
- Support ticket system with admin replies
- Admin dashboard stats and moderation routes
- Responsive pages: landing, dashboard, marketplace, services, wallet, admin
- Loading and error states in key frontend flows

## API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products
- `GET /api/products?q=&category=&minPrice=&maxPrice=`
- `POST /api/products`

### Services
- `GET /api/services?q=&category=`
- `POST /api/services`

### Wallet
- `GET /api/wallet`
- `POST /api/wallet/withdraw`

### Payments
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

### Reviews
- `GET /api/reviews?listingId=<id>&listingType=<product|service>`
- `POST /api/reviews`

### Support
- `POST /api/support`
- `GET /api/support/mine`
- `GET /api/support/admin`
- `PATCH /api/support/:id/reply`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/block`
- `PATCH /api/admin/listings/:type/:id/remove`

## Deployment Notes
- Deploy `frontend` to Vercel.
- Deploy `backend` to Render.
- Set production environment variables in both platforms.
- Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` for production domains.
