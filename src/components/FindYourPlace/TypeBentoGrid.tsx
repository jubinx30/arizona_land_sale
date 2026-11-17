import React, { useState } from 'react'
import { Mountain, Sun, Trees } from 'lucide-react'
import { formatCompactPrice } from './useCategoryCounts'

export type BentoTileData = {
  name: string
  category: string
  count: number
  minPrice: number | null
  image?: string
}

type TypeBentoGridProps = {
  landData: BentoTileData
  desertData: BentoTileData
  mountainData: BentoTileData
  isLoading?: boolean
  isError?: boolean
  onSelect: (category: string) => void
}

export const TypeBentoGrid: React.FC<TypeBentoGridProps> = ({
  landData,
  desertData,
  mountainData,
  isLoading = false,
  isError = false,
  onSelect,
}) => {
  const [landImgFailed, setLandImgFailed] = useState(false)
  const [desertImgFailed, setDesertImgFailed] = useState(false)
  const [mountainImgFailed, setMountainImgFailed] = useState(false)

  if (isLoading) {
    return (
      <div className="fyp-bento-grid" aria-label="Loading property types">
        <div className="fyp-bento-tile fyp-bento-land fyp-skeleton-tile" />
        <div className="fyp-bento-tile fyp-bento-desert fyp-skeleton-tile" />
        <div className="fyp-bento-tile fyp-bento-mountain fyp-skeleton-tile" />
      </div>
    )
  }

  const renderSubtitle = (data: BentoTileData) => {
    if (isError) return null
    if (data.count === 0) return null
    const countLabel = `${data.count} ${data.count === 1 ? 'parcel' : 'parcels'}`
    if (data.minPrice !== null && data.minPrice > 0) {
      return `${countLabel} · from ${formatCompactPrice(data.minPrice)}`
    }
    return countLabel
  }

  const hasLand = isError || landData.count > 0
  const hasDesert = isError || desertData.count > 0
  const hasMountain = isError || mountainData.count > 0

  const useLandPhoto = !landImgFailed && Boolean(landData.image)
  const useDesertPhoto = !desertImgFailed && Boolean(desertData.image)
  const useMountainPhoto = !mountainImgFailed && Boolean(mountainData.image)

  return (
    <div className="fyp-bento-grid" role="region" aria-label="Featured property types">
      {hasLand && (
        <button
          type="button"
          className={`fyp-bento-tile fyp-bento-land ${useLandPhoto ? 'has-bg-img' : 'flat-fill'}`}
          onClick={() => onSelect(landData.category)}
          aria-label={`${landData.name}, ${landData.count || ''} listings${
            landData.minPrice ? `, from ${formatCompactPrice(landData.minPrice)}` : ''
          }`}
          style={
            useLandPhoto
              ? { backgroundImage: `url(${landData.image})` }
              : undefined
          }
        >
          {useLandPhoto && (
            <img
              src={landData.image}
              alt=""
              className="fyp-hidden-preloader"
              onError={() => setLandImgFailed(true)}
            />
          )}
          <div className="fyp-bento-overlay" />
          <div className="fyp-bento-content">
            <div className="fyp-bento-icon-badge" aria-hidden="true">
              <Trees size={20} />
            </div>
            <div className="fyp-bento-text-group">
              <span className="fyp-bento-title">{landData.name}</span>
              {renderSubtitle(landData) && (
                <span className="fyp-bento-subtitle">{renderSubtitle(landData)}</span>
              )}
            </div>
          </div>
        </button>
      )}

      {hasDesert && (
        <button
          type="button"
          className={`fyp-bento-tile fyp-bento-desert ${useDesertPhoto ? 'has-bg-img' : 'flat-fill'}`}
          onClick={() => onSelect(desertData.category)}
          aria-label={`${desertData.name}, ${desertData.count || ''} listings${
            desertData.minPrice ? `, from ${formatCompactPrice(desertData.minPrice)}` : ''
          }`}
          style={
            useDesertPhoto
              ? { backgroundImage: `url(${desertData.image})` }
              : undefined
          }
        >
          {useDesertPhoto && (
            <img
              src={desertData.image}
              alt=""
              className="fyp-hidden-preloader"
              onError={() => setDesertImgFailed(true)}
            />
          )}
          <div className="fyp-bento-overlay" />
          <div className="fyp-bento-content">
            <div className="fyp-bento-icon-badge" aria-hidden="true">
              <Sun size={18} />
            </div>
            <div className="fyp-bento-text-group">
              <span className="fyp-bento-title">{desertData.name}</span>
              {renderSubtitle(desertData) && (
                <span className="fyp-bento-subtitle">{renderSubtitle(desertData)}</span>
              )}
            </div>
          </div>
        </button>
      )}

      {hasMountain && (
        <button
          type="button"
          className={`fyp-bento-tile fyp-bento-mountain ${useMountainPhoto ? 'has-bg-img' : 'flat-fill'}`}
          onClick={() => onSelect(mountainData.category)}
          aria-label={`${mountainData.name}, ${mountainData.count || ''} listings${
            mountainData.minPrice ? `, from ${formatCompactPrice(mountainData.minPrice)}` : ''
          }`}
          style={
            useMountainPhoto
              ? { backgroundImage: `url(${mountainData.image})` }
              : undefined
          }
        >
          {useMountainPhoto && (
            <img
              src={mountainData.image}
              alt=""
              className="fyp-hidden-preloader"
              onError={() => setMountainImgFailed(true)}
            />
          )}
          <div className="fyp-bento-overlay" />
          <div className="fyp-bento-content">
            <div className="fyp-bento-icon-badge" aria-hidden="true">
              <Mountain size={18} />
            </div>
            <div className="fyp-bento-text-group">
              <span className="fyp-bento-title">{mountainData.name}</span>
              {renderSubtitle(mountainData) && (
                <span className="fyp-bento-subtitle">{renderSubtitle(mountainData)}</span>
              )}
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

export default TypeBentoGrid

