import '../styles/DesignSection.css'

// imageSide = which side the IMAGE sits on; the text goes opposite.
// Drop your images at these paths (public/) later — a labelled placeholder
// shows until the file exists.
const FEATURES = [
  {
    id: 'feat-headlights',
    img: '/design/headlights.jpg',
    imageSide: 'left',
    objectPosition: '18% center',
    index: '01',
    label: 'Adaptive Matrix LED',
    title: 'Headlights that read the road',
    text: 'Each headlight packs 84 individually addressable LEDs. The system scans road geometry 200 meters ahead and reshapes the beam in real time.',
  },
  {
    id: 'feat-body',
    img: '/design/body.jpg',
    imageSide: 'right',
    objectPosition: '22% center',
    index: '02',
    label: 'Cold-Pressed Steel',
    title: 'One piece. Zero gaps.',
    text: 'Single-piece stamped door skins erase panel seams. Flush handles deploy in 0.3 seconds as you approach.',
  },
  {
    id: 'feat-wheels',
    img: '/design/wheels.jpg',
    imageSide: 'left',
    objectPosition: '15% center',
    index: '03',
    label: '22" Aero-Turbine',
    title: 'Wheels that cut the air',
    text: 'Forged aluminum with active aerodynamic channels trim drag by 12% at highway speed.',
  },
]

export default function DesignSection() {
  return (
    <section className="design-section" id="section-design">
      <div className="design-section__label">
        <span className="label">02 — Exterior Design</span>
      </div>

      <div className="design-features">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            id={f.id}
            className={`feature-row feature-row--img-${f.imageSide}`}
          >
            <div className="feature-row__media">
              <img
                src={f.img}
                alt={f.title}
                className="feature-row__img"
                style={{ objectPosition: f.objectPosition }}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.opacity = 0 }}
              />
              <span className="feature-row__placeholder">{f.label}</span>
            </div>

            <div className="feature-row__info">
              <span className="feature-row__index">{f.index}</span>
              <p className="feature-row__label label">{f.label}</p>
              <h3 className="feature-row__title">{f.title}</h3>
              <p className="feature-row__text">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
