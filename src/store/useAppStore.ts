import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property } from '../data/properties'

export type User = {
  name: string
  email: string
  phone?: string
  memberSince: string
}

export type Filters = {
  minPrice: number
  maxPrice: number
  minAcres: number
  maxAcres: number
  types: string[]
  counties: string[]
  cities: string[]
  features: string[]
}

export type AppNotification = {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  propertyId?: string
}

const initialNotifications: AppNotification[] = [
  {
    id: 'benson-new-listing',
    title: 'New land in Benson',
    message: '19.93 acres with commercial potential, now listed for $120,000.',
    date: 'Today',
    read: false,
    propertyId: 'benson-19',
  },
  {
    id: 'dragoon-land',
    title: 'A little more room to roam',
    message: 'Explore 36.82 acres near the Coronado National Forest.',
    date: 'Yesterday',
    read: false,
    propertyId: 'dragoon-36',
  },
  {
    id: 'welcome',
    title: 'Welcome to Arizona Life',
    message: 'Save a place you love and we’ll keep it close at hand.',
    date: 'This week',
    read: true,
  },
]

type AppState = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  savedIds: string[]
  filters: Filters
  recentSearches: string[]
  notifications: AppNotification[]
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (enabled: boolean) => void
  toggleSaved: (id: string) => void
  removeSaved: (id: string) => void
  setFilters: (filters: Filters) => void
  addRecentSearch: (search: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

export const initialFilters: Filters = {
  minPrice: 0,
  maxPrice: 500000,
  minAcres: 0,
  maxAcres: 500,
  types: [],
  counties: [],
  cities: [],
  features: [],
}

export const useAppStore = create<AppState>()(persist((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  savedIds: [],
  filters: initialFilters,
  recentSearches: [],
  notifications: initialNotifications,
  darkMode: typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (darkMode) => set({ darkMode }),
  toggleSaved: (id) => set((state) => ({
    savedIds: state.savedIds.includes(id) ? state.savedIds.filter((saved) => saved !== id) : [...state.savedIds, id],
  })),
  removeSaved: (id) => set((state) => ({ savedIds: state.savedIds.filter((saved) => saved !== id) })),
  setFilters: (filters) => set({ filters }),
  addRecentSearch: (search) => set((state) => ({
    recentSearches: [search, ...state.recentSearches.filter((recent) => recent !== search)].slice(0, 5),
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
  })),
}), { name: 'arizona-life-app' }))

export function getFilteredProperties(listings: Property[], filters: Filters) {
  return listings.filter((property) =>
    property.price >= filters.minPrice &&
    property.price <= filters.maxPrice &&
    property.acres >= filters.minAcres &&
    property.acres <= filters.maxAcres &&
    (!filters.types.length || filters.types.includes(property.type) || filters.types.includes('Land') && property.type === 'Desert') &&
    (!filters.counties.length || filters.counties.includes(property.county)) &&
    (!filters.cities.length || filters.cities.includes(property.city)) &&
    filters.features.every((feature) => property.features.some((item) => item.toLowerCase().includes(feature.toLowerCase())))
  )
}
