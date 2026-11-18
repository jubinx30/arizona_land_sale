import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property } from '../data/properties'

export type UserPreferences = {
  buyerType?: string
  targetAcreage?: string
  budgetRange?: string
  preferredCounties?: string[]
  preferredTypes?: string[]
  mustHaves?: string[]
  notifications?: {
    priceDrops: boolean
    newListings: boolean
    tourReminders: boolean
    marketReports: boolean
  }
}

export type User = {
  name: string
  email: string
  phone?: string
  username?: string
  avatar?: string
  location?: string
  bio?: string
  buyerType?: string
  memberSince: string
  preferences?: UserPreferences
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

export type ListingReviewStatus = 'pending_review' | 'under_review' | 'approved' | 'rejected'

export type UserPropertyListing = {
  id: string
  title: string
  type: string
  price: number
  county: string
  city: string
  address: string
  acres: number
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  description: string
  features: string[]
  images: string[]
  status: ListingReviewStatus
  submittedAt: string
  reviewedAt?: string
  brokerNotes?: string
  assignedBroker: string
  sellerName: string
  sellerEmail: string
  sellerPhone: string
  ownershipConfirmed: boolean
  mlsNumber?: string
}

export type TeamApplication = {
  id: string
  fullName: string
  email: string
  phone: string
  roleInterest: 'salesperson' | 'associate_broker' | 'student' | 'new_to_real_estate' | 'referral_partner'
  licenseNumber?: string
  experienceYears: string
  targetTerritory: string
  specialties: string[]
  message: string
  resumeName?: string
  submittedAt: string
  status: 'submitted' | 'under_broker_review' | 'interview_scheduled'
  brokerFeedback?: string
}

export type MapLayer = 'street' | 'satellite'

export const defaultUserPropertyListings: UserPropertyListing[] = [
  {
    id: 'prop-sample-dragoon-1',
    title: '15.5-Acre High Desert Sanctuary & Mountain View Parcel',
    type: 'Land',
    price: 89500,
    county: 'Cochise',
    city: 'Saint David',
    address: '4220 S Apache Sunrise Trail, Saint David, AZ 85630',
    acres: 15.5,
    description: 'Breathtaking 360-degree mountain vistas facing the Dragoon Mountains. Excellent build site with electric transformer nearby and high-producing water aquifer. Perfect for horse ranch, homestead, or off-grid living.',
    features: ['Mountain views', 'Private well potential', 'Horses allowed', 'Electricity near lot', 'Survey completed', 'Owner financing'],
    images: [
      'https://images.unsplash.com/photo-1602138759009-ca3386c95619?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1705869340514-c3512ede4311?auto=format&fit=crop&w=1000&q=85',
    ],
    status: 'under_review',
    submittedAt: 'Today at 10:15 AM',
    assignedBroker: 'Rick Frank, Designated Broker',
    brokerNotes: 'Cochise County parcel #208-14-009 verified. Plat map and legal deed confirmed. Finalizing market valuation and listing package.',
    sellerName: 'Sarah Miller',
    sellerEmail: 'sarah.miller@example.com',
    sellerPhone: '(602) 555-0142',
    ownershipConfirmed: true,
    mlsNumber: 'AZ-02034-PENDING',
  },
]

export const defaultTeamApplications: TeamApplication[] = [
  {
    id: 'app-sample-1',
    fullName: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    phone: '(602) 555-0142',
    roleInterest: 'salesperson',
    licenseNumber: 'SA702914000',
    experienceYears: '3 years',
    targetTerritory: 'Cochise & Pima County',
    specialties: ['Land & Acreage', 'Country Homes', 'Equestrian Properties'],
    message: 'Passionate about Southern Arizona lifestyle, desert ecology, and helping buyers find rural land and homesteads. Looking to join Arizona Life Homes and Land under United Country branding.',
    submittedAt: 'Yesterday',
    status: 'under_broker_review',
    brokerFeedback: 'Application received. Phone interview scheduled with Rick Frank for Thursday at 2:00 PM.',
  },
]

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
  updateCurrentUser: (updates: Partial<User>) => void
  savedIds: string[]
  filters: Filters
  recentSearches: string[]
  notifications: AppNotification[]
  userPropertyListings: UserPropertyListing[]
  teamApplications: TeamApplication[]
  mapLayer: MapLayer
  setMapLayer: (mapLayer: MapLayer) => void
  toggleMapLayer: () => void
  showBoundaries: boolean
  setShowBoundaries: (show: boolean) => void
  toggleBoundaries: () => void
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (enabled: boolean) => void
  toggleSaved: (id: string) => void
  removeSaved: (id: string) => void
  setFilters: (filters: Filters) => void
  addRecentSearch: (search: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (notification: Omit<AppNotification, 'id'> & { id?: string }) => void
  addUserPropertyListing: (listing: UserPropertyListing) => void
  updateUserPropertyListingStatus: (id: string, status: ListingReviewStatus, brokerNotes?: string, mlsNumber?: string) => void
  deleteUserPropertyListing: (id: string) => void
  addTeamApplication: (app: TeamApplication) => void
  updateTeamApplicationStatus: (id: string, status: TeamApplication['status'], brokerFeedback?: string) => void
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
  updateCurrentUser: (updates) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    })),
  savedIds: [],
  filters: initialFilters,
  recentSearches: [],
  notifications: initialNotifications,
  userPropertyListings: defaultUserPropertyListings,
  teamApplications: defaultTeamApplications,
  mapLayer: 'street',
  setMapLayer: (mapLayer) => set({ mapLayer }),
  toggleMapLayer: () => set((state) => ({ mapLayer: state.mapLayer === 'satellite' ? 'street' : 'satellite' })),
  showBoundaries: true,
  setShowBoundaries: (showBoundaries) => set({ showBoundaries }),
  toggleBoundaries: () => set((state) => ({ showBoundaries: !state.showBoundaries })),
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
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: notification.title,
        message: notification.message,
        date: notification.date || 'Just now',
        read: false,
        propertyId: notification.propertyId,
      },
      ...state.notifications,
    ],
  })),
  addUserPropertyListing: (listing) => set((state) => ({
    userPropertyListings: [listing, ...(state.userPropertyListings || [])],
  })),
  updateUserPropertyListingStatus: (id, status, brokerNotes, mlsNumber) => set((state) => ({
    userPropertyListings: (state.userPropertyListings || []).map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            brokerNotes: brokerNotes !== undefined ? brokerNotes : item.brokerNotes,
            mlsNumber: mlsNumber !== undefined ? mlsNumber : item.mlsNumber,
          }
        : item
    ),
  })),
  deleteUserPropertyListing: (id) => set((state) => ({
    userPropertyListings: (state.userPropertyListings || []).filter((item) => item.id !== id),
  })),
  addTeamApplication: (app) => set((state) => ({
    teamApplications: [app, ...(state.teamApplications || [])],
  })),
  updateTeamApplicationStatus: (id, status, brokerFeedback) => set((state) => ({
    teamApplications: (state.teamApplications || []).map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            brokerFeedback: brokerFeedback !== undefined ? brokerFeedback : item.brokerFeedback,
          }
        : item
    ),
  })),
}), { name: 'arizona-life-app' }))

export function propertyMatchesType(property: Property, type: string) {
  const t = type.toLowerCase()
  const pt = property.type.toLowerCase()
  if (pt === t) return true
  if (t === 'land' && pt === 'desert') return true
  if (t === 'country homes') {
    return (
      pt.includes('home') ||
      pt === 'residential' ||
      property.title.toLowerCase().includes('home') ||
      property.description.toLowerCase().includes('home') ||
      property.description.toLowerCase().includes('country living') ||
      property.features.some((f) => f.toLowerCase().includes('single-family') || f.toLowerCase().includes('buildable'))
    )
  }
  if (t === 'equine') {
    return property.features.some((f) => f.toLowerCase().includes('horse') || f.toLowerCase().includes('livestock'))
  }
  if (t === 'investment & income' || t === 'investment') {
    return (
      pt === 'commercial' ||
      property.features.some((f) => f.toLowerCase().includes('investment') || f.toLowerCase().includes('commercial'))
    )
  }
  if (t === 'retirement & active adult') {
    return property.features.some((f) => f.toLowerCase().includes('gated') || f.toLowerCase().includes('quiet') || f.toLowerCase().includes('town access'))
  }
  if (t === 'commercial') {
    return pt === 'commercial' || property.features.some((f) => f.toLowerCase().includes('commercial'))
  }
  if (t === 'recreational') {
    return pt === 'recreational' || property.features.some((f) => f.toLowerCase().includes('recreation') || f.toLowerCase().includes('national forest'))
  }
  if (t === 'owner financing') {
    return property.features.some((f) => f.toLowerCase().includes('financing') || f.toLowerCase().includes('affordable') || f.toLowerCase().includes('lot available'))
  }
  return false
}

export function getFilteredProperties(listings: Property[], filters: Filters) {
  return listings.filter((property) =>
    property.price >= filters.minPrice &&
    property.price <= filters.maxPrice &&
    property.acres >= filters.minAcres &&
    property.acres <= filters.maxAcres &&
    (!filters.types.length || filters.types.some((t) => propertyMatchesType(property, t))) &&
    (!filters.counties.length || filters.counties.includes(property.county)) &&
    (!filters.cities.length || filters.cities.includes(property.city)) &&
    filters.features.every((feature) => property.features.some((item) => item.toLowerCase().includes(feature.toLowerCase())))
  )
}
