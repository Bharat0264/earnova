const template = [
  ['idea_profile', 'Idea & business profile', 'Capture the foundation for your business.', 'identity', '/start'],
  ['brand_setup', 'Brand setup', 'Define the essentials customers will recognize.', 'identity', '/operate'],
  ['compliance', 'Business registration & compliance', 'Understand which professional support you may need.', 'compliance', '/source'],
  ['digital_presence', 'Digital presence', 'Create a place for customers to find your business.', 'website', '/build'],
  ['payments', 'Payments', 'Set up secure ways to accept customer payments.', 'payments', '/operate'],
  ['products_services', 'Products or services', 'Add what you plan to sell.', 'catalog', '/source'],
  ['operations', 'Suppliers & operations', 'Prepare how your business will deliver.', 'operations', '/operate'],
  ['launch', 'Launch readiness', 'Review your essentials before launch.', 'launch', '/operate'],
  ['first_customer', 'First customer', 'Set up your first path to a customer.', 'customers', '/operate'],
  ['growth', 'Growth', 'Choose your first growth focus.', 'marketing', '/operate'],
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
