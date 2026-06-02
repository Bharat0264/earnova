const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString()

export const MOCK_ADMIN_STATS = {
  revenue: { total: 1840000, thisMonth: 410000, lastMonth: 370000, growth: 10.8 },
  orders:  { total: 1247, pending: 28, shipped: 42, delivered: 1118, cancelled: 49, thisMonth: 143 },
  users:   { total: 3821, newThisMonth: 284 },
  products:{ active: 16, lowStock: 3 },
  withdrawals: { pending: 12, pendingAmount: 8450, totalPaid: 245000 },
  b2bPending: 8,
  subsidyPending: 14,
  monthlyRevenue: [
    { month: 'Nov', revenue: 210000, orders: 58 },
    { month: 'Dec', revenue: 280000, orders: 78 },
    { month: 'Jan', revenue: 320000, orders: 92 },
    { month: 'Feb', revenue: 290000, orders: 81 },
    { month: 'Mar', revenue: 370000, orders: 106 },
    { month: 'Apr', revenue: 410000, orders: 119 },
  ],
}

export const MOCK_ORDERS = [
  { _id: 'o1', orderId: 'EARXYZ001', user: { name: 'Priya Sharma',   email: 'priya@email.com'  }, total: 42999, status: 'delivered',  paymentStatus: 'paid',    createdAt: daysAgo(2) },
  { _id: 'o2', orderId: 'EARXYZ002', user: { name: 'Karthik Rajan',  email: 'karthik@email.com'}, total: 3199,  status: 'shipped',    paymentStatus: 'paid',    createdAt: daysAgo(3) },
  { _id: 'o3', orderId: 'EARXYZ003', user: { name: 'Meena Iyer',     email: 'meena@email.com'  }, total: 14800, status: 'processing', paymentStatus: 'paid',    createdAt: daysAgo(1) },
  { _id: 'o4', orderId: 'EARXYZ004', user: { name: 'Suresh Patel',   email: 'suresh@email.com' }, total: 58999, status: 'placed',     paymentStatus: 'paid',    createdAt: daysAgo(0) },
  { _id: 'o5', orderId: 'EARXYZ005', user: { name: 'Anita Reddy',    email: 'anita@email.com'  }, total: 8500,  status: 'delivered',  paymentStatus: 'paid',    createdAt: daysAgo(5) },
  { _id: 'o6', orderId: 'EARXYZ006', user: { name: 'Vikram Nair',    email: 'vikram@email.com' }, total: 32999, status: 'placed',     paymentStatus: 'paid',    createdAt: daysAgo(0) },
  { _id: 'o7', orderId: 'EARXYZ007', user: { name: 'Deepa Menon',    email: 'deepa@email.com'  }, total: 2800,  status: 'cancelled',  paymentStatus: 'refunded',createdAt: daysAgo(4) },
  { _id: 'o8', orderId: 'EARXYZ008', user: { name: 'Ravi Kumar',     email: 'ravi@email.com'   }, total: 10500, status: 'shipped',    paymentStatus: 'paid',    createdAt: daysAgo(2) },
]

export const MOCK_USERS = [
  { _id: 'u1', name: 'Priya Sharma',   email: 'priya@email.com',   role: 'customer', walletBalance: 2150, referralCount: 12, isActive: true,  createdAt: daysAgo(45) },
  { _id: 'u2', name: 'Karthik Rajan',  email: 'karthik@email.com', role: 'customer', walletBalance: 840,  referralCount: 5,  isActive: true,  createdAt: daysAgo(32) },
  { _id: 'u3', name: 'Arjun Singh',    email: 'arjun@email.com',   role: 'dealer',   walletBalance: 12400,referralCount: 74, isActive: true,  createdAt: daysAgo(120)},
  { _id: 'u4', name: 'Meena Iyer',     email: 'meena@email.com',   role: 'customer', walletBalance: 0,    referralCount: 2,  isActive: true,  createdAt: daysAgo(18) },
  { _id: 'u5', name: 'Suresh Patel',   email: 'suresh@email.com',  role: 'customer', walletBalance: 580,  referralCount: 3,  isActive: false, createdAt: daysAgo(90) },
  { _id: 'u6', name: 'Earnova Admin',  email: 'admin@earnova.in',  role: 'admin',    walletBalance: 0,    referralCount: 0,  isActive: true,  createdAt: daysAgo(365)},
]

export const MOCK_B2B_QUOTES = [
  { _id: 'b1', organization: 'Sunshine Apartments',   businessType: 'apartment',  name: 'Rajesh Mehta',   email: 'rajesh@sunshine.com',   phone: '9876540001', city: 'Mumbai',    state: 'Maharashtra', status: 'pending',  createdAt: daysAgo(1), products: [{ category: 'solar-panels', quantity: 20 }, { category: 'fans', quantity: 80 }], budget: '₹20–50 Lakh', message: 'Need 10 kW solar + BLDC fans for all 80 flats.' },
  { _id: 'b2', organization: 'Green Valley School',    businessType: 'school',     name: 'Priya Nair',     email: 'priya@gvschool.edu',     phone: '9876540002', city: 'Pune',      state: 'Maharashtra', status: 'reviewed', createdAt: daysAgo(3), products: [{ category: 'acs', quantity: 25 }, { category: 'fans', quantity: 60 }], budget: '₹20–50 Lakh', message: '5-star ACs for 25 classrooms and BLDC fans for common areas.' },
  { _id: 'b3', organization: 'TechPark Office Complex',businessType: 'office',     name: 'Arun Krishnan',  email: 'arun@techpark.in',       phone: '9876540003', city: 'Bangalore', state: 'Karnataka',   status: 'quoted',   createdAt: daysAgo(7), products: [{ category: 'acs', quantity: 50 }, { category: 'fans', quantity: 120 }], budget: '₹50 Lakh – 1 Cr', quotedAmount: 4250000, quotePdfUrl: 'https://earnova.in/quotes/q001.pdf' },
  { _id: 'b4', organization: 'Sunrise Hospital',       businessType: 'hospital',   name: 'Dr. Meena Roy',  email: 'admin@sunrise.hospital', phone: '9876540004', city: 'Chennai',   state: 'Tamil Nadu',  status: 'pending',  createdAt: daysAgo(0), products: [{ category: 'solar-panels', quantity: 40 }], budget: '₹20–50 Lakh', message: 'Need solar for emergency backup and cost savings.' },
  { _id: 'b5', organization: 'Agro Fresh Factory',     businessType: 'factory',    name: 'Vinod Sharma',   email: 'vinod@agrofresh.com',    phone: '9876540005', city: 'Jaipur',    state: 'Rajasthan',   status: 'pending',  createdAt: daysAgo(2), products: [{ category: 'solar-panels', quantity: 80 }, { category: 'accessories', quantity: 20 }], budget: 'Above ₹1 Cr', message: '30 kW system for factory operations.' },
]

export const MOCK_SUBSIDY_REQUESTS = [
  { _id: 's1', name: 'Ramesh Kumar',  email: 'ramesh@email.com',  phone: '9876541001', state: 'Gujarat',        city: 'Surat',       assistanceType: 'full-support',      systemSize: 5, isEligible: true,  estimatedSubsidy: 78000, status: 'pending',     createdAt: daysAgo(1) },
  { _id: 's2', name: 'Lakshmi Devi',  email: 'lakshmi@email.com', phone: '9876541002', state: 'Tamil Nadu',     city: 'Coimbatore',  assistanceType: 'application-filing',systemSize: 3, isEligible: true,  estimatedSubsidy: 78000, status: 'contacted',   createdAt: daysAgo(3) },
  { _id: 's3', name: 'Sunil Yadav',   email: 'sunil@email.com',   phone: '9876541003', state: 'Uttar Pradesh',  city: 'Lucknow',     assistanceType: 'document-help',     systemSize: 2, isEligible: true,  estimatedSubsidy: 60000, status: 'in-progress', createdAt: daysAgo(5) },
  { _id: 's4', name: 'Gita Patel',    email: 'gita@email.com',    phone: '9876541004', state: 'Rajasthan',      city: 'Jaipur',      assistanceType: 'eligibility-check', systemSize: 1, isEligible: false, estimatedSubsidy: 0,     status: 'completed',   createdAt: daysAgo(8) },
  { _id: 's5', name: 'Mohan Sharma',  email: 'mohan@email.com',   phone: '9876541005', state: 'Maharashtra',    city: 'Nagpur',      assistanceType: 'full-support',      systemSize: 4, isEligible: true,  estimatedSubsidy: 78000, status: 'pending',     createdAt: daysAgo(0) },
]

export const MOCK_WITHDRAWALS = [
  { _id: 'w1', user: { name: 'Arjun Singh',   email: 'arjun@email.com'  }, amount: 5000, upiId: 'arjun@okaxis',   accountName: 'Arjun Singh',   status: 'pending',    createdAt: daysAgo(1) },
  { _id: 'w2', user: { name: 'Priya Sharma',  email: 'priya@email.com'  }, amount: 1200, upiId: 'priya@paytm',    accountName: 'Priya Sharma',  status: 'pending',    createdAt: daysAgo(0) },
  { _id: 'w3', user: { name: 'Vikram Nair',   email: 'vikram@email.com' }, amount: 800,  upiId: 'vikram@upi',     accountName: 'Vikram Nair',   status: 'processing', createdAt: daysAgo(2) },
  { _id: 'w4', user: { name: 'Kavita Reddy',  email: 'kavita@email.com' }, amount: 450,  upiId: 'kavita@okicici', accountName: 'Kavita Reddy',  status: 'completed',  createdAt: daysAgo(5) },
]
