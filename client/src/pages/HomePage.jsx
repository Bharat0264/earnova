import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Briefcase, Check, ChevronRight, CircleDollarSign,
  Code2, Cpu, Headphones, Layers3, LockKeyhole, Megaphone, Palette, PenTool,
  Play, ShieldCheck, ShoppingBag, Sparkles, Star, UserRoundSearch, UsersRound,
  Video, WalletCards,
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
  { name: 'Havells', note: 'Smart home and energy products', letter: 'H', tone: 'from-red-50 to-white' },
  { name: 'Prestige', note: 'Trusted lifestyle appliances', letter: 'P', tone: 'from-blue-50 to-white' },
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

function MarketplacePreview() {
  const people = [
    ['AK', 'Ananya K.', 'UI/UX Designer', '4.9'],
    ['RS', 'Rahul S.', 'Full-stack Developer', '4.8'],
    ['NM', 'Neha M.', 'Content Strategist', '5.0'],
  ]
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-violet-500/15 blur-3xl rounded-full" />
      <div className="relative rounded-[2rem] bg-white border border-white/70 shadow-[0_30px_80px_rgba(46,16,101,0.18)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 text-white">
          <div>
            <p className="font-display font-bold text-sm">Talent ready to work</p>
            <p className="text-[11px] text-slate-400">Matched through Earnova</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-400/15 text-emerald-300 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
        <div className="p-5 space-y-3">
          {people.map(([initials, name, role, rating], index) => (
            <div key={name} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-violet-100 text-violet-700' : index === 1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating}
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 flex items-center gap-3">
            <LockKeyhole className="w-5 h-5 text-violet-700" />
            <div>
              <p className="font-bold text-violet-950 text-sm">Payment protected by Earnova</p>
              <p className="text-xs text-violet-700 mt-0.5">Funds release after completed work</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-5 top-20 hidden sm:flex items-center gap-2 rounded-2xl bg-white shadow-xl border border-slate-100 px-3 py-2.5">
        <BadgeCheck className="w-5 h-5 text-emerald-600" />
        <span className="text-xs font-bold text-slate-800">Verified profiles</span>
      </div>
      <div className="absolute -right-4 bottom-14 hidden sm:flex items-center gap-2 rounded-2xl bg-slate-950 text-white shadow-xl px-3 py-2.5">
        <CircleDollarSign className="w-5 h-5 text-violet-300" />
        <span className="text-xs font-bold">10% client fee</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#f8f7fc]">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute -top-32 right-0 w-[34rem] h-[34rem] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="section-wrapper relative py-14 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-violet-100 shadow-sm px-3 py-1.5 text-xs font-bold text-violet-800">
                <Sparkles className="w-3.5 h-3.5" /> Work. Earn. Grow—with protection.
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-[4rem] leading-[1.04] text-slate-950 mt-6">
                Where ambitious work <span className="text-gradient">finds the right people.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mt-6">
                Earnova connects businesses with skilled freelancers and protects every deal from funding to final delivery.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/freelance?mode=hire" className="btn-primary text-base">
                  <UserRoundSearch className="w-5 h-5" /> Hire a freelancer
                </Link>
                <Link to="/freelance?mode=freelancer" className="btn-secondary text-base">
                  <Briefcase className="w-5 h-5" /> Become a freelancer
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-sm text-slate-600">
                {['Secure escrow', 'Clear 10% client fee', 'Freelancer gets full agreed amount'].map(item => (
                  <span key={item} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> {item}</span>
                ))}
              </div>
            </div>
            <MarketplacePreview />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="section-wrapper py-7 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            [ShieldCheck, 'Protected payments', 'Funds held by Earnova'],
            [UsersRound, 'Two-sided platform', 'Hire talent or find work'],
            [WalletCards, 'Fair freelancer pay', 'No fee taken from earnings'],
            [Headphones, 'Mediation support', 'Earnova stays in the middle'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-violet-700 mt-0.5 shrink-0" />
              <div><p className="font-bold text-sm text-slate-900">{title}</p><p className="text-xs text-slate-500 mt-0.5">{text}</p></div>
            </div>
          ))}
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
                ['02', 'Fund', 'Hiring party pays job value plus Earnova’s 10% fee.'],
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
        <div className="rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-violet-50 border border-slate-200 p-7 lg:p-10">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
                <ShoppingBag className="w-3.5 h-3.5" /> Shop at Earnova
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-950 mt-4">Shop trusted products at Earnova.</h2>
              <p className="text-slate-600 mt-3">Every registered user can shop. E-commerce-approved members additionally see and receive eligible product member earnings.</p>
              <Link to="/products" className="btn-primary mt-6">Shop at Earnova <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Our commerce partners</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {PARTNERS.map(partner => (
                  <Link key={partner.name} to="/products" className={`group rounded-2xl border border-white bg-gradient-to-br ${partner.tone} p-5 shadow-sm hover:shadow-lg transition-all`}>
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-display text-xl font-black text-slate-900">{partner.letter}</div>
                    <h3 className="font-display text-xl font-bold text-slate-950 mt-5">{partner.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{partner.note}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 mt-4">Shop partner products <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
