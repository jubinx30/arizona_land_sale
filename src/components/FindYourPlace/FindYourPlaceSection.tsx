import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { categories as allCategories } from '../../data/properties'
import { initialFilters, useAppStore } from '../../store/useAppStore'
import SectionHeader from './SectionHeader'
import SegmentedControl, { type TabId } from './SegmentedControl'
import TypeBentoGrid, { type BentoTileData } from './TypeBentoGrid'
import ChipRow, { type ChipItem } from './ChipRow'
import LocationTabContent from './LocationTabContent'
import PriceTabContent from './PriceTabContent'
import { useCategoryCounts } from './useCategoryCounts'
import './FindYourPlace.css'

type FindYourPlaceSectionProps = {
  className?: string
  onNotify?: (message: string) => void
}

export const FindYourPlaceSection: React.FC<FindYourPlaceSectionProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('type')
  const { countsByType, locationItems, priceRangeItems, isLoading, isError } = useCategoryCounts()

  const handleSelectType = useCallback(
    (typeCategory: string) => {
      const filters = { ...initialFilters }
      // Match with known categories
      const matched =
        allCategories.find((cat) => cat.toLowerCase() === typeCategory.toLowerCase()) ||
        typeCategory
      filters.types = [matched]
      useAppStore.getState().setFilters(filters)
      navigate('/search')
    },
    [navigate]
  )

  const handleSelectLocation = useCallback(
    (kind: 'county' | 'city', value: string) => {
      const filters = { ...initialFilters }
      if (kind === 'county') {
        filters.counties = [value.replace(/ County$/i, '')]
      } else {
        filters.cities = [value]
      }
      useAppStore.getState().setFilters(filters)
      navigate('/search')
    },
    [navigate]
  )

  const handleSelectPrice = useCallback(
    (minPrice: number, maxPrice: number) => {
      const filters = { ...initialFilters }
      filters.minPrice = minPrice
      filters.maxPrice = maxPrice
      useAppStore.getState().setFilters(filters)
      navigate('/search')
    },
    [navigate]
  )

  const handleExploreAllTypes = useCallback(() => {
    navigate('/browse/type')
  }, [navigate])

  // Bento Tiles Data
  const landData: BentoTileData = useMemo(() => {
    const raw = countsByType['land'] || { count: 0, minPrice: null }
    return {
      name: 'Land',
      category: 'Land',
      count: raw.count,
      minPrice: raw.minPrice,
      image: raw.image,
    }
  }, [countsByType])

  const desertData: BentoTileData = useMemo(() => {
    const raw = countsByType['desert'] || { count: 0, minPrice: null }
    return {
      name: 'Desert',
      category: 'Desert',
      count: raw.count,
      minPrice: raw.minPrice,
      image: raw.image,
    }
  }, [countsByType])

  const mountainData: BentoTileData = useMemo(() => {
    const raw = countsByType['mountain'] || { count: 0, minPrice: null }
    return {
      name: 'Mountain',
      category: 'Mountain',
      count: raw.count,
      minPrice: raw.minPrice,
      image: raw.image,
    }
  }, [countsByType])

  // Pill Chips Data for remaining types
  const remainingChipItems: ChipItem[] = useMemo(() => {
    const chipDefinitions: Array<{ name: string; key: string; category: string }> = [
      { name: 'Equine', key: 'equine', category: 'Equine' },
      { name: 'Country homes', key: 'country homes', category: 'Country Homes' },
      { name: 'Owner financing', key: 'owner financing', category: 'Owner Financing' },
      { name: 'Investment', key: 'investment', category: 'Investment & Income' },
      { name: 'Commercial', key: 'commercial', category: 'Commercial' },
      { name: 'Recreational', key: 'recreational', category: 'Recreational' },
    ]

    return chipDefinitions.map((item) => {
      const raw = countsByType[item.key]
      return {
        name: item.name,
        category: item.category,
        count: raw ? raw.count : 0,
      }
    })
  }, [countsByType])

  return (
    <section
      className={`fyp-section ${className}`.trim()}
      aria-labelledby="fyp-section-heading"
    >
      <SectionHeader eyebrow="MAKE IT YOUR OWN" title="Find your kind of place" />

      <SegmentedControl activeTab={activeTab} onChange={setActiveTab} />

      <div className="fyp-tab-viewport">
        <AnimatePresence mode="wait">
          {activeTab === 'type' && (
            <motion.div
              key="tab-type"
              id="fyp-panel-type"
              role="tabpanel"
              aria-labelledby="fyp-tab-type"
              className="fyp-tab-pane"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <TypeBentoGrid
                landData={landData}
                desertData={desertData}
                mountainData={mountainData}
                isLoading={isLoading}
                isError={isError}
                onSelect={handleSelectType}
              />
              <ChipRow
                chips={remainingChipItems}
                isLoading={isLoading}
                isError={isError}
                onSelect={handleSelectType}
                onExploreAll={handleExploreAllTypes}
              />
            </motion.div>
          )}

          {activeTab === 'location' && (
            <motion.div
              key="tab-location"
              id="fyp-panel-location"
              role="tabpanel"
              aria-labelledby="fyp-tab-location"
              className="fyp-tab-pane"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <LocationTabContent
                locations={locationItems}
                isLoading={isLoading}
                isError={isError}
                onSelectLocation={handleSelectLocation}
              />
            </motion.div>
          )}

          {activeTab === 'price' && (
            <motion.div
              key="tab-price"
              id="fyp-panel-price"
              role="tabpanel"
              aria-labelledby="fyp-tab-price"
              className="fyp-tab-pane"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <PriceTabContent
                priceRanges={priceRangeItems}
                isLoading={isLoading}
                isError={isError}
                onSelectPrice={handleSelectPrice}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default FindYourPlaceSection

