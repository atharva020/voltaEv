import { useEffect, useRef } from 'react'
import '../styles/Preloader.css'

export default function Preloader({ progress, done }) {
  const barRef = useRef(null)

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`
    }
  }, [progress])

  return (
    <div className={`preloader ${done ? 'preloader--done' : ''}`} id="preloader">
      <div className="preloader__inner">
        <div className="preloader__wordmark">VOLTA</div>
        <div className="preloader__sub label">Electric Vehicle Co.</div>
        <div className="preloader__bar-track">
          <div className="preloader__bar" ref={barRef}></div>
        </div>
        <div className="preloader__count label">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
