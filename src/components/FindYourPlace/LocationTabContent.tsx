import React from 'react'
import { MapPin } from 'lucide-react'
import type { LocationItem } from './useCategoryCounts'

type LocationTabContentProps = {
  locations: LocationItem[]
  isLoading?: boolean
  isError?: boolean
  onSelectLocation: (kind: 'county' | 'city', value: string) => void
}

export const LocationTabContent: React.FC<LocationTabContentProps> = ({
  locations,
  isLoading = false,
  isError = false,
  onSelectLocation,
}) => {
  if (isLoading) {
    return (
      <div className="fyp-location-grid" aria-label="Loading locations">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="fyp-location-card fyp-skeleton-tile" />
        ))}
      </div>
    )
  }

  const visibleLocations = locations.filter((loc) => isError || loc.count > 0)

  return (
    <div
      className="fyp-location-grid"
      role="region"
      aria-label="Browse properties by location"
    >
      {visibleLocations.map((loc) => (
        <button
          key={loc.id}
          type="button"
          className="fyp-location-card"
          onClick={() => onSelectLocation(loc.kind, loc.value)}
          aria-label={`${loc.name}, ${loc.count} listings`}
        >
          <div className="fyp-location-icon-wrap" aria-hidden="true">
            <MapPin size={17} />
          </div>
          <div className="fyp-location-info">
            <span className="fyp-location-name">{loc.name}</span>
            {!isError && (
              <span className="fyp-location-count">
                {loc.count} {loc.count === 1 ? 'place' : 'places'}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

export default LocationTabContent

