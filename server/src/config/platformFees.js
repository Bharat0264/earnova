export const PLATFORM_FEE_SERVICES = [
  { key: 'shopping', label: 'Shopping', customerPartyLabel: 'Customer', providerPartyLabel: 'Seller' },
  { key: 'freelance', label: 'Freelance services', customerPartyLabel: 'Client', providerPartyLabel: 'Freelancer' },
  { key: 'ca', label: 'CA & tax services', customerPartyLabel: 'Customer', providerPartyLabel: 'CA firm' },
  { key: 'projects', label: 'Project marketplace', customerPartyLabel: 'Buyer', providerPartyLabel: 'Project seller' },
  { key: 'energy', label: 'Energy services', customerPartyLabel: 'Customer', providerPartyLabel: 'Energy partner' },
  { key: 'business-services', label: 'Business services', customerPartyLabel: 'Customer', providerPartyLabel: 'Service provider' },
]

const zeroFee = { type: 'percentage', value: 0 }

export const DEFAULT_PLATFORM_FEES = Object.fromEntries(
  PLATFORM_FEE_SERVICES.map(service => [
    service.key,
    {
      ...service,
      customerFee: service.key === 'freelance' ? { type: 'percentage', value: 10 } : { ...zeroFee },
      providerFee: { ...zeroFee },
      version: 1,
      source: 'default',
    },
  ])
)

export const getPlatformFeeDefinition = serviceKey =>
  PLATFORM_FEE_SERVICES.find(service => service.key === serviceKey)

