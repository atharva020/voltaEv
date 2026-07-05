import '../styles/TechnologySection.css'

export default function TechnologySection() {
  return (
    <section className="technology-section section-pad" id="section-technology">
      <div className="technology-section__bg-text">AUTOPILOT</div>
      <div className="technology-section__content">
        <h2 className="display-lg">THE FUTURE OF DRIVING.</h2>
        <p className="body-text">
          Advanced sensory hardware and neural net processing provide 360 degrees of visibility and up to 250 meters of range. Hardware 4.0 processes vision data at an unprecedented scale, allowing the machine to understand the world better than humanly possible.
        </p>
        <ul className="tech-features">
          <li>
            <strong>360°</strong>
            <span>Vision Cameras</span>
          </li>
          <li>
            <strong>250m</strong>
            <span>Processing Range</span>
          </li>
          <li>
            <strong>HW4</strong>
            <span>Neural Net Chip</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
