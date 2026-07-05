import '../styles/HeroSection.css'

export default function HeroSection() {
  return (
    <section className="hero-section" id="section-hero">
      {/* Giant background headline - sits BEHIND the 3D model (z-index below canvas) */}
      <div className="hero-section__bg-headline" id="hero-bg-headline">
        <span id="hero-model-name">VOLTA S</span>
      </div>

      {/* Foreground content - bottom portion */}
      <div className="hero-section__bottom" id="hero-bottom">
        <div className="hero-section__descriptor">
          <p className="label">Season 2026 · Long Range AWD</p>
          <h1 id="hero-h1">THE MACHINE<br />REMEMBERS<br />NOTHING.</h1>
        </div>
        <div className="hero-section__cta">
          <button className="hero-section__order-btn" id="hero-order-btn">Configure Yours</button>
          <p className="hero-section__stat">
            <span>643</span> km range — one charge
          </p>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-section__scroll-cue" id="scroll-cue">
        <div className="hero-section__scroll-line"></div>
        <span className="label">Scroll</span>
      </div>
    </section>
  )
}
