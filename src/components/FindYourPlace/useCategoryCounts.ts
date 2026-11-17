import { useMemo, useState } from 'react'
import { properties as defaultProperties, type Property } from '../../data/properties'
import { propertyMatchesType } from '../../store/useAppStore'

export type TypeItem = {
  id: string
  name: string
  category: string
  count: number
  minPrice: number | null
  image?: string
}

export type LocationItem = {
  id: string
  name: string
  kind: 'county' | 'city'
  value: string
  count: number
}

export type PriceRangeItem = {
  id: string
  label: string
  minPrice: number
  maxPrice: number
  count: number
}

export function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    const formatted = (price / 1_000_000).toFixed(1).replace(/\.0$/, '')
    return `$${formatted}M`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function useCategoryCounts(customListings?: Property[]) {
  const [isLoading, setIsLoading] = useState(false)

  // Listen for custom listing data or use default listings
  const listings = useMemo(() => customListings ?? defaultProperties, [customListings])
  const isError = useMemo(() => !listings || !Array.isArray(listings), [listings])

  const countsByType = useMemo(() => {
    if (isError || !listings) return {}
    const map: Record<string, { count: number; minPrice: number | null; image?: string }> = {}

    const typeCategories = [
      'Land',
      'Desert',
      'Mountain',
      'Equine',
      'Country Homes',
      'Owner Financing',
      'Investment',
      'Commercial',
      'Recreational',
    ]

    for (const cat of typeCategories) {
      const matches = listings.filter((p) => propertyMatchesType(p, cat))
      const count = matches.length
      let minPrice: number | null = null
      let image: string | undefined

      if (count > 0) {
        minPrice = Math.min(...matches.map((p) => p.price))
        const withImage = matches.find((p) => p.images && p.images.length > 0)
        if (withImage) {
          image = withImage.images[0]
        }
      }

      map[cat.toLowerCase()] = { count, minPrice, image }
    }

    return map
  }, [listings, isError])

  const locationItems = useMemo<LocationItem[]>(() => {
    if (isError || !listings) return []

    const candidates: Array<{ name: string; kind: 'county' | 'city'; value: string }> = [
      { name: 'Cochise County', kind: 'county', value: 'Cochise' },
      { name: 'Willcox', kind: 'city', value: 'Willcox' },
      { name: 'Pearce', kind: 'city', value: 'Pearce' },
      { name: 'Elfrida', kind: 'city', value: 'Elfrida' },
      { name: 'Benson', kind: 'city', value: 'Benson' },
      { name: 'Saint David', kind: 'city', value: 'Saint David' },
    ]

    return candidates.map((item) => {
      let count = 0
      if (item.kind === 'county') {
        count = listings.filter((p) => p.county.toLowerCase() === item.value.toLowerCase()).length
      } else {
        count = listings.filter((p) => p.city.toLowerCase() === item.value.toLowerCase()).length
      }
      return {
        id: item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        kind: item.kind,
        value: item.value,
        count,
      }
    })
  }, [listings, isError])

  const priceRangeItems = useMemo<PriceRangeItem[]>(() => {
    if (isError || !listings) return []

    const ranges: Array<{ id: string; label: string; min: number; max: number }> = [
      { id: 'under-20k', label: 'Under $20K', min: 0, max: 20000 },
      { id: '20k-50k', label: '$20K–$50K', min: 20000, max: 50000 },
      { id: '50k-100k', label: '$50K–$100K', min: 50000, max: 100000 },
      { id: '100k-plus', label: '$100K+', min: 100000, max: 10000000 },
    ]

    return ranges.map((r) => {
      const count = listings.filter((p) => {
        if (r.id === 'under-20k') return p.price < 20000
        if (r.id === '20k-50k') return p.price >= 20000 && p.price <= 50000
        if (r.id === '50k-100k') return p.price > 50000 && p.price <= 100000
        return p.price > 100000
      }).length

      return {
        id: r.id,
        label: r.label,
        minPrice: r.min,
        maxPrice: r.max,
        count,
      }
    })
  }, [listings, isError])

  return {
    isLoading,
    isError,
    setIsLoading,
    countsByType,
    locationItems,
    priceRangeItems,
  }
}
