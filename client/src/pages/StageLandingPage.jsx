import { ArrowRight, Blocks, Compass, Factory, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/common/PageMeta'

const content = {
  start: { eyebrow: 'Start', title: 'Turn your idea into an operating business.', copy: 'Define what you are building, create a business blueprint and move through the essentials at your pace.', action: 'Create a business blueprint', to: '/business/start', Icon: Compass },
  build: { eyebrow: 'Build', title: 'Launch your business online.', copy: 'Plan a website, store or web application that connects to the rest of your business.', action: 'Start a build project', to: '/build/start', Icon: Blocks },
  source: { eyebrow: 'Source', title: 'Find what your business needs.', copy: 'Source products, suppliers and professional help through the right Earnova workflow.', action: 'Create a sourcing request', to: '/source/request', Icon: Factory },
  operate: { eyebrow: 'Operate', title: 'Run your business from one place.', copy: 'Keep your roadmap, operations and next actions connected in a dedicated workspace.', action: 'Open workspace', to: '/operate', Icon: Layers3 },
  activity: { eyebrow: 'Activity', title: 'Your activity will appear here.', copy: 'Orders, projects, service updates and business progress will be brought together in a future phase.', action: 'Go to account', to: '/account', Icon: Layers3 },
}

export default function StageLandingPage({ stage }) {
  const item = content[stage]
  const Icon = item.Icon
  return <main className="phase-page"><PageMeta title={item.title} path={`/${stage}`} /><section className="page-container py-16 sm:py-24"><div className="max-w-2xl"><span className="stage-mark"><Icon className="h-4 w-4" />{item.eyebrow}</span><h1 className="phase-title mt-6">{item.title}</h1><p className="phase-copy mt-5">{item.copy}</p><Link to={item.to} className="btn-primary mt-8">{item.action}<ArrowRight className="h-4 w-4" /></Link></div></section></main>
}
