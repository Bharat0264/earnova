const STATS = [
  { value: '15,000+', label: 'Products Sold',          sub: 'Across India' },
  { value: '₹8 Cr+',  label: 'Total Savings Generated', sub: 'For our customers' },
  { value: '5,200+',  label: 'Active Referrers',         sub: 'Earning every day' },
  { value: '28 States', label: 'Pan India Reach',        sub: '& growing' },
]

export default function StatsStrip() {
  return (
    <section className="py-12 lg:py-14 bg-primary-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute left-1/4 top-0 w-80 h-full bg-primary-700/20 blur-3xl pointer-events-none" />

      <div className="relative section-wrapper">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <div className="font-display font-extrabold text-3xl lg:text-4xl text-white mb-1">
                {value}
              </div>
              <div className="text-primary-200 text-sm font-medium">{label}</div>
              <div className="text-primary-500 text-xs mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
