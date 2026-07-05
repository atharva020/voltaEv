import '../styles/StatsSection.css'

const STATS = [
  { id: 'stat-sprint', label: '0–100 km/h', value: '2.1', unit: 'sec', desc: 'Tri-motor torque vectoring' },
  { id: 'stat-range',  label: 'Range',       value: '643', unit: 'km',  desc: 'EPA combined estimate' },
  { id: 'stat-power',  label: 'Peak Power',  value: '760', unit: 'kW',  desc: '1,020 hp continuous output' },
  { id: 'stat-speed',  label: 'Top Speed',   value: '322', unit: 'km/h', desc: 'Software-limited' },
]

export default function StatsSection() {
  return (
    <section className="stats-section" id="section-stats">
      <div className="stats-section__label">
        <span className="label">03 — Performance</span>
      </div>

      <div className="stats-section__headline" id="stats-headline">
        <h2 className="display-lg" id="stats-h2">Built Without<br />Compromise.</h2>
      </div>

      <div className="stats-section__grid">
        {STATS.map((s) => (
          <div key={s.id} className="stat-item" id={s.id}>
            <div className="stat-item__value">
              <span className="stat-item__num" data-target={s.value}>0</span>
              <span className="stat-item__unit">{s.unit}</span>
            </div>
            <div className="stat-item__label label">{s.label}</div>
            <div className="stat-item__desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Fine rule */}
      <div className="stats-section__rule" id="stats-rule"></div>
    </section>
  )
}
