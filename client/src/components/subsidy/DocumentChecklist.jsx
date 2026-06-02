import { useState } from 'react'
import { FileCheck, Copy, CheckCircle2 } from 'lucide-react'

const BASE_DOCS = [
  { id: 1, doc: 'Aadhaar card (self-attested photocopy of all applicants)' },
  { id: 2, doc: 'Recent electricity bill (last 3 months) — must show consumer number' },
  { id: 3, doc: 'Property document (sale deed / property tax receipt / possession letter)' },
  { id: 4, doc: 'Cancelled cheque or bank passbook (for subsidy bank transfer)' },
  { id: 5, doc: 'Passport-size photographs (2 copies)' },
  { id: 6, doc: 'Online application confirmation from pmsuryaghar.gov.in' },
]

const STATE_DOCS = {
  'Andhra Pradesh':   ['APSPDCL / APCPDCL net-metering application form (from discom website)', 'Survey number or Patta for the property'],
  'Gujarat':          ['Net-metering application from your DISCOM (GETCO / DGVCL / PGVCL / UGVCL)', 'NOC from Society/Association for apartment residents', 'GEDA registration proof of installer'],
  'Karnataka':        ['Net-metering application from BESCOM / HESCOM / GESCOM / MESCOM', 'KREDL empanelment certificate of the installer'],
  'Kerala':           ['KSEB Ltd. net-metering application form (Form NM-1)', 'Possession certificate for tenants of government quarters'],
  'Maharashtra':      ['MSEDCL online net-metering application (submit via MSEDCL portal before installation)', 'Technical scheme / Single Line Diagram (SLD) from installer', 'Structural stability certificate for the roof (apartments)'],
  'Rajasthan':        ['Application from AVVNL / JVVNL / JDVVNL as applicable', 'Patta / Khatoni (land ownership proof)', 'RRECL empanelment certificate of installer'],
  'Tamil Nadu':       ['TANGEDCO net-metering application form (Form NM)', 'TEDA empanelment proof of installer', 'Structural drawings from licensed engineer (for systems above 5 kW)'],
  'Telangana':        ['TSSPDCL / TSNPDCL net-metering application', 'Survey number from revenue records (Pahani)'],
  'Uttar Pradesh':    ['UPPCL application form for net-metering', 'Patta / Khatoni (land ownership document)', 'Society / Gram Sabha NOC if required', 'Ration card or voter ID as additional address proof'],
  'Delhi':            ['BSES Rajdhani / BSES Yamuna / TPDDL application as applicable', 'Society NOC for apartments', 'Sanctioned load certificate from discom'],
  'Madhya Pradesh':   ['MPPMCL / MPMKVVCL application form', 'Land record (Khasra/Khatauni)'],
  'Haryana':          ['DHBVN / UHBVN net-metering application', 'Jamabandi (property ownership document)'],
  'Punjab':           ['PSPCL application form for net-metering', 'Land ownership records (Fard)'],
  'Himachal Pradesh': ['HPSEBL net-metering application', 'Ownership certificate from local revenue authority'],
  'Uttarakhand':      ['UPCL net-metering application form', 'Khasra / Khatauni records'],
}

const STATES_WITH_DOCS = Object.keys(STATE_DOCS).sort()

export default function DocumentChecklist() {
  const [selectedState, setSelectedState] = useState('')
  const [copied,        setCopied]        = useState(false)
  const [checked,       setChecked]       = useState({})

  const stateDocs = STATE_DOCS[selectedState] || []
  const allDocs   = [...BASE_DOCS.map(d => d.doc), ...stateDocs]

  const copyList = async () => {
    const text = ['DOCUMENTS REQUIRED FOR PM SURYA GHAR SUBSIDY',
      selectedState ? `(${selectedState} specific)` : '',
      '',
      'Base documents (all states):',
      ...BASE_DOCS.map((d, i) => `${i+1}. ${d.doc}`),
      ...(stateDocs.length ? ['', `${selectedState}-specific documents:`, ...stateDocs.map((d, i) => `${i+1}. ${d}`)] : []),
      '',
      'Source: earnova.in/subsidy | PM Surya Ghar Yojana',
    ].filter(l => l !== undefined).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback */ }
  }

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }))

  const doneCount = Object.values(checked).filter(Boolean).length
  const totalDocs = BASE_DOCS.length + stateDocs.length

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary-50 border-b border-primary-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-bold text-primary-900">Document Checklist</h3>
          </div>
          <button onClick={copyList}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-600
                             hover:text-primary-800 bg-white border border-primary-200 px-3 py-1.5 rounded-lg">
            {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-eco-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy List</>}
          </button>
        </div>
        {doneCount > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-primary-600 mb-1">
              <span>Progress</span><span>{doneCount} / {totalDocs} documents</span>
            </div>
            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <div className="h-full bg-eco-500 rounded-full transition-all duration-300"
                   style={{ width: `${(doneCount / totalDocs) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* State selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Select your state for state-specific documents
          </label>
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="input-base">
            <option value="">All States (common documents only)</option>
            {STATES_WITH_DOCS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Base documents */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Required in All States
          </p>
          <ul className="space-y-2">
            {BASE_DOCS.map((item) => (
              <li key={item.id}>
                <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-2.5 transition-colors ${
                  checked[`base-${item.id}`] ? 'bg-eco-50' : 'hover:bg-gray-50'
                }`}>
                  <input type="checkbox" checked={!!checked[`base-${item.id}`]}
                         onChange={() => toggle(`base-${item.id}`)}
                         className="w-4 h-4 accent-eco-600 mt-0.5 shrink-0" />
                  <span className={`text-sm ${checked[`base-${item.id}`] ? 'text-eco-700 line-through' : 'text-gray-700'}`}>
                    {item.doc}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* State-specific documents */}
        {stateDocs.length > 0 && (
          <div>
            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
              {selectedState}-Specific Documents
            </p>
            <ul className="space-y-2">
              {stateDocs.map((doc, i) => (
                <li key={i}>
                  <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-2.5 transition-colors ${
                    checked[`state-${i}`] ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}>
                    <input type="checkbox" checked={!!checked[`state-${i}`]}
                           onChange={() => toggle(`state-${i}`)}
                           className="w-4 h-4 accent-primary-700 mt-0.5 shrink-0" />
                    <span className={`text-sm ${checked[`state-${i}`] ? 'text-primary-600 line-through' : 'text-gray-700'}`}>
                      {doc}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!stateDocs.length && (
          <div className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
            ℹ️ Select your state above to see state-specific documents required by your DISCOM.
          </div>
        )}
      </div>
    </div>
  )
}
