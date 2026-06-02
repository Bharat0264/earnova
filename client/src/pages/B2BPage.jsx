import { Link } from 'react-router-dom'
import { Building2, GraduationCap, HeartPulse, Briefcase, Factory, HeartHandshake, Wrench, ArrowRight, CheckCircle2, Zap, Users, IndianRupee, Globe } from 'lucide-react'
import QuoteForm from '../components/b2b/QuoteForm'

const SEGMENTS = [
  { Icon: Building2,    label: 'Apartment Complexes', desc: 'Rooftop solar + BLDC fans for entire buildings'  },
  { Icon: GraduationCap,label: 'Schools & Colleges',  desc: '5-star ACs and solar for classrooms'            },
  { Icon: HeartPulse,   label: 'Hospitals & Clinics', desc: 'Reliable energy with inverter backup solutions'  },
  { Icon: Briefcase,    label: 'Offices & IT Parks',  desc: 'BLDC fans + 5-star ACs to cut power bills'      },
  { Icon: Factory,      label: 'Factories & Industry',desc: 'Large-scale solar for industrial power needs'    },
  { Icon: HeartHandshake,label: 'Dealers & Distributors',desc: 'Bulk inventory at distributor pricing'         },
  { Icon: Wrench,       label: 'Contractors & Installers', desc: 'Trade pricing + project support'             },
  { Icon: Globe,        label: 'Government & PSUs',   desc: 'GeM-registered; DPIIT eligible'                 },
]

const BENEFITS = [
  { title: 'Bulk Pricing',           desc: 'Up to 30% off MRP for qualifying order sizes' },
  { title: 'Dedicated Manager',      desc: 'Single point of contact for your account'     },
  { title: 'Priority Installation',  desc: 'Pan-India installation network & support'     },
  { title: 'Custom EMI Plans',       desc: 'Flexible payment terms for large projects'    },
  { title: 'Higher Referral Commission', desc: '8–12% for referrers who bring B2B leads'  },
  { title: 'GST Invoice & Credits',  desc: 'Proper B2B invoicing for input tax credit'    },
]

const STATS = [
  { val: '500+',   label: 'B2B Clients Served'  },
  { val: '28',     label: 'States Covered'       },
  { val: '₹4 Cr+', label: 'Bulk Orders Fulfilled'},
  { val: '48 hrs', label: 'Quote Turnaround'     },
]

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-dots pointer-events-none" />
        <div className="relative section-wrapper py-14 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80
                            text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Building2 className="w-3 h-3" /> B2B Solutions
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5">
              Bulk Energy Solutions
              <span className="block text-yellow-300 mt-1">for Every Business</span>
            </h1>
            <p className="text-primary-200 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              Custom quotations for solar panels, BLDC fans, 5-star ACs, and accessories — with dedicated support,
              bulk pricing, and installation across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#quote" className="btn-primary bg-yellow-400 hover:bg-yellow-300 text-primary-950 flex items-center gap-2">
                Request Custom Quote <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/referral" className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white
                                              border border-white/30 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <Zap className="w-4 h-4 text-yellow-400" /> Refer a Business → Earn 8–12%
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-black/20 border-t border-white/10">
          <div className="section-wrapper py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display font-extrabold text-xl lg:text-2xl text-white">{val}</p>
                  <p className="text-primary-300 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-wrapper py-12 space-y-14">

        {/* ── Who we serve ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="section-title">Who We Serve</h2>
            <p className="section-sub max-w-lg mx-auto">
              Custom energy solutions for every kind of organization across India.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SEGMENTS.map(({ Icon, label, desc }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card
                                          hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 text-sm mb-1">{label}</h3>
                <p className="text-gray-400 text-xs leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="bg-white border border-gray-100 rounded-3xl shadow-card p-8">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-6 text-center">
            Why Choose Earnova B2B?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-eco-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── B2B Referral callout ── */}
        <section className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-3xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <IndianRupee className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Refer a Business — Earn 8–12%</h3>
                <p className="text-primary-200 text-sm mt-0.5 max-w-md">
                  Bring a dealer, school, apartment complex, or contractor to Earnova and earn 8–12% commission
                  on the total order value — significantly higher than standard referrals.
                </p>
              </div>
            </div>
            <Link to="/referral"
                  className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-primary-950 font-bold text-sm
                             px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
              Join Referral Program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Quote Form ── */}
        <section id="quote">
          <div className="text-center mb-6">
            <h2 className="section-title">Request a Custom Quote</h2>
            <p className="section-sub max-w-lg mx-auto">
              Fill in your requirements and our B2B team will send a customised quote within 24 hours.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <QuoteForm />
          </div>
        </section>
      </div>
    </div>
  )
}
