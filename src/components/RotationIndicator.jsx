import { useEffect, useRef } from 'react'
import '../styles/RotationIndicator.css'

export default function RotationIndicator({ angleRef }) {
  const dotRef = useRef(null)
  const degRef = useRef(null)

  useEffect(() => {
    let frameId
    const update = () => {
      const angle = angleRef?.current?.rotationY ?? 0
      const deg = Math.round(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360 + 360) % 360
      const pct = deg / 360

      if (dotRef.current) dotRef.current.style.top = `${pct * 100}%`
      if (degRef.current) degRef.current.textContent = `${deg}°`

      frameId = requestAnimationFrame(update)
    }

    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [angleRef])

  return (
    <div className="rotation-indicator" id="rotation-indicator">
      <span className="rotation-indicator__label label">0°</span>
      <div className="rotation-indicator__track" id="rot-track">
        <div
          className="rotation-indicator__dot"
          id="rot-dot"
          ref={dotRef}
        />
      </div>
      <span className="rotation-indicator__label label">360°</span>
      <div className="rotation-indicator__deg label" id="rot-deg" ref={degRef}>0°</div>
    </div>
  )
}
