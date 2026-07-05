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
import ConfigSection from './components/ConfigSection'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

const isMobile = () => window.innerWidth < 768

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [rotationY, setRotationY] = useState(0)
  const [bodyColor, setBodyColor] = useState('#1A1A1A')
  const [navVisible, setNavVisible] = useState(false)

  const rotRef = useRef({ val: 0 })
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
      autoRotRef.current = setInterval(() => {
        setRotationY(prev => prev + 0.005)
      }, 16)
    }
    return () => clearInterval(autoRotRef.current)
  }, [loaded])

  // ── GSAP ScrollTrigger animations (reference pattern) ──
  function initAnimations() {
    if (isMobile()) return  // skip scroll-jacking on mobile

    // ── Pin the canvas-backed hero for scroll-driven rotation ──
    // Following the reference pattern: pin the container, scroll drives state
    // Using raw scroll position to drive rotation — same as reference .gsap scrollTrigger scrub approach
    
    const totalScroll = document.body.scrollHeight - window.innerHeight

    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        // Full Y rotation (0 → 2π) over the first 40% of page scroll
        const rotationProgress = Math.min(self.progress / 0.4, 1)
        const newRot = rotationProgress * Math.PI * 2
        rotRef.current.val = newRot
        setRotationY(newRot)
      }
    })

    // ── HERO: subtle text reveal ──
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

    // ── Scroll cue fades out early ──
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

    // ── Navbar fades out while deep in hero, returns elsewhere ──
    // (navbar stays visible - just opacity managed)

    // ── DESIGN SECTION: callouts fade in staggered ──
    const callouts = ['#callout-headlights', '#callout-body', '#callout-wheels']
    callouts.forEach((id, i) => {
      gsap.fromTo(id,
        { opacity: 0, x: id.includes('right') ? 30 : -30 },
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

    // ── CONFIG SECTION: content slides in from sides ──
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
      <CarScene rotationY={rotationY} bodyColor={bodyColor} />

      {/* Fixed UI overlays */}
      {loaded && (
        <>
          <Navbar visible={navVisible} />
          <ModelVariants activeIndex={1} />
          <RotationIndicator angle={rotationY} />
        </>
      )}

      {/* Scrollable HTML page content */}
      <div className="page-content" id="page-content">
        <HeroSection />
        <DesignSection />
        <StatsSection />
        <ConfigSection onColorChange={setBodyColor} />
        <Footer />
      </div>
    </>
  )
}
