import '../styles/Navbar.css'

export default function Navbar({ visible }) {
  return (
    <nav className={`navbar ${visible ? 'navbar--visible' : 'navbar--hidden'}`} id="navbar">
      {/* Left: hamburger icon */}
      <button className="navbar__menu" aria-label="Menu" id="nav-menu-btn">
        <span></span>
        <span></span>
      </button>

      {/* Center: wordmark */}
      <div className="navbar__brand" id="nav-brand">
        <span className="navbar__logo">VOLTA</span>
      </div>

      {/* Right: search + grid */}
      <div className="navbar__actions" id="nav-actions">
        <button aria-label="Search" id="nav-search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7.5"/>
            <line x1="20" y1="20" x2="15.5" y2="15.5"/>
          </svg>
        </button>
        <button aria-label="Grid" id="nav-grid-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}
