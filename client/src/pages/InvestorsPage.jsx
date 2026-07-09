import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Briefcase, Building2, Check, FileCheck2, LineChart,
  ShieldCheck, ShoppingBag, Sparkles, SunMedium, UsersRound,
} from 'lucide-react'

const SNAPSHOT = [
  ['Problem', 'Customers need trusted solar products, verified services, business tools and professional help, but these needs are scattered across separate platforms.'],
  ['Solution', 'Earnova brings solar commerce, freelancing, business analytics, CA services, B2B, subsidy and referral flows into one admin-managed ecosystem.'],
  ['Users', 'Solar buyers, freelancers, businesses, chartered accountants, B2B customers and referral-driven members.'],
  ['Moat', 'Multi-service workflows, admin verification, payment-ready flows, business dashboards and one connected user account.'],
]

const REVENUE = [
  ['Solar commerce', 'Product margins and installation-led demand', ShoppingBag],
  ['Freelance fee', 'Commission on protected job payments', Briefcase],
  ['Business SaaS', 'Subscription-ready analytics dashboard', BarChart3],
  ['CA services', 'Professional service commission potential', FileCheck2],
  ['B2B leads', 'Bulk solar and institutional enquiries', Building2],
]

const ROADMAP = [
  ['Now', 'Solar-first shop, freelancing, CA verification, admin control and business analytics.'],
  ['Next', 'Live integrations for POS, accounting, CRM and marketplace data in Business Solutions.'],
  ['Scale', 'Verified partner network for solar installers, accountants, freelancers and B2B sellers.'],
]

export default function InvestorsPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-950 text-white">
        <div className="section-wrapper py-14 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" /> Investor snapshot
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-5">
                Earnova is built to become an all-rounder services ecosystem.
              </h1>
              <p className="text-slate-300 leading-relaxed mt-5 max-w-2xl">
                The platform combines solar commerce, freelancing, AI business analytics, CA services, B2B workflows, subsidies and referrals under one admin-controlled operating layer.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/business-solutions" className="btn-primary">
                  See Business AI <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/" className="btn-secondary bg-white text-slate-950 hover:bg-slate-100">
                  Back to Earnova
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white text-slate-950 p-5 lg:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Platform metrics</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  ['7+', 'services'],
                  ['5', 'revenue paths'],
                  ['1', 'admin cockpit'],
                  ['Solar', 'current commerce focus'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="font-display font-black text-2xl">{value}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-slate-950 text-white p-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">Business intelligence layer</p>
                  <LineChart className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="h-20 flex items-end gap-2 mt-4">
                  {[52, 68, 62, 78, 91, 84, 100].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-300" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-14 lg:py-18">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SNAPSHOT.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-4" />
              <h2 className="font-display font-bold text-xl text-slate-950">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100">
        <div className="section-wrapper py-14 lg:py-18">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Business model</p>
              <h2 className="font-display text-3xl font-bold text-slate-950 mt-2">Revenue can come from multiple operating layers.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            {REVENUE.map(([title, text, Icon]) => (
              <div key={title} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <Icon className="w-6 h-6 text-primary-700" />
                <h3 className="font-display font-bold text-slate-950 mt-5">{title}</h3>
                <p className="text-sm text-slate-500 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-14 lg:py-18">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Trust layer</p>
            <h2 className="font-display text-3xl font-bold text-slate-950 mt-2">Earnova becomes stronger when every service is verified and trackable.</h2>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Admins can control Shop access, monitor freelance jobs, verify CA professionals, track client tax work, view orders, and manage users. This gives the platform operational seriousness.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              [SunMedium, 'Solar-first catalog'],
              [Briefcase, 'Freelance job tracking'],
              [FileCheck2, 'CA proof verification'],
              [UsersRound, 'Referral growth loop'],
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-2xl bg-slate-950 text-white p-5">
                <Icon className="w-6 h-6 text-emerald-300" />
                <p className="font-display font-bold mt-5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper pb-16 lg:pb-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-50 via-white to-violet-50 border border-slate-200 p-7 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Roadmap</p>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            {ROADMAP.map(([stage, text]) => (
              <div key={stage} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <p className="font-display font-black text-2xl text-primary-700">{stage}</p>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {['Clear problem', 'Multi-revenue model', 'Admin trust layer', 'Expandable services'].map(item => (
              <span key={item} className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                <Check className="w-4 h-4 text-emerald-600" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
