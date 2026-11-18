import { Calendar, Heart, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MOCK_PERSONAL_STATS } from '../../data/userActivity'
import { useAppStore } from '../../store/useAppStore'

interface StatStripProps {
  onNotify?: (message: string) => void
}

/**
 * Live personal stat strip located at the top of the ContentSheet.
 * Displays Saved count (live from useAppStore), Price Drops count, and Upcoming Tours.
 * Each segment is tappable with accessible labels and minimum 44px touch height.
 */
export default function StatStrip({ onNotify }: StatStripProps) {
  const navigate = useNavigate()
  const savedCount = useAppStore((state) => state.savedIds.length)
  const scheduledTours = useAppStore((state) => state.scheduledTours || [])

  const toursCount = scheduledTours.length

  const handleSavedClick = () => {
    navigate('/saved')
  }

  const handlePriceDropsClick = () => {
    navigate('/search')
    if (onNotify) {
      onNotify('Showing recent price drops')
    }
  }

  const handleToursClick = () => {
    navigate('/contact')
  }

  const tourAriaLabel =
    toursCount === 1
      ? '1 tour scheduled. Tap to review tour schedule.'
      : `${toursCount} tours scheduled. Tap to review tour schedule.`

  return (
    <div
      className="stat-strip-container"
      role="region"
      aria-label="Personal property activity overview"
    >
      {/* Segment 1: Saved Count */}
      <button
        type="button"
        className="stat-segment-btn"
        onClick={handleSavedClick}
        aria-label={`${savedCount} saved ${savedCount === 1 ? 'place' : 'places'}. Tap to view saved places.`}
      >
        <Heart size={15} className="stat-icon" fill={savedCount > 0 ? 'currentColor' : 'none'} />
        <span>
          <strong>{savedCount}</strong> saved
        </span>
      </button>

      {/* Segment 2: Price Drops */}
      <button
        type="button"
        className="stat-segment-btn"
        onClick={handlePriceDropsClick}
        aria-label={`${MOCK_PERSONAL_STATS.priceDropCount} price drops. Tap to browse price drops.`}
      >
        <TrendingDown size={15} className="stat-icon stat-icon--drop" strokeWidth={2.3} />
        <span>
          <strong>{MOCK_PERSONAL_STATS.priceDropCount}</strong> drops
        </span>
      </button>

      {/* Segment 3: Tours */}
      <button
        type="button"
        className="stat-segment-btn"
        onClick={handleToursClick}
        aria-label={tourAriaLabel}
      >
        <Calendar size={14} className="stat-icon stat-icon--tour" strokeWidth={2.2} />
        <span>
          <strong>{toursCount}</strong> {toursCount === 1 ? 'tour' : 'tours'}
        </span>
      </button>
    </div>
  )
}
