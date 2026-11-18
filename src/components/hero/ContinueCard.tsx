import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { properties } from '../../data/properties'
import type { Property } from '../../data/properties'
import { DEFAULT_LAST_VIEWED_ID, LAST_VIEWED_STORAGE_KEY } from '../../data/userActivity'
import { formatPrice } from '../PropertyCard'

export default function ContinueCard() {
  const navigate = useNavigate()
  const [lastProperty, setLastProperty] = useState<Property | null>(null)

  useEffect(() => {
    try {
      const storedId = localStorage.getItem(LAST_VIEWED_STORAGE_KEY) || DEFAULT_LAST_VIEWED_ID
      const match = properties.find((p) => p.id === storedId)
      if (match) {
        setLastProperty(match)
      }
    } catch (_) {
      const match = properties.find((p) => p.id === DEFAULT_LAST_VIEWED_ID)
      if (match) setLastProperty(match)
    }
  }, [])

  if (!lastProperty) {
    return null
  }

  const handleClick = () => {
    navigate(`/property/${lastProperty.id}`)
  }

  return (
    <div
      className="continue-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Continue where you left off: ${lastProperty.title}, ${formatPrice(lastProperty.price)}`}
    >
      <div className="continue-thumb-wrap">
        <img
          src={lastProperty.images[0]}
          alt=""
          className="continue-thumb"
          loading="lazy"
        />
      </div>

      <div className="continue-info">
        <span className="continue-kicker">Continue where you left off</span>
        <h4 className="continue-title">{lastProperty.title}</h4>
        <span className="continue-meta">
          {formatPrice(lastProperty.price)} · {lastProperty.acres.toLocaleString()} acres · {lastProperty.city}
        </span>
      </div>

      <div className="continue-arrow" aria-hidden="true">
        <ChevronRight size={19} />
      </div>
    </div>
  )
}
