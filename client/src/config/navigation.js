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
  { label: 'Business', to: '/business' },
  { label: 'Services', to: '/services' },
  { label: 'Energy', to: '/energy' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Pricing', to: '/pricing' },
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
  { label: 'Referrals', to: '/app/referrals' },
  { label: 'Notifications', to: '/app/notifications' },
  { label: 'Settings', to: '/app/settings' },
]

