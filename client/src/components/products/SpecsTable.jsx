import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/* ══════════════════════════════════════
   SPECS TABLE
══════════════════════════════════════ */
/**
 * @param {{ specs: {key:string, value:string}[], highlights?: string[] }} props
 */
export function SpecsTable({ specs = [], highlights = [] }) {
  if (specs.length === 0 && highlights.length === 0) {
    return <p className="text-gray-400 text-sm py-4">No specifications listed.</p>
  }

  return (
    <div className="space-y-6">
      {highlights.length > 0 && (
        <div>
          <h4 className="font-display font-semibold text-gray-900 text-sm mb-3">Key Highlights</h4>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {specs.length > 0 && (
        <div>
          <h4 className="font-display font-semibold text-gray-900 text-sm mb-3">Specifications</h4>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {specs.map(({ key, value }, i) => (
              <div
                key={i}
                className={`flex text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <span className="w-1/2 px-4 py-2.5 font-medium text-gray-600 border-r border-gray-100">
                  {key}
                </span>
                <span className="w-1/2 px-4 py-2.5 text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   CATEGORY FAQ
══════════════════════════════════════ */
const FAQS = {
  'solar-panels': [
    { q: 'Am I eligible for PM Surya Ghar subsidy?', a: 'Residential households with their own rooftop are eligible. The subsidy is ₹30,000 for 1–2 kW, ₹60,000 for 2–3 kW, and ₹78,000 for 3+ kW systems. Check our Subsidy Info page for full details and state-specific guidance.' },
    { q: 'What is the payback period for solar?', a: 'Most rooftop solar installations in India achieve payback in 4–6 years, after which the electricity is essentially free for the remaining 20+ year life of the panels.' },
    { q: 'Which inverter should I pair with this panel?', a: 'For on-grid systems use a grid-tied inverter (string inverter or microinverter). For off-grid use an MPPT charge controller + battery inverter. Our accessories section has compatible options.' },
    { q: 'Do you offer installation services?', a: 'Yes! After purchase, our partner installers will contact you within 48 hours to schedule a rooftop assessment and installation. Installation charges vary by system size and location.' },
  ],
  'fans': [
    { q: 'What makes BLDC fans better than regular fans?', a: 'BLDC (Brushless DC) motors use 60–70% less electricity than conventional induction motors. A typical BLDC fan uses 28–35W vs 75–80W for a regular fan, saving ₹1,000–1,500 per fan annually at ₹8/unit tariff.' },
    { q: 'Can I use a wall regulator with a BLDC fan?', a: 'Most BLDC fans come with a dedicated remote control. Using a standard resistive wall regulator will damage the BLDC motor. Some models do include a wall switch — check the product specifications.' },
    { q: 'What is the ideal blade span for my room?', a: '900mm for rooms up to 100 sq.ft, 1050mm for 100–150 sq.ft, 1200mm for 150–225 sq.ft, and 1400mm for larger spaces. For high ceilings (>10ft), consider a fan with a down-rod extension.' },
    { q: 'How long do BLDC fans last?', a: 'BLDC motors have no mechanical brushes, so they last significantly longer — typically 10–15 years vs 5–8 years for conventional fans. The bearings are sealed and self-lubricating.' },
  ],
  'acs': [
    { q: 'What is ISEER and why does it matter?', a: 'ISEER (Indian Seasonal Energy Efficiency Ratio) measures AC efficiency over the Indian cooling season. A 5-star (ISEER ≥4.5) AC saves approximately 50% energy vs a 3-star unit, translating to ₹4,000–8,000/year savings.' },
    { q: 'Should I choose R-32 or R-410A refrigerant?', a: 'R-32 is newer, eco-friendlier (lower Global Warming Potential), and about 30% more efficient than R-410A. All our recommended ACs use R-32 refrigerant.' },
    { q: 'What size AC do I need for my room?', a: 'Approximately 0.8 ton per 100 sq.ft for normal rooms. Add 0.5 ton for large glass windows or east/west facing rooms. For kitchens, add 0.5 ton to the base calculation.' },
    { q: 'Does installation come included?', a: 'Standard installation (within 10ft of outdoor unit, on the same floor) is included with your purchase. Additional pipe length, copper wire, or scaffolding charges may apply.' },
  ],
  'accessories': [
    { q: 'What is the difference between MPPT and PWM charge controllers?', a: 'MPPT controllers extract up to 30% more energy from solar panels by tracking the maximum power point. PWM controllers are simpler and cheaper but less efficient. MPPT is recommended for any system above 200W.' },
    { q: 'How long will a 150Ah battery power my home?', a: 'A 150Ah 12V battery stores ~1800Wh usable energy. At 300W load (4 fans + 10 LED lights), it lasts ~6 hours. At 150W load, ~12 hours. Actual backup varies with load and battery health.' },
    { q: 'Can I add more panels to my existing system?', a: 'Yes, as long as your charge controller and inverter can handle the extra capacity. Check the maximum PV input wattage of your existing inverter before adding panels.' },
    { q: 'What maintenance does a tubular battery need?', a: 'Check distilled water levels every 3 months (plates must be fully submerged). Clean terminals with a baking soda solution annually. Keep in a ventilated area away from direct heat.' },
  ],
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4 -mt-1">{a}</p>
      )}
    </div>
  )
}

export function ProductFAQ({ category }) {
  const faqs = FAQS[category] || []
  if (faqs.length === 0)
    return <p className="text-gray-400 text-sm py-4">No FAQs available.</p>

  return (
    <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 px-4">
      {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
    </div>
  )
}
