import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    step:  '01',
    title: 'Sign Up & Get Your Link',
    desc:  'Create your free Earnova account and instantly receive a unique referral link tied to your profile.',
    accent: 'bg-primary-700',
    ring:   'ring-primary-100',
  },
  {
    step:  '02',
    title: 'Share With Your Network',
    desc:  'Share via WhatsApp, Instagram, or email — with friends, family, or business contacts anywhere in India.',
    accent: 'bg-eco-600',
    ring:   'ring-eco-100',
  },
  {
    step:  '03',
    title: 'They Shop, You Earn',
    desc:  'For every purchase made through your link, you earn a commission — instantly credited to your wallet.',
    accent: 'bg-primary-800',
    ring:   'ring-primary-100',
  },
  {
    step:  '04',
    title: 'Withdraw Anytime',
    desc:  'Withdraw earnings to your bank or UPI with no minimum withdrawal limit — fast and hassle-free.',
    accent: 'bg-eco-700',
    ring:   'ring-eco-100',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="section-wrapper">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700
                          text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            Referral Program
          </div>
          <h2 className="section-title">How Referrals Work</h2>
          <p className="section-sub max-w-lg mx-auto">
            Join thousands earning through the Earnova Referral Program —
            simple, transparent, and instant.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ step, title, desc, accent, ring }, index) => (
            <div key={step} className="relative">
              {/* Connector line (desktop only, not on last item) */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-[calc(100%-1rem)] w-8 h-px bg-gray-200 z-0" />
              )}

              <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-6
                              shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                {/* Step badge */}
                <div className={`w-11 h-11 ${accent} ring-4 ${ring} rounded-2xl
                                 flex items-center justify-center mb-4`}>
                  <span className="text-white font-display font-bold text-sm">{step}</span>
                </div>

                <h3 className="font-display font-bold text-gray-900 text-base mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/referral" className="btn-primary inline-flex items-center gap-2 text-base">
            Join the Program <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-gray-400 text-xs mt-3">
            Free to join · No minimum withdrawal · Instant wallet credit
          </p>
        </div>
      </div>
    </section>
  )
}
