import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Briefcase, Building2, Check, ChevronRight,
  Code2, Cpu, FileCheck2, FileText, Headphones, Layers3,
  LineChart, Megaphone, Palette, PenTool, ShieldCheck,
  ShoppingBag, Sparkles, SunMedium, UsersRound, Video, WalletCards,
} from 'lucide-react'

const TALENT = [
  { Icon: Code2, name: 'Development', color: 'bg-blue-50 text-blue-700' },
  { Icon: Palette, name: 'Design', color: 'bg-fuchsia-50 text-fuchsia-700' },
  { Icon: Megaphone, name: 'Marketing', color: 'bg-orange-50 text-orange-700' },
  { Icon: PenTool, name: 'Writing', color: 'bg-emerald-50 text-emerald-700' },
  { Icon: Video, name: 'Video', color: 'bg-rose-50 text-rose-700' },
  { Icon: Cpu, name: 'Data & AI', color: 'bg-violet-50 text-violet-700' },
]

const PARTNERS = [
  { name: 'Solar Panel Partnership', note: 'Focused solar catalog for residential and commercial demand', letter: 'S', tone: 'from-yellow-50 to-white' },
  { name: 'B2B Solar Leads', note: 'Bulk enquiries for homes, offices, institutions and housing projects', letter: 'B', tone: 'from-emerald-50 to-white' },
]

const ECOSYSTEM = [
  {
    Icon: SunMedium,
    title: 'Energy Solutions',
    text: 'Solar products, installation support, subsidy guidance and green-energy planning.',
    to: '/energy-solutions',
    cta: 'Explore solar',
    tone: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  },
  {
    Icon: ShoppingBag,
    title: 'Shop at Earnova',
    text: 'Solar-first commerce with product access controlled from the admin panel.',
    to: '/products',
    cta: 'Shop products',
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    Icon: Briefcase,
    title: 'Freelancing',
    text: 'Hire talent or become a freelancer with protected job workflow and admin visibility.',
    to: '/freelance',
    cta: 'Open freelance',
    tone: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  {
    Icon: LineChart,
    title: 'Business Solutions',
    text: 'AI business dashboard for sales, profit, churn, inventory, ledger and forecasts.',
    to: '/business-solutions',
    cta: 'Use AI portal',
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  {
    Icon: FileCheck2,
    title: 'CA Services',
    text: 'Verified chartered accountants for ITR, GST, bookkeeping, TDS, notices and accounts.',
    to: '/ca-services',
    cta: 'Open CA desk',
    tone: 'bg-lime-50 text-lime-700 border-lime-100',
  },
  {
    Icon: UsersRound,
    title: 'Earn & Refer',
    text: 'Referral tools, wallet visibility and member growth programs for Earnova users.',
    to: '/referral',
    cta: 'Start referring',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    Icon: Layers3,
    title: 'Bulk & B2B',
    text: 'Bulk quotes for apartments, offices, institutions and commercial product needs.',
    to: '/b2b',
    cta: 'Request quote',
    tone: 'bg-slate-50 text-slate-700 border-slate-100',
  },
]

const INVESTOR_METRICS = [
  ['7+', 'service lines', 'commerce, freelance, analytics, CA, B2B, subsidy, referral'],
  ['5', 'revenue channels', 'sales margin, SaaS, service fee, CA fee, B2B leads'],
  ['1', 'operating system', 'admin verified users, jobs, CAs, orders and products'],
]

const REVENUE_STREAMS = [
  ['Solar commerce', 'Margin on solar panel sales and installation-led product demand.', ShoppingBag, 'bg-yellow-50 text-yellow-700'],
  ['Freelance marketplace', 'Service fee on paid job flow with reduced 1.5% fee above INR 2,500.', Briefcase, 'bg-violet-50 text-violet-700'],
  ['Business analytics', 'Subscription-ready AI dashboard for sales, orders, churn and inventory insights.', BarChart3, 'bg-cyan-50 text-cyan-700'],
  ['CA services', 'Verified professional network for ITR, GST, TDS and business compliance work.', FileCheck2, 'bg-lime-50 text-lime-700'],
  ['B2B leads', 'Bulk solar and business enquiries routed through admin-managed workflows.', Building2, 'bg-slate-100 text-slate-700'],
]

const TRUST_SIGNALS = [
  ['Admin verification', 'Freelancers, CA applicants, product access and work queues are controlled by admin review.'],
  ['Payment confidence', 'Razorpay-ready flows, escrow-style freelance payment design and clear release states.'],
  ['Business depth', 'Daily earnings, sales, orders, forecasts, churn, inventory and manual-entry analytics.'],
  ['Service breadth', 'One account connects solar, freelance work, CA help, B2B requests and referrals.'],
]

const PROOF_MODULES = [
  ['Admin cockpit', 'Users, access, jobs, CA verification, product catalog, orders and payout queues.'],
  ['Business AI', 'Sales prediction, churn risk, reorder alerts, daily earnings and best-selling product views.'],
  ['Service desks', 'Freelance jobs and CA tax work move through assigned, reviewed, filed and completed states.'],
]

function TalentCard({ Icon, name, color }) {
  return (
    <Link to="/freelance?mode=hire" className="group rounded-2xl border border-slate-200 bg-white p-4 hover:-translate-y-1 hover:shadow-xl transition-all">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-display font-bold text-slate-900 mt-4">{name}</p>
      <p className="text-xs text-slate-500 mt-1">Find skilled professionals</p>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all mt-3" />
    </Link>
  )
}

function InvestorControlRoom() {
  return (
    <div className="rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_70px_rgba(15,23,42,0.28)] border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <p className="font-display font-bold text-sm">Earnova operating dashboard</p>
          <p className="text-[11px] text-slate-400">Investor-ready platform view</p>
        </div>
        <span className="text-[11px] font-bold bg-emerald-400/15 text-emerald-300 px-2.5 py-1 rounded-full">Multi-service</span>
      </div>
      <div className="p-5 grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Revenue', '5 streams'],
            ['Trust', 'Verified'],
            ['Focus', 'Solar-first'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
              <p className="font-display font-bold text-lg mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white text-slate-950 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-sm">Business intelligence preview</p>
              <p className="text-xs text-slate-500">Sales, orders, churn and inventory signals</p>
            </div>
            <LineChart className="w-5 h-5 text-cyan-700" />
          </div>
          <div className="h-24 flex items-end gap-2">
            {[46, 68, 54, 82, 76, 92, 88, 100].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary-700 to-cyan-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['CA queue', 'Proof verified'],
            ['Freelance jobs', 'Escrow tracked'],
            ['Solar catalog', 'Partner focused'],
            ['Referral engine', 'Growth loop'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs text-slate-400 mt-1">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,#f8fafc_0%,#eef7f3_54%,#fff7ed_100%)]">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="section-wrapper relative py-14 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-emerald-100 shadow-sm px-3 py-1.5 text-xs font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5" /> One platform to buy, hire, analyze, comply and earn.
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-[4rem] leading-[1.04] text-slate-950 mt-6">
                Earnova is a multi-service growth platform for India&apos;s digital and solar economy.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mt-6">
                Solar commerce, freelancing, AI business analytics, CA services, B2B workflows and referrals run from one account with admin verification and payment-ready operations.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/investors" className="btn-primary text-base">
                  <LineChart className="w-5 h-5" /> Investor snapshot
                </Link>
                <Link to="/business-solutions" className="btn-secondary text-base">
                  <BarChart3 className="w-5 h-5" /> View business AI
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-8">
                {INVESTOR_METRICS.map(([value, label, text]) => (
                  <div key={label} className="rounded-2xl bg-white/80 border border-white shadow-sm p-4">
                    <p className="font-display font-black text-2xl text-slate-950">{value}</p>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mt-1">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <InvestorControlRoom />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="section-wrapper py-7 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            [ShieldCheck, 'Protected payments', 'Razorpay-ready and escrow-style flows'],
            [UsersRound, 'Two-sided platform', 'Customers, freelancers, businesses and CAs'],
            [WalletCards, 'Growth loops', 'Referral, wallet and member earning mechanics'],
            [Headphones, 'Admin control', 'Verification, assignment and status tracking'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-violet-700 mt-0.5 shrink-0" />
              <div><p className="font-bold text-sm text-slate-900">{title}</p><p className="text-xs text-slate-500 mt-0.5">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Why Earnova</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-950 mt-2">
              Built like a company, not just a collection of pages.
            </h2>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Earnova combines demand generation, payments, professional verification, business intelligence and service delivery into one operating platform. That gives investors a clearer story: multiple monetization paths under one trusted brand.
            </p>
            <Link to="/investors" className="btn-primary mt-6">
              View investor page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TRUST_SIGNALS.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700 mb-4" />
                <h3 className="font-display font-bold text-slate-950">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Earnova ecosystem</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-950 mt-2">
              One account for work, solar, compliance and business growth.
            </h2>
            <p className="text-slate-500 mt-3 max-w-2xl">
              Customers can shop solar, hire freelancers, analyze business performance, request CA/tax support, generate B2B enquiries and grow through referrals from one connected platform.
            </p>
          </div>
          <Link to="/business-solutions" className="btn-primary shrink-0">
            Try Business AI <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ECOSYSTEM.map(({ Icon, title, text, to, cta, tone }) => (
            <Link key={title} to={to} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-card-hover transition-all">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-950 mt-5">{title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{text}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 mt-5">
                {cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100">
        <div className="section-wrapper py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Revenue model</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-950 mt-2">
                Five ways Earnova can earn as the ecosystem grows.
              </h2>
            </div>
            <Link to="/investors" className="font-bold text-sm text-violet-700 flex items-center gap-1">
              See full snapshot <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            {REVENUE_STREAMS.map(([title, text, Icon, tone]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-950 mt-5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          <div className="rounded-[2rem] bg-slate-950 text-white p-6 lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Product proof</p>
            <h2 className="font-display text-3xl font-bold mt-3">Dashboards that make the platform feel alive.</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {PROOF_MODULES.map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4 text-slate-950">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">Daily platform signals</p>
                <FileText className="w-5 h-5 text-primary-700" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {['Sales', 'Orders', 'Jobs', 'CA cases'].map((item, index) => (
                  <div key={item} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item}</p>
                    <p className="font-display font-bold text-lg mt-1">{[128, 42, 19, 11][index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Investor clarity</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-950 mt-2">
              The site now tells a fundable story in seconds.
            </h2>
            <p className="text-slate-500 leading-relaxed mt-4">
              A visitor can immediately see what Earnova does, how it earns, why users trust it, and how each service connects to the same operating system.
            </p>
            <div className="space-y-3 mt-6">
              {['Clear positioning', 'Visible monetization', 'Trust and verification', 'Operational dashboards'].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">Explore talent</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-950 mt-2">Get almost anything done</h2>
          </div>
          <Link to="/freelance?mode=hire" className="font-bold text-sm text-violet-700 flex items-center gap-1">Post your requirement <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TALENT.map(item => <TalentCard key={item.name} {...item} />)}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="section-wrapper py-16 lg:py-20">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">The Earnova promise</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mt-3">Money moves only when the work does.</h2>
              <p className="text-slate-400 mt-4 leading-relaxed">The client funds the complete deal upfront. Earnova holds it securely, then releases the agreed job amount after completion.</p>
              <Link to="/freelance?mode=hire" className="inline-flex items-center gap-2 mt-6 font-bold text-violet-300">Start a protected job <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ['01', 'Agree', 'Define work, duration, and freelancer payment.'],
                ['02', 'Fund', 'Hiring party pays job value plus Earnova fee, reduced to 1.5% above INR 2,500.'],
                ['03', 'Release', 'Freelancer is paid after approved completion.'],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <span className="font-display text-3xl font-black text-violet-300">{number}</span>
                  <h3 className="font-display font-bold mt-5">{title}</h3>
                  <p className="text-sm text-slate-400 mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper py-16 lg:py-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-slate-200 p-7 lg:p-10">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
                <ShoppingBag className="w-3.5 h-3.5" /> Shop at Earnova
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-950 mt-4">Solar-first commerce with a cleaner partner story.</h2>
              <p className="text-slate-600 mt-3">Earnova now focuses the shop on active solar-panel partnership items, making the commerce story simpler for customers, partners and investors.</p>
              <Link to="/products" className="btn-primary mt-6">Shop solar products <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Current commerce focus</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {PARTNERS.map(partner => (
                  <Link key={partner.name} to="/products" className={`group rounded-2xl border border-white bg-gradient-to-br ${partner.tone} p-5 shadow-sm hover:shadow-lg transition-all`}>
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-display text-xl font-black text-slate-900">{partner.letter}</div>
                    <h3 className="font-display text-xl font-bold text-slate-950 mt-5">{partner.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{partner.note}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 mt-4">View solar catalog <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrapper pb-16 lg:pb-20">
        <div className="rounded-[2rem] bg-slate-950 text-white p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Ready for conversations</p>
            <h2 className="font-display text-3xl font-bold mt-3">Show Earnova as a serious platform, not just an application.</h2>
            <p className="text-slate-400 mt-3 max-w-2xl">Use the investor page when explaining the product, revenue model, trust layer and roadmap to potential partners or funders.</p>
          </div>
          <Link to="/investors" className="btn-primary shrink-0">
            Open investor snapshot <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
