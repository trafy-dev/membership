import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import bgVideo from '../assets/background.mp4'

const SCROLL_LERP = 0.08
const ROLE_WORDS = ['Equality', 'Justice', 'Unity', 'Progress']
const ROLE_INTERVAL_MS = 2200

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const [glow, setGlow] = useState(0)
  const [roleIndex, setRoleIndex] = useState(0)
  const targetGlow = useRef(0)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const onScroll = () => {
      const rect = hero.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const p = (vh - rect.top) / (vh + rect.height)
      targetGlow.current = Math.min(1, Math.max(0, p))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    let curGlow = 0
    const tick = () => {
      curGlow += (targetGlow.current - curGlow) * SCROLL_LERP
      setGlow(curGlow)
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLE_WORDS.length)
    }, ROLE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const overlayStyle = { opacity: 0.44 + glow * 0.18 }

  return (
    <section className="hero hero-sun" id="dmp-hero" ref={heroRef}>
      <video
        className="hero-video"
        src={bgVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-video-overlay" style={overlayStyle} />
      <div className="hero-vignette" />
      <div className="hero-grain" />
      <div className="hero-inner">
        <div className="eyebrow hero-eyebrow">Self-Respect &middot; Social Justice &middot; Student Power</div>
        <h1 className="hero-banner">
          <span className="hero-banner-row">திராவிட</span>
          <span className="hero-banner-row">மாணவர்</span>
          <span className="hero-banner-row">பேரவை</span>
        </h1>
        <p className="hero-role-line">
          A movement for{' '}
          <span className="hero-role-word" key={roleIndex}>
            {ROLE_WORDS[roleIndex]}
          </span>
          .
        </p>
        <p className="hero-tag">
          A student movement carrying forward the Dravidian ideal of equality, rationalism and dignity for every Tamil.
        </p>
        <div className="hero-cta-row">
          <Link to="/signup" className="btn-primary btn-sun">
            Join the Movement
          </Link>
          <a href="#thinkers" className="btn-sun-outline">
            Our Ideology
          </a>
        </div>
      </div>
      <div className="scroll-cue">
        <span>Scroll</span>
        <span className="scroll-line">
          <span className="scroll-line-dot" />
        </span>
      </div>
    </section>
  )
}
