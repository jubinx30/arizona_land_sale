import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_SLIDES } from '../../data/userActivity'
import HeroCard from './HeroCard'
import './hero.css'

interface HeroCarouselProps {
  onNotify?: (message: string) => void
}

const AUTO_ADVANCE_MS = 5000

export default function HeroCarousel({ onNotify: _onNotify }: HeroCarouselProps) {
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftStartRef = useRef(0)
  const hasDraggedRef = useRef(false)
  const lastTimeRef = useRef<number>(Date.now())

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Parallax on scroll from .screen-main container
  useEffect(() => {
    if (prefersReducedMotion) return
    const scrollContainer = containerRef.current?.closest('.screen-main') || window

    const handleScroll = () => {
      const top = 'scrollTop' in scrollContainer ? scrollContainer.scrollTop : window.scrollY
      setScrollY(top)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [prefersReducedMotion])

  // Scroll to a specific card index
  const scrollToIndex = useCallback((targetIndex: number, smooth = true) => {
    const track = trackRef.current
    if (!track) return

    const total = HERO_SLIDES.length
    const boundedIndex = Math.max(0, Math.min(total - 1, targetIndex))
    const firstCard = track.children[0] as HTMLElement | undefined
    if (!firstCard) return

    const cardWidth = firstCard.offsetWidth
    const gap = 12
    const targetLeft = boundedIndex * (cardWidth + gap)

    track.scrollTo({
      left: targetLeft,
      behavior: smooth ? 'smooth' : 'auto',
    })
    setActiveIndex(boundedIndex)
    setProgress(0)
  }, [])

  // Auto-advance timer (5 seconds), paused during interaction or reduced-motion
  useEffect(() => {
    if (prefersReducedMotion || isInteracting) return

    lastTimeRef.current = Date.now()
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 50 / AUTO_ADVANCE_MS
        if (next >= 1) {
          const nextIndex = (activeIndex + 1) % HERO_SLIDES.length
          scrollToIndex(nextIndex, true)
          return 0
        }
        return next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [activeIndex, isInteracting, prefersReducedMotion, scrollToIndex])

  // Update activeIndex based on track scroll position
  const handleTrackScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const firstCard = track.children[0] as HTMLElement | undefined
    if (!firstCard) return

    const cardWidth = firstCard.offsetWidth
    const gap = 12
    const currentScroll = track.scrollLeft
    const computedIndex = Math.round(currentScroll / (cardWidth + gap))
    const total = HERO_SLIDES.length
    const clampedIndex = Math.max(0, Math.min(total - 1, computedIndex))

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex)
      setProgress(0)
    }
  }, [activeIndex])

  // Desktop Pointer Drag handlers (supports mouse drag paging in desktop phone mockup)
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    setIsInteracting(true)
    isDownRef.current = true
    startXRef.current = e.clientX
    scrollLeftStartRef.current = trackRef.current?.scrollLeft || 0
    hasDraggedRef.current = false
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current || !trackRef.current) return
    const diff = e.clientX - startXRef.current
    if (Math.abs(diff) > 6) {
      hasDraggedRef.current = true
      trackRef.current.scrollLeft = scrollLeftStartRef.current - diff
    }
  }

  const handlePointerUp = () => {
    if (!isDownRef.current) return
    isDownRef.current = false
    setIsInteracting(false)

    if (hasDraggedRef.current && trackRef.current) {
      const firstCard = trackRef.current.children[0] as HTMLElement | undefined
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth
        const gap = 12
        const currentScroll = trackRef.current.scrollLeft
        const targetIndex = Math.round(currentScroll / (cardWidth + gap))
        scrollToIndex(targetIndex, true)
      }
    }
  }

  // Parallax transform styles (transforms only, 60fps)
  const parallaxTranslateY = prefersReducedMotion ? 0 : Math.min(90, scrollY * 0.45)
  const parallaxScale = prefersReducedMotion ? 1 : Math.max(0.96, 1 - (scrollY / 1200) * 0.08)
  const parallaxOpacity = prefersReducedMotion ? 1 : Math.max(0.72, 1 - (scrollY / 600) * 0.28)

  return (
    <section
      ref={containerRef}
      className="hero-carousel-container"
      aria-label="Featured Properties & Highlights Carousel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => {
        setIsInteracting(false)
        isDownRef.current = false
      }}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
    >
      <div
        className="hero-carousel-parallax-layer"
        style={{
          transform: `translate3d(0, ${parallaxTranslateY}px, 0) scale(${parallaxScale})`,
          opacity: parallaxOpacity,
        }}
      >
        <div
          ref={trackRef}
          className="hero-track"
          onScroll={handleTrackScroll}
          role="region"
          aria-live="polite"
        >
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === activeIndex
            const isNeighbor = Math.abs(index - activeIndex) === 1

            return (
              <HeroCard
                key={slide.id}
                slide={slide}
                isActive={isActive}
                isNeighbor={isNeighbor}
                slideIndex={index}
                totalSlides={HERO_SLIDES.length}
                storyProgress={progress}
                onNavigate={(path) => {
                  if (!hasDraggedRef.current) {
                    navigate(path)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
