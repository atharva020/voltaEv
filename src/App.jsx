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
import ModelVariants from './components/ModelVariants'
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
  const [bodyColor, setBodyColor] = useState('#FFFFFF')
  const [navVisible, setNavVisible] = useState(false)
  const [displayAngle, setDisplayAngle] = useState(0) // for the RotationIndicator UI

  // ── Shared mutable ref for 60fps car animation (read by useFrame in CarScene) ──
  const carData = useRef({
    rotationY: Math.PI * 0.5,  // start at side profile (90°)
    positionX: 0,
    positionZ: 0,
    wheelRot: 0,
  })

  const autoRotRef = useRef(null)

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
      let angle = Math.PI * 0.5
      autoRotRef.current = setInterval(() => {
        angle += 0.005
        carData.current.rotationY = angle
        setDisplayAngle(angle)
      }, 16)
    }
    return () => clearInterval(autoRotRef.current)
  }, [loaded])

  // ── Master GSAP ScrollTrigger Timeline ──
  function initAnimations() {
    if (isMobile()) return

    // ────────────────────────────────────────────────────────────────
    // MASTER CAR TIMELINE — one continuous scrubbed timeline
    // This drives carData.current which is read by useFrame at 60fps
    // ────────────────────────────────────────────────────────────────

    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#page-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,  // smooth scrub
        onUpdate: (self) => {
          // Update the rotation indicator UI reactively
          setDisplayAngle(carData.current.rotationY)
        }
      }
    })

    // ── HERO → DESIGN (0% → 20% of scroll) ──
    // Car starts at side profile (π/2 = 90°), rotates to 3/4 front (π/4 = 45°)
    masterTL.to(carData.current, {
      rotationY: Math.PI * 0.25,  // 3/4 front angle
      positionX: -0.5,            // drift slightly left to make room for callouts
      duration: 20,               // relative duration within timeline
      ease: 'power1.inOut',
    })

    // ── DESIGN → STATS (20% → 40%) ──
    // Car rotates to rear 3/4 angle (π * 1.25 = 225°) with slight scale-up feel via position
    .to(carData.current, {
      rotationY: Math.PI * 1.25,  // rear 3/4 angle
      positionX: 0,               // re-center
      duration: 20,
      ease: 'power1.inOut',
    })

    // ── STATS → TECHNOLOGY (40% → 55%) ──
    // Continue rotation, show another angle
    .to(carData.current, {
      rotationY: Math.PI * 1.75,  // approaching front again
      duration: 15,
      ease: 'power1.inOut',
    })

    // ── TECHNOLOGY → CONFIG (55% → 70%) ──
    // Rotate back to clean 3/4 front for color configurator
    .to(carData.current, {
      rotationY: Math.PI * 2.25,  // clean 3/4 front (equivalent to 45° + full revolution)
      positionX: 0,
      duration: 15,
      ease: 'power1.inOut',
    })

    // ── CONFIG → DRIVE-OFF (70% → 95%) ──
    // Car turns to face driving direction, then drives out of viewport
    .to(carData.current, {
      rotationY: Math.PI * 2.5,   // turn to face right edge
      positionX: 0,               // hold position while turning
      duration: 5,
      ease: 'power1.in',
    })
    .to(carData.current, {
      positionX: 15,              // drive off screen to the right
      positionZ: -3,              // slight depth for perspective
      wheelRot: Math.PI * 30,     // massive wheel spin! (~15 revs)
      duration: 20,
      ease: 'power2.in',
    })

    // ── FOOTER (95% → 100%) ──
    // Car is fully gone, nothing to animate

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

    // ── DESIGN SECTION: callouts fade in staggered ──
    const callouts = ['#callout-headlights', '#callout-body', '#callout-wheels']
    callouts.forEach((id, i) => {
      gsap.fromTo(id,
        { opacity: 0, x: -30 },
        {
          scrollTrigger: {
            trigger: '#section-design',
            start: `${i * 12}% center`,
            end: `${i * 12 + 20}% center`,
            scrub: 1,
          },
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'sine.out',
        }
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

    gsap.from('#config-right', {
      scrollTrigger: {
        trigger: '#section-config',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.8,
      },
      opacity: 0,
      x: 40,
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

      {/* Fixed UI overlays */}
      {loaded && (
        <>
          <Navbar visible={navVisible} />
          <ModelVariants activeIndex={1} />
          <RotationIndicator angle={displayAngle} />
        </>
      )}

      {/* Scrollable HTML page content */}
      <div className="page-content" id="page-content">
        <HeroSection />
        <DesignSection />
        <StatsSection />
        <TechnologySection />
        <ConfigSection onColorChange={setBodyColor} />

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
