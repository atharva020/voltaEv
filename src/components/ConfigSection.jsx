import { useState } from 'react'
import '../styles/ConfigSection.css'

const COLORS = [
  { id: 'color-midnight',   label: 'Midnight Black',   hex: '#1A1A1A',   material: '#1A1A1A' },
  { id: 'color-stealth',    label: 'Stealth Grey',     hex: '#4A4A52',   material: '#5A5A62' },
  { id: 'color-arctic',     label: 'Arctic White',     hex: '#F0EDE8',   material: '#F2F0EC' },
  { id: 'color-deep-sea',   label: 'Deep Sea Blue',    hex: '#1B3A5C',   material: '#1F4266' },
  { id: 'color-terra',      label: 'Terra Bronze',     hex: '#7A4E2D',   material: '#8A5832' },
]

export default function ConfigSection({ onColorChange }) {
  const [activeColor, setActiveColor] = useState('color-midnight')

  const handleColorSelect = (c) => {
    setActiveColor(c.id)
    onColorChange(c.material)
  }

  return (
    <section className="config-section" id="section-config">
      <div className="config-section__label">
        <span className="label">04 — Configure</span>
      </div>

      <div className="config-section__content">
        <div className="config-section__left" id="config-left">
          <h2 className="display-lg" id="config-h2">
            Make it<br />Yours.
          </h2>
          <p id="config-subtext">
            Every VOLTA S is built to specification. Choose your exterior, trim, and delivery window.
            No dealer markups. Direct to your door.
          </p>
          <div className="config-section__color-block">
            <p className="label" style={{ marginBottom: '16px' }}>Exterior Finish</p>
            <div className="config-section__swatches" id="color-swatches">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  id={c.id}
                  className={`swatch ${activeColor === c.id ? 'swatch--active' : ''}`}
                  style={{ '--swatch-color': c.hex }}
                  onClick={() => handleColorSelect(c)}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
            </div>
            <p className="config-section__color-name label" id="config-color-name">
              {COLORS.find(c => c.id === activeColor)?.label}
            </p>
          </div>

          <button className="config-section__build-btn" id="config-build-btn">
            Reserve — Production Q3 2026
          </button>
        </div>

        <div className="config-section__right" id="config-right">
          <div className="config-section__pricing">
            <div className="config-pricing-item">
              <span className="label">Base</span>
              <span className="config-pricing-item__val">$78,900</span>
            </div>
            <div className="config-pricing-item">
              <span className="label">Full Self-Drive</span>
              <span className="config-pricing-item__val">+$8,000</span>
            </div>
            <div className="config-pricing-item">
              <span className="label">22" Turbine Wheels</span>
              <span className="config-pricing-item__val">+$4,500</span>
            </div>
            <div className="config-pricing-divider"></div>
            <div className="config-pricing-item config-pricing-item--total">
              <span className="label">Est. Total</span>
              <span className="config-pricing-item__val">$91,400</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
