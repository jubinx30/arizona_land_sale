import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Heart, ImageOff, MapPin, Share2, Trees } from 'lucide-react'
import type { Property } from '../data/properties'
import { useAppStore } from '../store/useAppStore'

type Props = { property: Property; compact?: boolean }

export default function PropertyCard({ property, compact = false }: Props) {
  const navigate = useNavigate()
  const saved = useAppStore((state) => state.savedIds.includes(property.id))
  const toggleSaved = useAppStore((state) => state.toggleSaved)
  const [shared, setShared] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  async function share(event: React.MouseEvent) {
    event.stopPropagation()
    try {
      if (navigator.share) await navigator.share({ title: property.title, text: `${formatPrice(property.price)} · ${property.title}` })
      else if (navigator.clipboard) await navigator.clipboard.writeText(`${property.title} — ${formatPrice(property.price)}`)
      setShared(true)
      window.setTimeout(() => setShared(false), 1800)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') setShared(true)
    }
  }

  return (
    <article className={`property-card ${compact ? 'property-card--compact' : ''}`} onClick={() => navigate(`/property/${property.id}`)}>
      <div className={`property-image ${imageFailed ? 'property-image--fallback' : ''}`}>
        {!imageFailed ? <img className="property-photo" src={property.images[0]} alt="" draggable={false} onError={() => setImageFailed(true)} /> : <div className="image-fallback-copy"><ImageOff size={21} /><span>Image unavailable</span></div>}
        <div className="image-shade" />
        <span className="sale-ribbon">FOR SALE</span>
        <span className="image-category">{property.type === 'Land' ? 'Land for Sale' : `${property.type} Property`}</span>
        <div className="price-pill">{formatPrice(property.price)}</div>
        <div className="card-actions">
          <button className={`icon-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved' : 'Save property'} onClick={(event) => { event.stopPropagation(); toggleSaved(property.id) }}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
          <button className="icon-button" aria-label="Share property" onClick={share}><Share2 size={16} /></button>
        </div>
        {shared && <span className="share-feedback">Link ready to share</span>}
      </div>
      <div className="property-content">
        <div className="property-kicker"><Trees size={15} /> {property.acres.toLocaleString()} acres <span>·</span> MLS #{property.mls}</div>
        <h3>{property.title}</h3>
        {!compact && <ul className="property-features">{property.features.slice(0, 3).map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>}
        <div className="property-location"><MapPin size={15} /> <span>{property.address}</span></div>
      </div>
    </article>
  )
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}
