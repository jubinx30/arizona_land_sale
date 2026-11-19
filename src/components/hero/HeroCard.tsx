import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Calendar, Heart, Share2, TrendingDown } from 'lucide-react'
import type { HeroSlideData } from '../../data/userActivity'
import { useAppStore } from '../../store/useAppStore'
import GlassPanel from './GlassPanel'
import StoryProgressBar from './StoryProgressBar'

interface HeroCardProps {
  slide: HeroSlideData
  isActive: boolean
  isNeighbor: boolean
  slideIndex: number
  totalSlides: number
  storyProgress: number
  onNavigate: (path: string) => void
}

function formatPrice(num?: number) {
  if (!num) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

export default function HeroCard({
  slide,
  isActive,
  isNeighbor,
  slideIndex,
  totalSlides,
  storyProgress,
  onNavigate,
}: HeroCardProps) {
  const propertyId = slide.propertyId
  const isSaved = useAppStore((state) => (propertyId ? state.savedIds.includes(propertyId) : false))
  const toggleSaved = useAppStore((state) => state.toggleSaved)

  const [shared, setShared] = useState(false)

  const handleCardClick = () => {
    onNavigate(slide.ctaLink)
  }

  const handleHeartClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (!propertyId) return

    // Light haptic feedback if platform supports it
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10)
      } catch (_) {}
    }

    toggleSaved(propertyId)
  }

  const handleShareClick = async (e: MouseEvent) => {
    e.stopPropagation()
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: slide.title,
          text: `${slide.price ? formatPrice(slide.price) + ' · ' : ''}${slide.title}`,
          url: window.location.origin + slide.ctaLink,
        })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${slide.title} — ${slide.price ? formatPrice(slide.price) : ''}`)
      }
      setShared(true)
      window.setTimeout(() => setShared(false), 2000)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setShared(true)
        window.setTimeout(() => setShared(false), 2000)
      }
    }
  }

  return (
    <article
      className={`hero-card-item ${isActive ? 'is-active' : ''} ${isNeighbor ? 'is-neighbor' : ''}`}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() } }}
      aria-label={`${slide.title}. ${slide.meta}. Press Enter to view listing.`}
      role="group"
      tabIndex={isActive ? 0 : -1}
    >
      {/* Background Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="hero-card-photo"
        loading={slideIndex === 0 ? 'eager' : 'lazy'}
        draggable={false}
      />

      {/* Bottom-up Dark Gradient Scrim */}
      <div className="hero-card-scrim" />

      {/* Instagram Story Progress Indicator */}
      <StoryProgressBar
        total={totalSlides}
        activeIndex={slideIndex}
        progress={isActive ? storyProgress : slideIndex < totalSlides ? 1 : 0}
      />

      {/* Top Left Ribbon Badge */}
      <span
        className={`hero-badge-ribbon ${
          slide.slideType === 'price-drop'
            ? 'hero-badge-ribbon--drop'
            : slide.slideType === 'open-house'
            ? 'hero-badge-ribbon--open'
            : slide.slideType === 'brand'
            ? 'hero-badge-ribbon--brand'
            : ''
        }`}
      >
        {slide.badgeText}
      </span>

      {/* Top Right Save & Share Frosted Icon Chips */}
      <div className="hero-top-actions">
        {propertyId && (
          <button
            type="button"
            className={`hero-frosted-chip-btn ${isSaved ? 'is-saved' : ''}`}
            onClick={handleHeartClick}
            aria-label={isSaved ? `Remove ${slide.title} from saved` : `Save ${slide.title}`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 2} />
          </button>
        )}
        <button
          type="button"
          className="hero-frosted-chip-btn"
          onClick={handleShareClick}
          aria-label={`Share ${slide.title}`}
        >
          <Share2 size={17} strokeWidth={2} />
        </button>
      </div>

      {shared && <div className="hero-share-toast" role="status" aria-live="polite">Link copied!</div>}

      {/* Bottom Frosted Glass Overlay Panel (Change 3) */}
      <GlassPanel>
        {slide.slideType === 'brand' ? (
          <div className="hero-panel-info">
            <h2 className="hero-brand-headline">
              Find your <em>Arizona</em> moment.
            </h2>
            <div className="hero-panel-meta">{slide.meta}</div>
          </div>
        ) : (
          <div className="hero-panel-info">
            <h3 className="hero-panel-title">{slide.title}</h3>
            <span className="hero-panel-meta">{slide.meta}</span>

            <div className="hero-panel-price-row">
              {slide.slideType === 'price-drop' && slide.originalPrice && (
                <>
                  <span className="hero-panel-price-old">{formatPrice(slide.originalPrice)}</span>
                  <span className="hero-panel-price">{formatPrice(slide.price)}</span>
                  <span className="hero-chip-tag" aria-label="Price drop">
                    <TrendingDown size={11} strokeWidth={2.5} />
                    {slide.priceDropText || 'Price drop'}
                  </span>
                </>
              )}

              {slide.slideType === 'open-house' && (
                <>
                  <span className="hero-panel-price">{formatPrice(slide.price)}</span>
                  <span className="hero-chip-tag hero-chip-tag--tour" aria-label="Open house">
                    <Calendar size={11} strokeWidth={2.5} />
                    {slide.tourSchedule ? 'Sat 10am–2pm' : 'Open house'}
                  </span>
                </>
              )}

              {slide.slideType === 'featured' && (
                <span className="hero-panel-price">{formatPrice(slide.price)}</span>
              )}
            </div>
          </div>
        )}

        {/* Primary Pill Button (Change 2) */}
        <button
          type="button"
          className="hero-pill-cta"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(slide.ctaLink)
          }}
          aria-label={`${slide.ctaText} for ${slide.title}`}
        >
          {slide.ctaText}
        </button>
      </GlassPanel>
    </article>
  )
}
