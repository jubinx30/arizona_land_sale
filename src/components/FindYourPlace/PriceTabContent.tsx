import React from 'react'
import { DollarSign } from 'lucide-react'
import type { PriceRangeItem } from './useCategoryCounts'

type PriceTabContentProps = {
  priceRanges: PriceRangeItem[]
  isLoading?: boolean
  isError?: boolean
  onSelectPrice: (minPrice: number, maxPrice: number) => void
}

export const PriceTabContent: React.FC<PriceTabContentProps> = ({
  priceRanges,
  isLoading = false,
  isError = false,
  onSelectPrice,
}) => {
  if (isLoading) {
    return (
      <div className="fyp-price-grid" aria-label="Loading price ranges">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="fyp-price-card fyp-skeleton-tile" />
        ))}
      </div>
    )
  }

  const visibleRanges = priceRanges.filter((r) => isError || r.count > 0)

  return (
    <div
      className="fyp-price-grid"
      role="region"
      aria-label="Browse properties by price range"
    >
      {visibleRanges.map((range) => (
        <button
          key={range.id}
          type="button"
          className="fyp-price-card"
          onClick={() => onSelectPrice(range.minPrice, range.maxPrice)}
          aria-label={`${range.label}, ${range.count} listings`}
        >
          <div className="fyp-price-icon-wrap" aria-hidden="true">
            <DollarSign size={16} />
          </div>
          <div className="fyp-price-info">
            <span className="fyp-price-label">{range.label}</span>
            {!isError && (
              <span className="fyp-price-count">
                {range.count} {range.count === 1 ? 'place' : 'places'}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

export default PriceTabContent

