import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import './App.css'

// Components
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import CarScene from './components/CarScene'
import RotationIndicator from './components/RotationIndicator'
import HeroSection from './components/HeroSection'
import DesignSection from './components/DesignSection'
import StatsSection from './components/StatsSection'
import TechnologySection from './components/TechnologySection'
import ConfigSection from './components/ConfigSection'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

const isMobile = () => window.innerWidth < 768

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [bodyColor, setBodyColor] = useState('#1A1A1A')
  const [navVisible, setNavVisible] = useState(false)
  const [displayAngle, setDisplayAngle] = useState(0) // for the RotationIndicator UI

  // ── Shared mutable ref for 60fps car animation (read by useFrame in CarScene) ──
  const carData = useRef({
    rotationY: 0,  // straight-on front view (0 = grille toward camera)
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    scale: 1,
    wheelRot: 0,
  })

  const autoRotRef = useRef(null)
  const idleSpinRef = useRef(null)   // desktop idle rotation loop
  const scrolledRef = useRef(false)  // true once user starts scrolling

  // ── Simulate loading (actual model is loaded by R3F useGLTF) ──
  useEffect(() => {
    let prog = 0
    const interval = setInterval(() => {
      prog += Math.random() * 12 + 3
      if (prog >= 100) {
        prog = 100
        setLoadProgress(100)
        clearInterval(interval)
        setTimeout(() => {
          setLoaded(true)
          setNavVisible(true)
          initAnimations()
        }, 600)
      } else {
        setLoadProgress(prog)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // ── Mobile: auto-rotate ──
  useEffect(() => {
    if (!loaded) return
    if (isMobile()) {
      let angle = 0
      autoRotRef.current = setInterval(() => {
        angle += 0.005
        carData.current.rotationY = angle
        setDisplayAngle(angle)
      }, 16)
    }
    return () => clearInterval(autoRotRef.current)
  }, [loaded])

  // ── Desktop: idle spin at rest until the user scrolls ──
  useEffect(() => {
    if (!loaded || isMobile()) return
    let angle = 0
    idleSpinRef.current = setInterval(() => {
      if (scrolledRef.current) return   // stop feeding rotation once scrolling
      angle += 0.008
      carData.current.rotationY = angle
      setDisplayAngle(angle)
    }, 16)
    return () => clearInterval(idleSpinRef.current)
  }, [loaded])

  // ── Master GSAP ScrollTrigger Timeline ──
  function initAnimations() {
    if (isMobile()) return

    // ────────────────────────────────────────────────────────────────
    // MASTER CAR TIMELINE — one continuous scrubbed timeline
    // This drives carData.current which is read by useFrame at 60fps
    // ────────────────────────────────────────────────────────────────

    // Tunable constants ───────────────────────────────────────────
    const FRONT = 0            // straight-on front rotationY (0 = grille toward camera)
    const ZOOM_SCALE = 5.5     // modest zoom — enough to fill glass, NOT clip through model
    const ZOOM_Y = -3.2        // pull car DOWN so windshield fills screen center
    const ZOOM_Z = 1           // slight nudge toward camera
    const BLACK_HOLD = 200     // holds black through ALL 4 content sections
                               // (Design + Stats + Technology + Config)
    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#page-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,  // much tighter scrub (was 1.2) for faster response
        onUpdate: (self) => {
          // First scroll → stop idle spin and settle to the nearest front pose,
          // then the scrubbed zoom timeline carries on from there.
          if (!scrolledRef.current && self.progress > 0.0005) {
            scrolledRef.current = true
            clearInterval(idleSpinRef.current)
            const rot = carData.current.rotationY
            const nearestFront = Math.round(rot / (Math.PI * 2)) * (Math.PI * 2)
            gsap.to(carData.current, {
              rotationY: nearestFront,
              duration: 0.6,
              ease: 'power2.out',
              overwrite: 'auto', // only kill conflicting rotationY, NOT scale/pos
              onComplete: () => { carData.current.rotationY = FRONT },
            })
          }
          // Update the rotation indicator UI reactively
          setDisplayAngle(carData.current.rotationY)
        }
      }
    })

    // ── PHASE A · HERO → DESIGN — zoom into windshield, then go black ──
    // Car stays put and front-facing; scales up + descends so the dark glass
    // fills frame. Black overlay reaches full BEFORE zoom completes, so we
    // never visibly clip into the interior of the model.
    masterTL.to(carData.current, {
      scale: ZOOM_SCALE,
      positionY: ZOOM_Y,
      positionZ: ZOOM_Z,
      // rotationY intentionally omitted — the idle-spin handoff (below) settles
      // the car to FRONT on first scroll; scrub must not fight it here.
      duration: 12,
      ease: 'power2.in',
    })
    // Black fades in over the final stretch and locks solid ~2 units before
    // the zoom finishes → clean cut to black, model never penetrated on screen.
    .to('#black-overlay', {
      opacity: 1,
      duration: 5,
      ease: 'none',
    }, '-=7')

    // ── PHASE B · DESIGN → STATS → TECHNOLOGY → CONFIG — hold solid black ──
    // ALL content sections stay hidden. Car is fully behind the black screen.
    .to(carData.current, {
      scale: ZOOM_SCALE, // no-op hold to keep car offscreen behind the black
      duration: BLACK_HOLD,
    })

    // ── PHASE C · AFTER CONFIG / ENTERING FOOTER — reverse zoom-out ──
    // Exact mirror of Phase A: black fades, then car zooms OUT from full-screen
    // to normal hero size, exactly the reverse of the zoom-in at the top.
    .to('#black-overlay', {
      opacity: 0,
      duration: 6,
      ease: 'power1.in',
    })
    .to(carData.current, {
      scale: 1,
      positionY: 0,
      positionZ: 0,
      rotationY: FRONT,
      duration: 15,
      ease: 'power2.out',
    }, '-=3') // overlap with the black fade so it starts just before black fully clears

    // ── PHASE D · FOOTER — spin RIGHT & drive off screen ──
    .to(carData.current, {
      rotationY: FRONT + Math.PI * 0.5, // turn rightward
      duration: 6,
      ease: 'power1.inOut',
    })
    .to(carData.current, {
      positionX: 22,            // exit the frame to the RIGHT
      positionZ: -2,
      wheelRot: Math.PI * 30,   // roll the wheels as it drives away
      duration: 18,
      ease: 'power2.in',
    }, '-=2')

    // ────────────────────────────────────────────────────────────────
    // CONTENT ANIMATIONS — separate ScrollTriggers for DOM elements
    // These run independently from the car timeline
    // ────────────────────────────────────────────────────────────────

    // ── HERO: bg headline appear ──
    gsap.from('#hero-bg-headline', {
      scrollTrigger: {
        trigger: '#section-hero',
        start: 'top top',
        end: '+=100',
        scrub: 0.5,
      },
      scale: 0.94,
      opacity: 0,
      duration: 1,
    })

    // ── HERO: text reveal ──
    gsap.from('#hero-h1', {
      scrollTrigger: {
        trigger: '#section-hero',
        start: 'top top',
        end: '+=200',
        scrub: 0.8,
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'sine.out',
    })

    // ── Scroll cue fades out ──
    gsap.to('#scroll-cue', {
      scrollTrigger: {
        trigger: '#section-hero',
        start: '10% top',
        end: '30% top',
        scrub: 0.5,
      },
      opacity: 0,
      y: 10,
    })

    // ── DESIGN SECTION: feature rows slide in — image from its side, text opposite ──
    document.querySelectorAll('.feature-row').forEach((row) => {
      const media = row.querySelector('.feature-row__media')
      const info = row.querySelector('.feature-row__info')
      const imgFromLeft = row.classList.contains('feature-row--img-left')
      // Play once when the row actually reaches the viewport (not scrubbed from
      // far away) so nothing reveals before you scroll to that section.
      const st = {
        trigger: row,
        start: 'top 55%',
        toggleActions: 'play none none reverse',
      }
      // Image enters from the screen edge it lives on
      gsap.fromTo(media,
        { opacity: 0, x: imgFromLeft ? -160 : 160 },
        { scrollTrigger: st, opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
      )
      // Text enters from the opposite edge
      gsap.fromTo(info,
        { opacity: 0, x: imgFromLeft ? 160 : -160 },
        { scrollTrigger: st, opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
      )
    })

    // ── DESIGN: section label ──
    gsap.from('#section-design .design-section__label', {
      scrollTrigger: {
        trigger: '#section-design',
        start: 'top 80%',
        end: 'top 50%',
        scrub: 0.8,
      },
      opacity: 0,
      x: -20,
    })

    // ── STATS SECTION: stat items count up on entry ──
    document.querySelectorAll('.stat-item').forEach((el, i) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.5,
        },
        opacity: 1,
        y: 0,
        duration: 1,
        delay: i * 0.08,
        ease: 'sine.out',
      })

      // Number count-up
      const numEl = el.querySelector('.stat-item__num')
      if (!numEl) return
      const target = parseFloat(numEl.dataset.target)
      const isDecimal = target < 10

      ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              numEl.textContent = isDecimal
                ? this.targets()[0].val.toFixed(1)
                : Math.round(this.targets()[0].val)
            }
          })
        }
      })
    })

    // Stats rule expand
    gsap.to('#stats-rule', {
      scrollTrigger: {
        trigger: '#section-stats',
        start: 'bottom 80%',
        end: 'bottom 50%',
        scrub: 1,
      },
      scaleX: 1,
      duration: 1.2,
      ease: 'sine.out',
    })

    // Stats headline
    gsap.from('#stats-h2', {
      scrollTrigger: {
        trigger: '#section-stats',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.8,
      },
      opacity: 0,
      y: 40,
      ease: 'sine.out',
    })

    // ── TECHNOLOGY SECTION ──
    gsap.from('#section-technology .technology-section__content', {
      scrollTrigger: {
        trigger: '#section-technology',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.8,
      },
      opacity: 0,
      y: 50,
      ease: 'sine.out',
    })

    // ── CONFIG SECTION: content slides in ──
    gsap.from('#config-left', {
      scrollTrigger: {
        trigger: '#section-config',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.8,
      },
      opacity: 0,
      x: -40,
      ease: 'sine.out',
    })

    gsap.from('#config-preview', {
      scrollTrigger: {
        trigger: '#section-config',
        start: 'top 75%',
        end: 'top 35%',
        scrub: 0.8,
      },
      opacity: 0,
      scale: 0.96,
      ease: 'sine.out',
    })

    gsap.from('#config-right', {
      scrollTrigger: {
        trigger: '#section-config',
        start: 'top 70%',
        end: 'top 30%',
        scrub: 0.8,
      },
      opacity: 0,
      y: 24,
      ease: 'sine.out',
    })

    // ── DRIVE-OFF tagline ──
    gsap.fromTo('#driveoff-tagline',
      { opacity: 0, y: 20 },
      {
        scrollTrigger: {
          trigger: '#section-driveoff',
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.8,
        },
        opacity: 1,
        y: 0,
        ease: 'sine.out',
      }
    )
    gsap.to('#driveoff-tagline', {
      scrollTrigger: {
        trigger: '#section-driveoff',
        start: '40% top',
        end: '80% top',
        scrub: 0.5,
      },
      opacity: 0,
      y: -20,
    })

    // ── FOOTER: fade in ──
    gsap.from('#footer', {
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 90%',
        end: 'top 60%',
        scrub: 0.5,
      },
      opacity: 0,
      y: 20,
    })
  }

  return (
    <>
      <Preloader progress={loadProgress} done={loaded} />

      {/* Fixed 3D canvas — always behind HTML content */}
      <CarScene carData={carData} bodyColor={bodyColor} />

      {/* Black screen overlay for zoom transition */}
      <div 
        id="black-overlay" 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'var(--bg)', 
          opacity: 0, 
          zIndex: 1, 
          pointerEvents: 'none' 
        }} 
      />

      {/* Fixed UI overlays */}
      {loaded && (
        <>
          <Navbar visible={navVisible} />
          <RotationIndicator angle={displayAngle} />
        </>
      )}

      {/* Scrollable HTML page content */}
      <div className="page-content" id="page-content">
        <HeroSection />
        <DesignSection />
        <StatsSection />
        <TechnologySection />
        <ConfigSection bodyColor={bodyColor} onColorChange={setBodyColor} />

        {/* Drive-off transition section */}
        <section className="driveoff-section" id="section-driveoff">
          <h2 className="display-lg driveoff-tagline" id="driveoff-tagline">
            THE ROAD IS YOURS.
          </h2>
        </section>

        <Footer />
      </div>
    </>
  )
}
