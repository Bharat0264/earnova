import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'

const STEPS = [
  {
    n: 1, title: 'Register on PM Surya Ghar Portal',
    time: '15 minutes',
    color: 'bg-yellow-500',
    content: (
      <>
        <p>Visit <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">pmsuryaghar.gov.in <ExternalLink className="w-3 h-3" /></a> and click <strong>"Apply for Rooftop Solar."</strong></p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• Register using your <strong>Aadhaar number</strong> and mobile OTP</li>
          <li>• Enter your <strong>electricity consumer account number</strong> (from your electricity bill)</li>
          <li>• Select your State and DISCOM (distribution company)</li>
          <li>• Note your <strong>Application Reference Number</strong> for future tracking</li>
        </ul>
        <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Keep your electricity bill handy — you'll need the consumer number and registered mobile.
        </div>
      </>
    ),
  },
  {
    n: 2, title: 'Submit Application & Select System',
    time: '30 minutes',
    color: 'bg-orange-500',
    content: (
      <>
        <p>After registration, complete the full application on the portal:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• Select your desired <strong>system capacity</strong> (1–10 kW)</li>
          <li>• Choose an <strong>empanelled vendor</strong> — Earnova is registered nationwide</li>
          <li>• Upload property proof and Aadhaar copy</li>
          <li>• Submit application and await DISCOM technical feasibility</li>
        </ul>
        <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-800">
          💡 <strong>Tip:</strong> Choosing an empanelled installer is mandatory. Earnova handles the application for you — use our Assistance Request below.
        </div>
      </>
    ),
  },
  {
    n: 3, title: 'Receive DISCOM Approval',
    time: '7–30 days',
    color: 'bg-blue-500',
    content: (
      <>
        <p>Your DISCOM (electricity company) will review your application and conduct a site visit:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• DISCOM surveys your rooftop for <strong>technical feasibility</strong></li>
          <li>• They assess load sanction and roof structural suitability</li>
          <li>• Approval includes recommended panel orientation and system specs</li>
          <li>• Check application status on the portal periodically</li>
        </ul>
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
          💡 <strong>Tip:</strong> Approval time varies by state — Gujarat and Rajasthan are typically faster (7–14 days); Maharashtra and UP can take 20–30 days.
        </div>
      </>
    ),
  },
  {
    n: 4, title: 'Install Solar System',
    time: '1–3 days',
    color: 'bg-eco-600',
    content: (
      <>
        <p>Once DISCOM approval is received, your empanelled installer (Earnova) will schedule the installation:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• Installation must match the <strong>DISCOM-approved specifications</strong></li>
          <li>• Only use <strong>BIS/MNRE certified panels</strong> (all Earnova products qualify)</li>
          <li>• Typical installation: 1–3 days depending on system size</li>
          <li>• Keep all <strong>invoices and installation records</strong> safely</li>
        </ul>
        <div className="mt-3 bg-eco-50 border border-eco-100 rounded-lg px-3 py-2 text-xs text-eco-800">
          💡 <strong>Tip:</strong> Take photos of the installation for your records — you'll need them when uploading the commissioning report.
        </div>
      </>
    ),
  },
  {
    n: 5, title: 'Net Meter Installation by DISCOM',
    time: '7–14 days after installation',
    color: 'bg-indigo-500',
    content: (
      <>
        <p>After installation, inform your DISCOM and request net meter installation:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• DISCOM replaces your regular meter with a <strong>bidirectional net meter</strong></li>
          <li>• This measures both electricity consumed from grid and exported to grid</li>
          <li>• Excess solar generation is credited to your account</li>
          <li>• Earnova's team coordinates the net-meter request for you</li>
        </ul>
        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-800">
          💡 <strong>Tip:</strong> Do not submit the completion certificate until the net meter is installed and functioning. This is a common mistake that delays subsidy.
        </div>
      </>
    ),
  },
  {
    n: 6, title: 'Submit Commissioning Certificate',
    time: '30 minutes',
    color: 'bg-purple-600',
    content: (
      <>
        <p>Log into the portal and submit the completion documents:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• Upload the <strong>commissioning certificate</strong> from your installer</li>
          <li>• Upload photos of the installed system and net meter</li>
          <li>• Enter your <strong>bank account details</strong> for subsidy transfer</li>
          <li>• Submit your DISCOM net-meter installation certificate</li>
        </ul>
        <div className="mt-3 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-xs text-purple-800">
          💡 <strong>Tip:</strong> Double-check bank account details before submitting. The subsidy is transferred directly — any error causes significant delays.
        </div>
      </>
    ),
  },
  {
    n: 7, title: 'Receive Central Subsidy',
    time: 'Within 30 days of Step 6',
    color: 'bg-eco-700',
    content: (
      <>
        <p>Once your completion report is approved, subsidy is transferred directly to your bank:</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>• <strong>Up to ₹30,000</strong> for 1 kW systems</li>
          <li>• <strong>Up to ₹60,000</strong> for 2 kW systems</li>
          <li>• <strong>Up to ₹78,000</strong> for 3 kW and above (maximum)</li>
          <li>• Track disbursement status on the national portal</li>
          <li>• Some states provide additional subsidies on top of central subsidy</li>
        </ul>
        <div className="mt-3 bg-eco-50 border border-eco-100 rounded-lg px-3 py-2 text-xs text-eco-800">
          🎉 <strong>Congratulations!</strong> Your rooftop solar is now generating clean energy and saving you money every day. Your system pays for itself in 4–6 years!
        </div>
      </>
    ),
  },
]

export default function SubsidySteps() {
  const [openStep, setOpenStep] = useState(1)

  return (
    <div className="space-y-3">
      {STEPS.map(({ n, title, time, color, content }) => (
        <div key={n}
             className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
               openStep === n ? 'border-primary-200 shadow-card' : 'border-gray-100'
             }`}>
          <button
            onClick={() => setOpenStep(openStep === n ? null : n)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
          >
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <span className="text-white font-display font-bold text-sm">{n}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${openStep === n ? 'text-primary-800' : 'text-gray-800'}`}>
                {title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">⏱ {time}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
              openStep === n ? 'rotate-180' : ''
            }`} />
          </button>

          {openStep === n && (
            <div className="px-5 pb-5 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-100">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
