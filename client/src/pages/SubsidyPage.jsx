import { useState } from 'react'
import { Sun, ArrowRight, ExternalLink, IndianRupee, Zap, CheckCircle2 } from 'lucide-react'
import EligibilityChecker from '../components/subsidy/EligibilityChecker'
import SubsidySteps       from '../components/subsidy/SubsidySteps'
import DocumentChecklist  from '../components/subsidy/DocumentChecklist'
import AssistanceForm     from '../components/subsidy/AssistanceForm'

const SCHEME_FACTS = [
  { val: '₹75,021 Cr', label: 'Total scheme outlay' },
  { val: '1 Crore',    label: 'Homes targeted by 2027' },
  { val: '₹78,000',    label: 'Maximum subsidy per house' },
  { val: '300 units',  label: 'Free electricity/month' },
]

const TABS = ['Eligibility', 'How to Apply', 'Documents', 'Get Help']

export default function SubsidyPage() {
  const [activeTab,    setActiveTab]    = useState('Eligibility')
  const [eligResult,   setEligResult]   = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-yellow-600 via-orange-500 to-yellow-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-dots pointer-events-none" />
        <div className="relative section-wrapper py-12 lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25
                            text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Sun className="w-3 h-3" /> Government Scheme Guide
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
              PM Surya Ghar
              <span className="block text-yellow-200 mt-0.5">Solar Subsidy Guide</span>
            </h1>
            <p className="text-yellow-100 text-base leading-relaxed mb-6 max-w-xl">
              India's largest rooftop solar scheme offers up to <strong className="text-white">₹78,000 subsidy</strong> per household.
              Check your eligibility, understand the process, and get free expert guidance from Earnova.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#eligibility"
                 className="bg-white text-yellow-700 font-bold text-sm px-5 py-2.5 rounded-xl
                            hover:bg-yellow-50 transition-colors flex items-center gap-2">
                Check My Eligibility <ArrowRight className="w-4 h-4" />
              </a>
              <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white
                            border border-white/30 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                Official Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Scheme facts */}
        <div className="relative bg-black/20 border-t border-white/10">
          <div className="section-wrapper py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SCHEME_FACTS.map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display font-extrabold text-xl text-white">{val}</p>
                  <p className="text-yellow-200 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What is PM Surya Ghar ── */}
      <div className="section-wrapper py-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 mb-8">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3">
            What is PM Surya Ghar Muft Bijli Yojana?
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Launched in February 2024 by the Government of India, this scheme provides financial support 
            to residential households for installing rooftop solar systems. The scheme aims to make 1 crore 
            homes solar-powered by 2027, providing 300 units of free electricity per month and significantly 
            reducing household electricity bills.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { Icon: IndianRupee, label: 'Central Subsidy', desc: 'Up to ₹78,000 directly in your bank', color: 'text-yellow-600 bg-yellow-50' },
              { Icon: Zap,         label: 'Free Units',       desc: '300 units/month of free electricity', color: 'text-eco-600 bg-eco-50' },
              { Icon: CheckCircle2,label: 'Loan Support',     desc: 'Collateral-free loan up to ₹2 lakh at 7%', color: 'text-blue-600 bg-blue-50' },
            ].map(({ Icon, label, desc, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${color.split(' ')[1]} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-max py-4 px-4 text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? 'bg-white text-yellow-700 border-b-2 border-yellow-500 -mb-px'
                          : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                      }`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 lg:p-6">
            {activeTab === 'Eligibility' && (
              <div id="eligibility" className="space-y-5">
                <p className="text-sm text-gray-500">
                  Answer a few quick questions to instantly check your eligibility for PM Surya Ghar subsidy.
                </p>
                <EligibilityChecker onEligibleResult={setEligResult} />
                {eligResult?.isEligible && (
                  <div className="bg-eco-50 border border-eco-100 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-eco-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-eco-800 text-sm">Great! Move to the next steps</p>
                      <p className="text-eco-700 text-xs mt-0.5">
                        Click the <strong>"How to Apply"</strong> tab to see the step-by-step application process.
                      </p>
                      <button onClick={() => setActiveTab('How to Apply')}
                              className="mt-2 text-xs font-bold text-eco-700 border border-eco-300 px-3 py-1.5 rounded-lg hover:bg-eco-100 transition-colors">
                        See How to Apply →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'How to Apply' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Follow these 7 steps to apply for PM Surya Ghar subsidy and start saving on electricity bills.
                </p>
                <SubsidySteps />
              </div>
            )}

            {activeTab === 'Documents' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Use this interactive checklist to track the documents you need. Select your state for state-specific requirements.
                </p>
                <DocumentChecklist />
              </div>
            )}

            {activeTab === 'Get Help' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Our solar subsidy experts handle the entire application process for you — completely free.
                </p>
                <AssistanceForm prefilledData={eligResult} />
              </div>
            )}
          </div>
        </div>

        {/* ── FAQ callout ── */}
        <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-gray-900 mb-1">Have more questions?</h3>
            <p className="text-gray-500 text-sm">Our subsidy FAQs cover the most common doubts about the scheme, documents, and timelines.</p>
          </div>
          <button onClick={() => setActiveTab('Get Help')}
                  className="shrink-0 btn-primary text-sm flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600">
            Talk to an Expert <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
