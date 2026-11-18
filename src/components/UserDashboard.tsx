import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  Heart,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from 'lucide-react'
import { useAppStore, type User, type UserPreferences } from '../store/useAppStore'
import { properties } from '../data/properties'
import { formatPrice } from './PropertyCard'
import './UserDashboard.css'

interface UserDashboardProps {
  onNotify?: (message: string) => void
  onAuthRequest?: () => void
  onContactBroker?: () => void
}

type DashboardTab = 'overview' | 'saved' | 'preferences' | 'profile' | 'notifications' | 'security'

// Preset Southwestern Arizona Avatars
const PRESET_AVATARS = [
  {
    id: 'desert-explorer',
    label: 'Desert Explorer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'western-rancher',
    label: 'Western Rancher',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'saguaro-trail',
    label: 'Saguaro Trail',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'arizona-sunset',
    label: 'Arizona Sunset',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'mountain-hiker',
    label: 'Mountain Hiker',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'desert-homesteader',
    label: 'Desert Homesteader',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
  },
]

const BUYER_TYPES = [
  'Land Buyer & Homesteader',
  'Ranch & Horse Property',
  'Land Investment & Acreage',
  'Country Residential Living',
  'Commercial & Development',
  'Vacation & Mountain Retreat',
]

const ACREAGE_OPTIONS = [
  'Any Acreage',
  'Under 5 acres',
  '5 - 20 acres',
  '20 - 50 acres',
  '50 - 100+ acres',
]

const BUDGET_OPTIONS = [
  'Any Budget',
  'Under $100k',
  '$100k - $250k',
  '$250k - $500k',
  '$500k+',
]

const COUNTY_OPTIONS = [
  'Cochise County',
  'Pima County',
  'Santa Cruz County',
  'Maricopa County',
  'Pinal County',
  'Graham County',
]

const PROPERTY_TYPES = [
  'Desert Land',
  'Country Homes',
  'Equine / Horse Property',
  'Investment & Commercial',
  'Off-Grid Acreage',
]

const MUST_HAVE_FEATURES = [
  'Electric on site / nearby',
  'Private well / water rights',
  'Horses allowed',
  'Mountain views',
  'Paved road access',
  'Off-grid solar ready',
  'Fenced perimeter',
]

export default function UserDashboard({ onNotify, onAuthRequest, onContactBroker }: UserDashboardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useAppStore((state) => state.currentUser)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const updateCurrentUser = useAppStore((state) => state.updateCurrentUser)
  const savedIds = useAppStore((state) => state.savedIds)
  const removeSaved = useAppStore((state) => state.removeSaved)
  const setFilters = useAppStore((state) => state.setFilters)
  const recentSearches = useAppStore((state) => state.recentSearches)
  const notificationsList = useAppStore((state) => state.notifications)
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead)

  // Active tab state (synced with URL ?tab=)
  const tabParam = searchParams.get('tab') as DashboardTab | null
  const activeTab: DashboardTab =
    tabParam && ['overview', 'saved', 'preferences', 'profile', 'notifications', 'security'].includes(tabParam)
      ? tabParam
      : 'overview'

  const handleTabChange = (tab: DashboardTab) => {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '')
  const [username, setUsername] = useState(currentUser?.username || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [avatar, setAvatar] = useState(currentUser?.avatar || '')
  const [location, setLocation] = useState(currentUser?.location || 'Southern Arizona')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [buyerType, setBuyerType] = useState(
    currentUser?.buyerType || currentUser?.preferences?.buyerType || 'Land Buyer & Homesteader'
  )

  // Preferences Form State
  const [targetAcreage, setTargetAcreage] = useState(
    currentUser?.preferences?.targetAcreage || '5 - 20 acres'
  )
  const [budgetRange, setBudgetRange] = useState(
    currentUser?.preferences?.budgetRange || '$100k - $250k'
  )
  const [preferredCounties, setPreferredCounties] = useState<string[]>(
    currentUser?.preferences?.preferredCounties || ['Cochise County']
  )
  const [preferredTypes, setPreferredTypes] = useState<string[]>(
    currentUser?.preferences?.preferredTypes || ['Desert Land', 'Country Homes']
  )
  const [mustHaves, setMustHaves] = useState<string[]>(
    currentUser?.preferences?.mustHaves || ['Mountain views', 'Off-grid solar ready']
  )

  // Notifications Form State
  const [notificationsPrefs, setNotificationsPrefs] = useState({
    priceDrops: currentUser?.preferences?.notifications?.priceDrops ?? true,
    newListings: currentUser?.preferences?.notifications?.newListings ?? true,
    tourReminders: currentUser?.preferences?.notifications?.tourReminders ?? true,
    marketReports: currentUser?.preferences?.notifications?.marketReports ?? false,
  })

  // Password / Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ message: string; isError: boolean } | null>(null)

  // Feedback states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [filtersAppliedMessage, setFiltersAppliedMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state when currentUser changes (e.g. login or switch)
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setUsername(currentUser.username || currentUser.email.split('@')[0] || '')
      setEmail(currentUser.email || '')
      setPhone(currentUser.phone || '')
      setAvatar(currentUser.avatar || '')
      setLocation(currentUser.location || 'Southern Arizona')
      setBio(currentUser.bio || '')
      setBuyerType(currentUser.buyerType || currentUser.preferences?.buyerType || 'Land Buyer & Homesteader')
      setTargetAcreage(currentUser.preferences?.targetAcreage || '5 - 20 acres')
      setBudgetRange(currentUser.preferences?.budgetRange || '$100k - $250k')
      setPreferredCounties(currentUser.preferences?.preferredCounties || ['Cochise County'])
      setPreferredTypes(currentUser.preferences?.preferredTypes || ['Desert Land', 'Country Homes'])
      setMustHaves(currentUser.preferences?.mustHaves || ['Mountain views', 'Off-grid solar ready'])
      setNotificationsPrefs({
        priceDrops: currentUser.preferences?.notifications?.priceDrops ?? true,
        newListings: currentUser.preferences?.notifications?.newListings ?? true,
        tourReminders: currentUser.preferences?.notifications?.tourReminders ?? true,
        marketReports: currentUser.preferences?.notifications?.marketReports ?? false,
      })
    }
  }, [currentUser])

  // Saved properties items
  const savedProperties = properties.filter((p) => savedIds.includes(p.id))

  // File upload and canvas compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 240
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

        setAvatar(compressedDataUrl)
        setShowAvatarPicker(false)
        setErrorMessage('')
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleSaveAll = () => {
    setErrorMessage('')
    if (!name.trim()) {
      setErrorMessage('Full name cannot be empty.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please provide a valid email address.')
      return
    }

    setSaveStatus('saving')
    setTimeout(() => {
      const updatedPreferences: UserPreferences = {
        buyerType,
        targetAcreage,
        budgetRange,
        preferredCounties,
        preferredTypes,
        mustHaves,
        notifications: notificationsPrefs,
      }

      const updatedUser: Partial<User> = {
        name: name.trim(),
        username: username.trim().replace(/^@/, ''),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar || undefined,
        location: location.trim(),
        bio: bio.trim(),
        buyerType,
        preferences: updatedPreferences,
      }

      updateCurrentUser(updatedUser)
      setSaveStatus('saved')
      onNotify?.('Profile updated successfully!')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }, 350)
  }

  const handleApplyPreferencesToSearch = () => {
    let minAcres = 0
    let maxAcres = 500
    if (targetAcreage === 'Under 5 acres') {
      minAcres = 0
      maxAcres = 5
    } else if (targetAcreage === '5 - 20 acres') {
      minAcres = 5
      maxAcres = 20
    } else if (targetAcreage === '20 - 50 acres') {
      minAcres = 20
      maxAcres = 50
    } else if (targetAcreage === '50 - 100+ acres') {
      minAcres = 50
      maxAcres = 500
    }

    let minPrice = 0
    let maxPrice = 1000000
    if (budgetRange === 'Under $100k') {
      minPrice = 0
      maxPrice = 100000
    } else if (budgetRange === '$100k - $250k') {
      minPrice = 100000
      maxPrice = 250000
    } else if (budgetRange === '$250k - $500k') {
      minPrice = 250000
      maxPrice = 500000
    } else if (budgetRange === '$500k+') {
      minPrice = 500000
      maxPrice = 2000000
    }

    const cleanedCounties = preferredCounties.map((c) => c.replace(' County', ''))

    setFilters({
      minPrice,
      maxPrice,
      minAcres,
      maxAcres,
      types: preferredTypes.map((t) => t.toLowerCase()),
      counties: cleanedCounties,
      cities: [],
      features: mustHaves,
    })

    setFiltersAppliedMessage('Preferences applied to Search Filters!')
    onNotify?.('Preferences synced with search filters')
    setTimeout(() => setFiltersAppliedMessage(''), 3000)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (!currentPassword) {
      setPasswordStatus({ message: 'Please enter your current password.', isError: true })
      return
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ message: 'New password must be at least 6 characters.', isError: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ message: 'New passwords do not match.', isError: true })
      return
    }

    setPasswordStatus({ message: 'Password updated successfully!', isError: false })
    onNotify?.('Security password updated')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleExportProfile = () => {
    if (!currentUser) return
    const profileData = {
      name,
      username,
      email,
      phone,
      location,
      buyerType,
      memberSince: currentUser.memberSince,
      preferences: {
        targetAcreage,
        budgetRange,
        preferredCounties,
        preferredTypes,
        mustHaves,
        notifications: notificationsPrefs,
      },
      savedPropertiesCount: savedIds.length,
      savedPropertyIds: savedIds,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arizona-life-profile-${username || 'user'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onNotify?.('Exported profile summary')
  }

  const handleDemoLogin = () => {
    const demoUser: User = {
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      username: 'sarah_miller',
      phone: '(602) 555-0142',
      location: 'Tucson, AZ',
      buyerType: 'Land Buyer & Homesteader',
      bio: 'Searching for 10-40 acres in Cochise or Santa Cruz County with mountain views and water well potential.',
      memberSince: 'Nov 2024',
      preferences: {
        buyerType: 'Land Buyer & Homesteader',
        targetAcreage: '5 - 20 acres',
        budgetRange: '$100k - $250k',
        preferredCounties: ['Cochise County', 'Pima County'],
        preferredTypes: ['Desert Land', 'Country Homes'],
        mustHaves: ['Mountain views', 'Off-grid solar ready'],
        notifications: {
          priceDrops: true,
          newListings: true,
          tourReminders: true,
          marketReports: false,
        },
      },
    }
    setCurrentUser(demoUser)
    onNotify?.('Signed in as Sarah Miller')
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    onNotify?.('Signed out successfully')
  }

  // Initials for avatar fallback
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AZ'

  // ============================================
  // GUEST STATE (Not Signed In)
  // ============================================
  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-guest-hero">
          <div className="dashboard-guest-icon-badge">
            <UserIcon size={32} />
          </div>
          <h1>User Dashboard</h1>
          <p className="dashboard-guest-sub">
            Your personalized client portal for Southern Arizona land, homesteads, and ranches.
          </p>

          <div className="dashboard-guest-features-card">
            <h3>Everything in one place</h3>
            <ul>
              <li>
                <CheckCircle2 size={16} className="feature-check" />
                <span>Save and compare properties across devices</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="feature-check" />
                <span>Receive price-drop and new listing acreage alerts</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="feature-check" />
                <span>Customize your homesteading &amp; budget criteria</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="feature-check" />
                <span>Direct line to local Southern Arizona broker Rick Frank</span>
              </li>
            </ul>
          </div>

          <div className="dashboard-guest-actions">
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={onAuthRequest}
            >
              Sign In or Register <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={handleDemoLogin}
            >
              <Sparkles size={16} /> Explore with Demo Account (Sarah Miller)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // LOGGED IN USER DASHBOARD
  // ============================================
  return (
    <div className="dashboard-container">
      {/* Profile Hero Header */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-bg" />
        <div className="dashboard-hero-content">
          <div className="dashboard-avatar-section">
            <div className="dashboard-avatar-wrapper">
              {avatar ? (
                <img src={avatar} alt={name} className="dashboard-avatar-img" />
              ) : (
                <div className="dashboard-avatar-placeholder">{initials}</div>
              )}
              <button
                type="button"
                className="dashboard-avatar-cam-btn"
                onClick={() => setShowAvatarPicker((v) => !v)}
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="dashboard-hero-details">
            <div className="dashboard-hero-title-row">
              <h2>{name}</h2>
              <span className="dashboard-verified-pill">
                <Sparkles size={11} /> Verified Buyer
              </span>
            </div>
            <p className="dashboard-hero-sub">
              <span>@{username || 'buyer'}</span> · <MapPin size={12} /> {location || 'Southern Arizona'}
            </p>
            <div className="dashboard-hero-tags">
              <span className="dashboard-hero-tag">{buyerType}</span>
              <span className="dashboard-hero-date">Member since {currentUser.memberSince || 'Today'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal / Dropdown */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            className="dashboard-avatar-picker"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="dashboard-picker-head">
              <h4>Choose Profile Photo</h4>
              <button
                type="button"
                className="dashboard-picker-close"
                onClick={() => setShowAvatarPicker(false)}
              >
                ✕
              </button>
            </div>

            <div className="dashboard-picker-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="dashboard-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload Custom Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  className="dashboard-remove-btn"
                  onClick={() => {
                    setAvatar('')
                    setShowAvatarPicker(false)
                  }}
                >
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>

            <span className="dashboard-picker-presets-label">Southwestern Arizona Presets:</span>
            <div className="dashboard-presets-grid">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`dashboard-preset-btn ${avatar === preset.url ? 'is-selected' : ''}`}
                  onClick={() => {
                    setAvatar(preset.url)
                    setShowAvatarPicker(false)
                  }}
                >
                  <img src={preset.url} alt={preset.label} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard KPI Stats Strip */}
      <div className="dashboard-stats-strip">
        <button
          type="button"
          className="dashboard-stat-card"
          onClick={() => handleTabChange('saved')}
        >
          <div className="dashboard-stat-icon-wrap is-heart">
            <Heart size={16} />
          </div>
          <div className="dashboard-stat-data">
            <strong>{savedIds.length}</strong>
            <span>Saved Places</span>
          </div>
        </button>

        <button
          type="button"
          className="dashboard-stat-card"
          onClick={() => handleTabChange('preferences')}
        >
          <div className="dashboard-stat-icon-wrap is-land">
            <LandPlot size={16} />
          </div>
          <div className="dashboard-stat-data">
            <strong>{targetAcreage.replace(' acres', ' ac')}</strong>
            <span>Target Acreage</span>
          </div>
        </button>

        <button
          type="button"
          className="dashboard-stat-card"
          onClick={() => handleTabChange('preferences')}
        >
          <div className="dashboard-stat-icon-wrap is-budget">
            <Sliders size={16} />
          </div>
          <div className="dashboard-stat-data">
            <strong>{budgetRange}</strong>
            <span>Budget</span>
          </div>
        </button>

        <button
          type="button"
          className="dashboard-stat-card"
          onClick={() => handleTabChange('notifications')}
        >
          <div className="dashboard-stat-icon-wrap is-alerts">
            <Bell size={16} />
          </div>
          <div className="dashboard-stat-data">
            <strong>{notificationsList.filter((n) => !n.read).length}</strong>
            <span>Alerts</span>
          </div>
        </button>
      </div>

      {/* Dashboard Tab Navigation Bar */}
      <div className="dashboard-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={`dashboard-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <LayoutDashboard size={14} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'saved'}
          className={`dashboard-tab-btn ${activeTab === 'saved' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('saved')}
        >
          <Heart size={14} />
          <span>Saved Places</span>
          {savedIds.length > 0 && <span className="tab-counter">{savedIds.length}</span>}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'preferences'}
          className={`dashboard-tab-btn ${activeTab === 'preferences' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('preferences')}
        >
          <SlidersHorizontal size={14} />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`dashboard-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <UserIcon size={14} />
          <span>Profile Info</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          className={`dashboard-tab-btn ${activeTab === 'notifications' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('notifications')}
        >
          <Bell size={14} />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`dashboard-tab-btn ${activeTab === 'security' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('security')}
        >
          <Shield size={14} />
          <span>Security</span>
        </button>
      </div>

      {/* Feedback alerts */}
      {errorMessage && (
        <div className="dashboard-alert is-error">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}
      {filtersAppliedMessage && (
        <div className="dashboard-alert is-success">
          <CheckCircle2 size={15} />
          <span>{filtersAppliedMessage}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: OVERVIEW
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="dashboard-tab-pane">
          {/* Quick Welcome Banner */}
          <div className="dashboard-welcome-card">
            <div>
              <h3>Good day, {name.split(' ')[0]}</h3>
              <p>
                Your Arizona land dashboard is active. You have <strong>{savedIds.length}</strong> shortlisted places
                and personalized alerts set for <strong>{preferredCounties.join(', ')}</strong>.
              </p>
            </div>
            <button
              type="button"
              className="dashboard-inline-action-btn"
              onClick={() => navigate('/search')}
            >
              Browse Land <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="dashboard-actions-grid">
            <div
              className="dashboard-action-tile"
              onClick={() => navigate('/search')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/search')
                }
              }}
            >
              <div className="action-tile-icon green">
                <Search size={18} />
              </div>
              <div className="action-tile-body">
                <strong>Explore Listings</strong>
                <span>Search all active Arizona parcels</span>
              </div>
              <ChevronRight size={16} className="action-arrow" />
            </div>

            <div
              className="dashboard-action-tile"
              onClick={() => handleTabChange('saved')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('saved')
                }
              }}
            >
              <div className="action-tile-icon red">
                <Heart size={18} />
              </div>
              <div className="action-tile-body">
                <strong>Saved Properties ({savedIds.length})</strong>
                <span>Review your favorite acreage</span>
              </div>
              <ChevronRight size={16} className="action-arrow" />
            </div>

            <div
              className="dashboard-action-tile"
              onClick={() => handleTabChange('preferences')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('preferences')
                }
              }}
            >
              <div className="action-tile-icon blue">
                <Sliders size={18} />
              </div>
              <div className="action-tile-body">
                <strong>Search Criteria</strong>
                <span>{targetAcreage} · {budgetRange}</span>
              </div>
              <ChevronRight size={16} className="action-arrow" />
            </div>

            <div
              className="dashboard-action-tile"
              onClick={() => navigate('/map')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/map')
                }
              }}
            >
              <div className="action-tile-icon amber">
                <Compass size={18} />
              </div>
              <div className="action-tile-body">
                <strong>Interactive Map</strong>
                <span>Inspect boundaries &amp; terrain</span>
              </div>
              <ChevronRight size={16} className="action-arrow" />
            </div>
          </div>

          {/* Saved Places Preview Section */}
          <div className="dashboard-section-card">
            <div className="dashboard-card-head">
              <div>
                <h4>Saved Places ({savedProperties.length})</h4>
                <p>Properties you bookmarked for later review</p>
              </div>
              <button
                type="button"
                className="dashboard-card-link-btn"
                onClick={() => handleTabChange('saved')}
              >
                View all ({savedProperties.length}) <ChevronRight size={14} />
              </button>
            </div>

            {savedProperties.length > 0 ? (
              <div className="dashboard-saved-preview-list">
                {savedProperties.slice(0, 3).map((property) => (
                  <div key={property.id} className="dashboard-saved-row">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="saved-row-thumb"
                      onClick={() => navigate(`/property/${property.id}`)}
                    />
                    <div
                      className="saved-row-details"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      <span className="saved-row-price">{formatPrice(property.price)}</span>
                      <strong className="saved-row-title">{property.title}</strong>
                      <span className="saved-row-meta">
                        {property.acres} acres · {property.city}, {property.county} County
                      </span>
                    </div>
                    <button
                      type="button"
                      className="saved-row-remove-btn"
                      onClick={() => {
                        removeSaved(property.id)
                        onNotify?.('Removed from saved places')
                      }}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-box">
                <Heart size={24} className="empty-icon" />
                <p>No saved properties yet.</p>
                <button
                  type="button"
                  className="dashboard-pill-btn"
                  onClick={() => navigate('/search')}
                >
                  Explore Arizona listings
                </button>
              </div>
            )}
          </div>

          {/* Assigned Local Broker Card */}
          <div className="dashboard-broker-card">
            <div className="broker-photo-wrap">
              <div className="broker-avatar-pill">RF</div>
            </div>
            <div className="broker-info">
              <span className="broker-badge">Your Dedicated Arizona Broker</span>
              <h4>Rick Frank</h4>
              <p className="broker-office">
                Southern Arizona Specialist · United Country Real Estate
              </p>
              <p className="broker-note">
                "Ready to walk land boundaries, check water tables, or schedule a desert parcel tour."
              </p>
              <div className="broker-actions">
                <a href="tel:+15204033903" className="broker-call-btn">
                  <Phone size={13} /> Call (520) 403-3903
                </a>
                {onContactBroker && (
                  <button
                    type="button"
                    className="broker-msg-btn"
                    onClick={onContactBroker}
                  >
                    <Mail size={13} /> Send Inquiry
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="dashboard-section-card">
              <div className="dashboard-card-head">
                <div>
                  <h4>Recent Searches</h4>
                  <p>Quick shortcuts to your previous searches</p>
                </div>
              </div>
              <div className="dashboard-search-chips">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    className="dashboard-search-chip"
                    onClick={() => navigate(`/search`)}
                  >
                    <Search size={12} /> {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: SAVED PLACES
      ======================================================== */}
      {activeTab === 'saved' && (
        <div className="dashboard-tab-pane">
          <div className="dashboard-pane-header">
            <div>
              <h3>Saved Properties</h3>
              <p>You have {savedProperties.length} saved Arizona parcels</p>
            </div>
            {savedProperties.length > 0 && (
              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={() => navigate('/saved')}
              >
                Compare Tool <ExternalLink size={14} />
              </button>
            )}
          </div>

          {savedProperties.length > 0 ? (
            <div className="dashboard-full-saved-grid">
              {savedProperties.map((property) => (
                <div key={property.id} className="dashboard-property-card">
                  <div
                    className="dashboard-property-thumb-wrap"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <img src={property.images[0]} alt={property.title} />
                    <span className="dashboard-card-price">{formatPrice(property.price)}</span>
                  </div>
                  <div className="dashboard-property-card-body">
                    <strong
                      className="dashboard-card-title"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      {property.title}
                    </strong>
                    <div className="dashboard-card-meta">
                      <span>{property.acres} acres</span>
                      <span>·</span>
                      <span>{property.type}</span>
                      <span>·</span>
                      <span>{property.city}, AZ</span>
                    </div>
                    <div className="dashboard-card-tags">
                      {property.features.slice(0, 2).map((feat) => (
                        <span key={feat} className="mini-tag">
                          {feat}
                        </span>
                      ))}
                    </div>
                    <div className="dashboard-card-actions">
                      <button
                        type="button"
                        className="dashboard-view-listing-btn"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        View Details <ArrowRight size={13} />
                      </button>
                      <button
                        type="button"
                        className="dashboard-card-remove-btn"
                        onClick={() => {
                          removeSaved(property.id)
                          onNotify?.('Removed from saved places')
                        }}
                        title="Remove from saved"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-full">
              <Heart size={36} className="empty-icon" />
              <h3>Your shortlisted places will appear here</h3>
              <p>
                Browse Southern Arizona acreage, ranches, and country homes. Tap the heart icon to save
                properties for your portfolio.
              </p>
              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={() => navigate('/search')}
              >
                Find Arizona Properties
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: BUYING PREFERENCES
      ======================================================== */}
      {activeTab === 'preferences' && (
        <div className="dashboard-tab-pane">
          <div className="dashboard-pane-header">
            <div>
              <h3>Buying Preferences &amp; Criteria</h3>
              <p>Tell us what land you seek so we can tailor listing alerts and filters.</p>
            </div>
            <button
              type="button"
              className="dashboard-sync-btn"
              onClick={handleApplyPreferencesToSearch}
            >
              <Sliders size={14} /> Apply to Search Filters
            </button>
          </div>

          <div className="dashboard-card-box">
            <h4>Buyer Persona / Goal</h4>
            <div className="dashboard-pill-options">
              {BUYER_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`option-chip ${buyerType === type ? 'is-selected' : ''}`}
                  onClick={() => setBuyerType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Target Acreage</h4>
            <div className="dashboard-pill-options">
              {ACREAGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`option-chip ${targetAcreage === opt ? 'is-selected' : ''}`}
                  onClick={() => setTargetAcreage(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Target Budget</h4>
            <div className="dashboard-pill-options">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`option-chip ${budgetRange === opt ? 'is-selected' : ''}`}
                  onClick={() => setBudgetRange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Preferred Arizona Counties</h4>
            <div className="dashboard-pill-options">
              {COUNTY_OPTIONS.map((county) => (
                <button
                  key={county}
                  type="button"
                  className={`option-chip ${preferredCounties.includes(county) ? 'is-selected' : ''}`}
                  onClick={() => toggleArrayItem(preferredCounties, setPreferredCounties, county)}
                >
                  {preferredCounties.includes(county) && <Check size={12} />} {county}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Property Types</h4>
            <div className="dashboard-pill-options">
              {PROPERTY_TYPES.map((ptype) => (
                <button
                  key={ptype}
                  type="button"
                  className={`option-chip ${preferredTypes.includes(ptype) ? 'is-selected' : ''}`}
                  onClick={() => toggleArrayItem(preferredTypes, setPreferredTypes, ptype)}
                >
                  {preferredTypes.includes(ptype) && <Check size={12} />} {ptype}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Must-Have Features</h4>
            <div className="dashboard-features-checklist">
              {MUST_HAVE_FEATURES.map((feat) => {
                const checked = mustHaves.includes(feat)
                return (
                  <label key={feat} className="checklist-label">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArrayItem(mustHaves, setMustHaves, feat)}
                    />
                    <span>{feat}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="dashboard-save-strip">
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={handleSaveAll}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                'Saving Preferences…'
              ) : saveStatus === 'saved' ? (
                <>
                  <Check size={16} strokeWidth={2.5} /> Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={handleApplyPreferencesToSearch}
            >
              Sync with Search
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: PROFILE INFO
      ======================================================== */}
      {activeTab === 'profile' && (
        <div className="dashboard-tab-pane">
          <div className="dashboard-pane-header">
            <div>
              <h3>Personal Profile</h3>
              <p>Manage your account name, contact details, and buyer bio.</p>
            </div>
          </div>

          <div className="dashboard-form-card">
            <div className="dashboard-form-grid">
              <div className="dashboard-field-group">
                <label htmlFor="dash-name">Full Name *</label>
                <input
                  id="dash-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="dash-username">Username</label>
                <input
                  id="dash-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sarah_miller"
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="dash-email">Email Address *</label>
                <input
                  id="dash-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="dash-phone">Phone Number</label>
                <input
                  id="dash-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(602) 555-0142"
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="dash-location">Location / Residence</label>
                <input
                  id="dash-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tucson, AZ"
                />
              </div>

              <div className="dashboard-field-group full-width">
                <label htmlFor="dash-bio">Buyer Bio / Search Goals</label>
                <textarea
                  id="dash-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Looking for 10-40 acres in Cochise or Santa Cruz County with mountain views..."
                />
              </div>
            </div>

            <div className="dashboard-save-strip">
              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={handleSaveAll}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  'Saving Changes…'
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check size={16} strokeWidth={2.5} /> Saved!
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: ALERTS & NOTIFICATIONS
      ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="dashboard-tab-pane">
          <div className="dashboard-pane-header">
            <div>
              <h3>Alerts &amp; Notifications</h3>
              <p>Configure which real-time Arizona real estate updates you receive.</p>
            </div>
          </div>

          <div className="dashboard-card-box">
            <h4>Notification Channels</h4>
            <div className="dashboard-toggle-list">
              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>Price Drop Alerts</strong>
                  <span>Instant notification when saved properties reduce in price</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={notificationsPrefs.priceDrops}
                  onChange={(e) =>
                    setNotificationsPrefs((prev) => ({ ...prev, priceDrops: e.target.checked }))
                  }
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>New Listing Matches</strong>
                  <span>Alerts when new land parcels match your acreage &amp; budget criteria</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={notificationsPrefs.newListings}
                  onChange={(e) =>
                    setNotificationsPrefs((prev) => ({ ...prev, newListings: e.target.checked }))
                  }
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>Tour &amp; Showing Reminders</strong>
                  <span>Reminders for scheduled broker parcel walk-throughs</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={notificationsPrefs.tourReminders}
                  onChange={(e) =>
                    setNotificationsPrefs((prev) => ({ ...prev, tourReminders: e.target.checked }))
                  }
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <strong>Southern Arizona Market Reports</strong>
                  <span>Quarterly land values, water availability, and zoning updates</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={notificationsPrefs.marketReports}
                  onChange={(e) =>
                    setNotificationsPrefs((prev) => ({ ...prev, marketReports: e.target.checked }))
                  }
                />
              </label>
            </div>

            <div className="dashboard-save-strip" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={handleSaveAll}
              >
                Save Notification Preferences
              </button>
            </div>
          </div>

          {/* Recent Notifications feed */}
          <div className="dashboard-card-box">
            <div className="dashboard-card-head">
              <h4>Recent Notifications Feed</h4>
              <button
                type="button"
                className="dashboard-card-link-btn"
                onClick={() => {
                  markAllNotificationsRead()
                  onNotify?.('All notifications marked as read')
                }}
              >
                Mark all read
              </button>
            </div>

            <div className="dashboard-notifications-feed">
              {notificationsList.map((item) => (
                <div
                  key={item.id}
                  className={`dashboard-feed-item ${!item.read ? 'is-unread' : ''}`}
                  onClick={() => {
                    if (item.propertyId) navigate(`/property/${item.propertyId}`)
                  }}
                >
                  <div className="feed-item-bullet" />
                  <div className="feed-item-content">
                    <div className="feed-item-top">
                      <strong>{item.title}</strong>
                      <span className="feed-item-date">{item.date}</span>
                    </div>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: SECURITY & ACCOUNT
      ======================================================== */}
      {activeTab === 'security' && (
        <div className="dashboard-tab-pane">
          <div className="dashboard-pane-header">
            <div>
              <h3>Account &amp; Security</h3>
              <p>Manage authentication credentials, data export, and session access.</p>
            </div>
          </div>

          {/* Password update form */}
          <div className="dashboard-card-box">
            <h4>Change Password</h4>
            {passwordStatus && (
              <div
                className={`dashboard-alert ${passwordStatus.isError ? 'is-error' : 'is-success'}`}
              >
                {passwordStatus.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{passwordStatus.message}</span>
              </div>
            )}
            <form onSubmit={handleUpdatePassword} className="dashboard-password-form">
              <div className="dashboard-field-group">
                <label htmlFor="sec-current">Current Password</label>
                <input
                  id="sec-current"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="sec-new">New Password</label>
                <input
                  id="sec-new"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="dashboard-field-group">
                <label htmlFor="sec-confirm">Confirm New Password</label>
                <input
                  id="sec-confirm"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="dashboard-primary-btn" style={{ width: 'fit-content' }}>
                Update Password
              </button>
            </form>
          </div>

          {/* Active Session info */}
          <div className="dashboard-card-box">
            <h4>Active Device &amp; Sessions</h4>
            <div className="session-card">
              <div className="session-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="session-info">
                <strong>Current Active Device (Browser)</strong>
                <span>Arizona, United States · SSL Encrypted · Active Now</span>
              </div>
              <span className="session-badge">Current</span>
            </div>
          </div>

          {/* Export & Sign Out */}
          <div className="dashboard-card-box">
            <h4>Account Operations</h4>
            <div className="dashboard-danger-actions">
              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={handleExportProfile}
              >
                <Download size={14} /> Export Profile &amp; Saved Data (JSON)
              </button>

              <button
                type="button"
                className="dashboard-signout-btn"
                onClick={handleSignOut}
              >
                <LogOut size={14} /> Sign out of Arizona Life
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
