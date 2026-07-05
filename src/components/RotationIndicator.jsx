import '../styles/RotationIndicator.css'

export default function RotationIndicator({ angle }) {
  // angle in radians, convert to 0-360 degrees
  const deg = Math.round(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360 + 360) % 360
  // Dot position along the line: 0deg = top, 360deg = bottom
  const pct = deg / 360 // 0 to 1

  return (
    <div className="rotation-indicator" id="rotation-indicator">
      <span className="rotation-indicator__label label">0°</span>
      <div className="rotation-indicator__track" id="rot-track">
        <div
          className="rotation-indicator__dot"
          id="rot-dot"
          style={{ top: `${pct * 100}%` }}
        />
      </div>
      <span className="rotation-indicator__label label">360°</span>
      <div className="rotation-indicator__deg label" id="rot-deg">{deg}°</div>
    </div>
  )
}
