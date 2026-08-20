export const PRODUCT_PILLARS = [
  {
    key: 'business',
    label: 'Business',
    title: 'Business Tools',
    to: '/business',
    description: 'Run sales, customers, inventory, invoices and business insights from one workspace.',
    benefits: ['Know your business health', 'Keep operations organized', 'Turn data into next actions'],
  },
  {
    key: 'services',
    label: 'Services',
    title: 'Professional Services',
    to: '/services',
    description: 'Find trusted freelancers, CAs and business consultants with clear service workflows.',
    benefits: ['Compare suitable professionals', 'Track work in one place', 'Keep requests and updates organized'],
  },
  {
    key: 'energy',
    label: 'Energy',
    title: 'Energy Solutions',
    to: '/energy',
    description: 'Explore solar products and request practical support for residential or commercial needs.',
    benefits: ['Browse focused energy products', 'Share your site requirements', 'Receive approximate guidance'],
  },
]

export const PUBLIC_NAV_LINKS = [
  { label: 'Start', to: '/start' },
  { label: 'Build', to: '/build' },
  { label: 'Source', to: '/source' },
  { label: 'Operate', to: '/operate' },
]

export const PLATFORM_HUBS = [
  {
    key: 'shopping',
    label: 'Shopping',
    description: 'Products, projects and purchases in one place.',
    accent: 'amber',
    items: [
      { label: 'Shop all products', description: 'Browse the complete product catalogue', to: '/products', icon: 'store' },
      { label: 'Solar products', description: 'Panels, inverters and energy essentials', to: '/products?category=solar-panels', icon: 'sun' },
      { label: 'Projects marketplace', description: 'Buy ready-to-use digital projects', to: '/projects', icon: 'code' },
      { label: 'B2B bulk orders', description: 'Request business and wholesale supply', to: '/b2b', icon: 'building' },
      { label: 'Cart', description: 'Review items ready for checkout', to: '/cart', icon: 'cart' },
      { label: 'My orders', description: 'Track purchases and order history', to: '/account?tab=orders', icon: 'package' },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    description: 'Professional help for every stage of business.',
    accent: 'violet',
    items: [
      { label: 'All services', description: 'Explore every professional service', to: '/services', icon: 'briefcase' },
      { label: 'Freelancers', description: 'Web, design, marketing and more', to: '/services/freelancers', icon: 'users' },
      { label: 'CA & tax services', description: 'Compliance, tax and accounting support', to: '/services/ca', icon: 'calculator' },
      { label: 'Business consulting', description: 'Strategy and operational guidance', to: '/services/business-consulting', icon: 'presentation' },
      { label: 'My service requests', description: 'View active work and request status', to: '/account?tab=services', icon: 'clipboard' },
      { label: 'Service marketplace', description: 'Compare available business support', to: '/marketplace', icon: 'search' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    description: 'Operate, understand and grow your company.',
    accent: 'blue',
    items: [
      { label: 'Business workspace', description: 'Your daily operating overview', to: '/app/overview', icon: 'dashboard' },
      { label: 'Sales & customers', description: 'Track revenue and relationships', to: '/app/sales', icon: 'chart' },
      { label: 'Leads', description: 'Manage prospects and follow-ups', to: '/app/leads', icon: 'target' },
      { label: 'Inventory', description: 'Monitor products and stock levels', to: '/app/inventory', icon: 'boxes' },
      { label: 'Invoices & expenses', description: 'Keep business finances organized', to: '/app/invoices', icon: 'receipt' },
      { label: 'Analytics & Business AI', description: 'Turn business data into next actions', to: '/app/analytics', icon: 'sparkles' },
    ],
  },
  {
    key: 'energy',
    label: 'Energy',
    description: 'Solar products, guidance and business solutions.',
    accent: 'emerald',
    items: [
      { label: 'Energy solutions', description: 'Explore residential and commercial options', to: '/energy', icon: 'zap' },
      { label: 'Solar shopping', description: 'Browse focused energy products', to: '/products?category=solar-panels', icon: 'sun' },
      { label: 'Subsidy assistance', description: 'Understand available support pathways', to: '/subsidy', icon: 'badge' },
      { label: 'Commercial procurement', description: 'Request B2B energy supply', to: '/b2b', icon: 'factory' },
      { label: 'Energy enquiries', description: 'Track your energy service requests', to: '/account?tab=services', icon: 'message' },
      { label: 'Become an energy partner', description: 'Offer installation and advisory support', to: '/partner/overview', icon: 'handshake' },
    ],
  },
  {
    key: 'earn',
    label: 'Earn & Partner',
    description: 'Sell, refer and build income through Earnova.',
    accent: 'rose',
    items: [
      { label: 'Referral program', description: 'Invite others and track rewards', to: '/referral', icon: 'share' },
      { label: 'Freelance partner', description: 'Offer professional services', to: '/partner/overview', icon: 'usercheck' },
      { label: 'Product seller', description: 'List and manage products', to: '/partner/listings', icon: 'tag' },
      { label: 'Project seller', description: 'Publish digital projects for buyers', to: '/projects', icon: 'laptop' },
      { label: 'CA or consultant', description: 'Provide trusted business support', to: '/partner/overview', icon: 'shield' },
      { label: 'Partner dashboard', description: 'Manage listings, work and earnings', to: '/partner/overview', icon: 'wallet' },
    ],
  },
]

export const ACCOUNT_TYPES = [
  { value: 'individual', label: 'Individual customer', intent: 'Hire professionals, shop and track requests' },
  { value: 'business_owner', label: 'Business owner', intent: 'Manage and grow a business' },
  { value: 'freelancer', label: 'Freelancer', intent: 'Offer professional services' },
  { value: 'ca_consultant', label: 'CA or consultant', intent: 'Provide trusted business support' },
  { value: 'product_seller', label: 'Product seller', intent: 'List and manage products' },
  { value: 'energy_partner', label: 'Energy partner', intent: 'Support solar and energy enquiries' },
]

export const ONBOARDING_CHECKLISTS = {
  business_owner: [
    'Add business information',
    'Select your industry',
    'Add products or services',
    'Import or enter sales',
    'Add your first customer',
    'View your first business insight',
  ],
  freelancer: ['Complete your provider profile', 'Add skills and pricing', 'Add portfolio details', 'Set availability'],
  ca_consultant: ['Complete your professional profile', 'Add verification details', 'Set services and pricing', 'Set availability'],
  product_seller: ['Complete seller details', 'Add your first listing', 'Confirm fulfilment information', 'Review order settings'],
  energy_partner: ['Complete partner details', 'Add service areas', 'Add capabilities', 'Set enquiry availability'],
  individual: ['Complete your profile', 'Choose services of interest', 'Save contact details'],
}

export const APP_NAV_LINKS = [
  { label: 'Overview', to: '/app/overview' },
  { label: 'Sales', to: '/app/sales' },
  { label: 'Customers', to: '/app/customers' },
  { label: 'Leads', to: '/app/leads' },
  { label: 'Inventory', to: '/app/inventory' },
  { label: 'Invoices', to: '/app/invoices' },
  { label: 'Expenses', to: '/app/expenses' },
  { label: 'Analytics', to: '/app/analytics' },
  { label: 'Business AI', to: '/app/ai' },
  { label: 'Orders', to: '/app/orders' },
  { label: 'Services', to: '/app/services' },
  { label: 'CA Office', to: '/app/ca' },
  { label: 'Support', to: '/app/support' },
  { label: 'Referrals', to: '/app/referrals' },
  { label: 'Notifications', to: '/app/notifications' },
  { label: 'Settings', to: '/app/settings' },
]
