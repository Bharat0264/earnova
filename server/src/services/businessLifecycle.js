const template = [
  ['business_idea', 'Define Business Idea', 'Capture the business you want to build and the customer it serves.', 'identity', '/start'],
  ['brand_identity', 'Brand & Identity', 'Define the essentials customers will recognise.', 'identity', '/business/passport'],
  ['business_registration', 'Business Registration', 'Record the registration and compliance work your business needs.', 'compliance', '/business/passport'],
  ['source_packaging', 'Source Packaging', 'Create a sourcing request for packaging or other operational supplies.', 'suppliers', '/source'],
  ['build_online_store', 'Build Online Store', 'Create a project for your website or online store.', 'website', '/build'],
  ['add_products', 'Add Products', 'Add the products or services your business will offer.', 'products', '/app/inventory'],
  ['connect_payments', 'Connect Payments', 'Review payment readiness in your business workspace.', 'payments', '/operate'],
  ['configure_delivery', 'Configure Delivery', 'Set up the fulfilment information your business needs.', 'fulfilment', '/operate/status'],
  ['launch_market', 'Launch & Market', 'Review launch readiness and choose your first customer-growth action.', 'marketing', '/operate'],
]

export const roadmapTemplate = () => template.map(([stepKey, title, description, category, recommendedRoute], index) => ({
  stepKey, title, description, category, recommendedRoute,
  dependsOn: index ? [template[index - 1][0]] : [],
  required: true,
}))

export const getRecommendation = ({ state = {}, productCount = 0, orderCount = 0 }) => {
  if (!['ACTIVE', 'COMPLETED'].includes(state.website)) return { stepKey: 'build_website', title: 'Build your website', reason: 'Your business does not have an active website yet.', route: '/build/start' }
  if (!['ACTIVE', 'COMPLETED'].includes(state.payments)) return { stepKey: 'connect_payments', title: 'Connect payment gateway', reason: 'Your website is ready but online payments are not configured.', route: '/business/payments' }
  if (productCount === 0) return { stepKey: 'add_products', title: 'Add products or services', reason: 'Customers need something to buy or enquire about.', route: '/business/products' }
  if (orderCount === 0) return { stepKey: 'start_marketing', title: 'Start marketing', reason: 'Your catalogue is ready; the next step is reaching customers.', route: '/business/marketing' }
  return { stepKey: 'first_order', title: 'Review your business performance', reason: 'Your foundation is in place. Review orders and decide what to improve next.', route: '/business/analytics' }
}
