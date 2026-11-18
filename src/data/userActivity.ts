// TODO: Replace with live backend user activity & tour schedule API
// Mock data module providing live user activity stats and hero slide configurations.

export interface HeroSlideData {
  id: string
  propertyId?: string
  slideType: 'featured' | 'price-drop' | 'open-house' | 'brand'
  badgeText: string
  title: string
  meta: string
  price?: number
  originalPrice?: number
  priceDropText?: string
  tourSchedule?: string
  image: string
  ctaText: string
  ctaLink: string
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'hero-featured',
    propertyId: 'dragoon-36',
    slideType: 'featured',
    badgeText: 'FOR SALE',
    title: '36+ Acres on Dragoon Mountain Ranch',
    meta: '36.82 acres · Saint David, AZ',
    price: 147000,
    image: 'https://images.unsplash.com/photo-1602138759009-ca3386c95619?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'View listing',
    ctaLink: '/property/dragoon-36',
  },
  {
    id: 'hero-price-drop',
    propertyId: 'willcox-29',
    slideType: 'price-drop',
    badgeText: 'PRICE DROP',
    title: '29+ Acres of Willcox Open Range',
    meta: '29.6 acres · Willcox, AZ',
    price: 99500,
    originalPrice: 115000,
    priceDropText: 'Save $15.5k',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'View listing',
    ctaLink: '/property/willcox-29',
  },
  {
    id: 'hero-open-house',
    propertyId: 'pearce-homestead',
    slideType: 'open-house',
    badgeText: 'OPEN HOUSE',
    title: 'Desert Homestead with Views',
    meta: '20.1 acres · Pearce, AZ',
    price: 95000,
    tourSchedule: 'Sat, Nov 22 · 10am',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    ctaText: 'View listing',
    ctaLink: '/property/pearce-homestead',
  },
  {
    id: 'hero-brand',
    slideType: 'brand',
    badgeText: 'ARIZONA LIFE',
    title: 'Find your Arizona moment.',
    meta: 'Room to roam. Space to grow.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=90',
    ctaText: 'Explore all',
    ctaLink: '/search',
  },
]

export interface PersonalStats {
  priceDropCount: number
  upcomingToursCount: number
  toursLabel: string
}

// Mock personal activity counts (saved count is dynamically derived from useAppStore)
export const MOCK_PERSONAL_STATS: PersonalStats = {
  priceDropCount: 2,
  upcomingToursCount: 1,
  toursLabel: '1 tour tomorrow',
}

// Key for persisting last viewed listing in localStorage
export const LAST_VIEWED_STORAGE_KEY = 'az-last-viewed-listing-id'
export const DEFAULT_LAST_VIEWED_ID = 'dragoon-36'

