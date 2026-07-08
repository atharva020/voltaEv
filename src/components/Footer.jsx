import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top">
        <span className="footer__brand">VOLTA</span>
        <nav className="footer__nav" aria-label="Footer navigation">
          <a href="#section-hero">Model S</a>
          <a href="#section-stats">Performance</a>
          <a href="#section-config">Configure</a>
          <a href="#">Charging</a>
          <a href="#">Press</a>
        </nav>
      </div>
      <div className="footer__bottom">
        <p className="label">© 2026 Volta Electric Vehicle Co. All rights reserved.</p>
        <p className="label">0 to 100 in 2.1 seconds. 643 km. Zero regrets.</p>
      </div>
      <p className="footer__credit label">
        Built by{' '}
        <a href="https://atharvachirde.com" target="_blank" rel="noopener noreferrer">
          Atharva Chirde
        </a>
      </p>
    </footer>
  )
}
