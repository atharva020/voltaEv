import '../styles/DesignSection.css'

const CALLOUTS = [
  {
    id: 'callout-headlights',
    side: 'left',
    label: 'Adaptive Matrix LED',
    text: 'Each headlight contains 84 individually addressable LEDs. The system reads road geometry 200 meters ahead.',
    top: '28%',
  },
  {
    id: 'callout-wheels',
    side: 'right',
    label: '22" Aero-Turbine',
    text: 'Forged aluminum with active aerodynamic channels reduce drag by 12% at highway speeds.',
    top: '62%',
  },
  {
    id: 'callout-body',
    side: 'left',
    label: 'Cold-Pressed Steel',
    text: 'Single-piece stamped door skins eliminate panel gaps. Flush-mount handles deploy in 0.3 seconds.',
    top: '48%',
  },
]

export default function DesignSection() {
  return (
    <section className="design-section" id="section-design">
      <div className="design-section__label">
        <span className="label">02 — Exterior Design</span>
      </div>

      {/* Callout overlays */}
      {CALLOUTS.map((c) => (
        <div
          key={c.id}
          className={`callout callout--${c.side}`}
          id={c.id}
          style={{ top: c.top }}
        >
          <div className="callout__line"></div>
          <div className="callout__content">
            <p className="callout__label label">{c.label}</p>
            <p className="callout__text">{c.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
