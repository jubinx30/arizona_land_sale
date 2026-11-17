import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Check,
  CheckCircle2,
  Download,
  Heart,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
  Bell,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useAppStore, type User, type UserPreferences } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import './UserProfileView.css'

interface UserProfileViewProps {
  onClose: () => void
  onSignOut: () => void
}

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

export default function UserProfileView({ onClose, onSignOut }: UserProfileViewProps) {
  const navigate = useNavigate()
  const currentUser = useAppStore((state) => state.currentUser)
  const updateCurrentUser = useAppStore((state) => state.updateCurrentUser)
  const savedIds = useAppStore((state) => state.savedIds)
  const setFilters = useAppStore((state) => state.setFilters)

  const [activeTab, setActiveTab] = useState<'details' | 'preferences' | 'notifications' | 'security'>('details')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Personal form state
  const [name, setName] = useState(currentUser?.name || '')
  const [username, setUsername] = useState(
    currentUser?.username || currentUser?.email.split('@')[0] || ''
  )
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [avatar, setAvatar] = useState(currentUser?.avatar || '')
  const [location, setLocation] = useState(currentUser?.location || 'Southern Arizona')
  const [bio, setBio] = useState(
    currentUser?.bio ||
      'Looking for land with scenic mountain views and space for homesteading in Cochise County.'
  )
  const [buyerType, setBuyerType] = useState(
    currentUser?.buyerType || currentUser?.preferences?.buyerType || 'Land Buyer & Homesteader'
  )

  // Property Preferences state
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

  // Notifications state
  const [notifications, setNotifications] = useState({
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

  // Status feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [filtersAppliedMessage, setFiltersAppliedMessage] = useState('')

  if (!currentUser) return null

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

  const handleSelectPreset = (url: string) => {
    setAvatar(url)
    setShowAvatarPicker(false)
  }

  const handleRemoveAvatar = () => {
    setAvatar('')
    setShowAvatarPicker(false)
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
        notifications,
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
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleExportProfile = () => {
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
        notifications,
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
  }

  // Initials for avatar fallback
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AZ'

  return (
    <div className="profile-hub-view">
      {/* Top Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar-wrapper">
            {avatar ? (
              <img src={avatar} alt={name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            <button
              type="button"
              className="profile-avatar-edit-badge"
              onClick={() => setShowAvatarPicker((v) => !v)}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              <Camera size={15} />
            </button>
          </div>
        </div>

        <div className="profile-hero-info">
          <div className="profile-hero-title-row">
            <h2>{name}</h2>
            <span className="profile-verified-badge" title="Verified Arizona Life Member">
              <Sparkles size={12} /> Verified Member
            </span>
          </div>
          <p className="profile-hero-handle">
            <span>@{username || 'user'}</span> · <MapPin size={12} /> {location || 'Arizona'}
          </p>
          <div className="profile-hero-tags">
            <span className="profile-tag-pill">{buyerType}</span>
            <span className="profile-tag-date">Joined {currentUser.memberSince || 'Recently'}</span>
          </div>
        </div>
      </div>

      {/* Avatar Picker / Upload Popover */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            className="avatar-picker-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="avatar-picker-header">
              <h4>Choose Profile Image</h4>
              <span className="avatar-picker-subtitle">Upload your own photo or pick an Arizona preset</span>
            </div>

            <div className="avatar-picker-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="avatar-picker-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload Custom Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  className="avatar-picker-remove-btn"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>

            <div className="avatar-presets-grid">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatar === preset.url
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset(preset.url)}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} />
                    {isSelected && (
                      <span className="avatar-preset-check">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <span className="avatar-preset-label">{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="profile-nav-tabs">
        <button
          type="button"
          className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <UserIcon size={13} />
          <span>Personal</span>
        </button>

        <button
          type="button"
          className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Sliders size={13} />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          className={`profile-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={13} />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={13} />
          <span>Security</span>
        </button>
      </div>

      {/* Error / Alert notification banner */}
      {errorMessage && (
        <div className="profile-alert-banner is-error">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {filtersAppliedMessage && (
        <div className="profile-alert-banner is-success">
          <CheckCircle2 size={15} />
          <span>{filtersAppliedMessage}</span>
        </div>
      )}

      {/* Tab 1: Personal Details */}
      {activeTab === 'details' && (
        <div className="profile-tab-content">
          <div className="profile-form-grid">
            <div className="profile-field-group">
              <label htmlFor="pf-name">Full Name *</label>
              <div className="profile-input-wrap">
                <UserIcon size={15} className="field-icon" />
                <input
                  id="pf-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="pf-username">Username / Handle</label>
              <div className="profile-input-wrap">
                <span className="field-prefix">@</span>
                <input
                  id="pf-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="pf-email">Email Address *</label>
              <div className="profile-input-wrap">
                <Mail size={15} className="field-icon" />
                <input
                  id="pf-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="pf-phone">Phone Number</label>
              <div className="profile-input-wrap">
                <Phone size={15} className="field-icon" />
                <input
                  id="pf-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(520) 555-0199"
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="pf-location">Location / City</label>
              <div className="profile-input-wrap">
                <MapPin size={15} className="field-icon" />
                <input
                  id="pf-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tucson, AZ or Benson, AZ"
                />
              </div>
            </div>

            <div className="profile-field-group">
              <label htmlFor="pf-buyertype">Buyer Archetype</label>
              <select
                id="pf-buyertype"
                className="profile-select"
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value)}
              >
                {BUYER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-field-group full-width">
            <label htmlFor="pf-bio">Buyer Bio & Criteria Note</label>
            <textarea
              id="pf-bio"
              rows={3}
              className="profile-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brokers Rick Frank & team what you are dreaming of (e.g., horse fencing, solar setup, scenic vistas, water well depth)..."
            />
            <span className="profile-field-hint">
              This note helps our local Arizona brokers curate private & off-market listings for you.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Property Preferences */}
      {activeTab === 'preferences' && (
        <div className="profile-tab-content">
          <div className="preferences-section">
            <label className="pref-section-title">Target Acreage</label>
            <div className="chips-row">
              {ACREAGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`chip-button ${targetAcreage === opt ? 'active' : ''}`}
                  onClick={() => setTargetAcreage(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="preferences-section">
            <label className="pref-section-title">Target Price Range</label>
            <div className="chips-row">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`chip-button ${budgetRange === opt ? 'active' : ''}`}
                  onClick={() => setBudgetRange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="preferences-section">
            <label className="pref-section-title">Preferred Arizona Counties</label>
            <div className="chips-row multi">
              {COUNTY_OPTIONS.map((county) => {
                const isSelected = preferredCounties.includes(county)
                return (
                  <button
                    key={county}
                    type="button"
                    className={`chip-button ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(preferredCounties, setPreferredCounties, county)}
                  >
                    {isSelected && <Check size={12} />}
                    {county}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="preferences-section">
            <label className="pref-section-title">Preferred Property Types</label>
            <div className="chips-row multi">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = preferredTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    className={`chip-button ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(preferredTypes, setPreferredTypes, type)}
                  >
                    {isSelected && <Check size={12} />}
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="preferences-section">
            <label className="pref-section-title">Must-Have Amenities</label>
            <div className="chips-row multi">
              {MUST_HAVE_FEATURES.map((feature) => {
                const isSelected = mustHaves.includes(feature)
                return (
                  <button
                    key={feature}
                    type="button"
                    className={`chip-button ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(mustHaves, setMustHaves, feature)}
                  >
                    {isSelected && <Check size={12} />}
                    {feature}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Filter Sync Tool */}
          <div className="pref-sync-card">
            <div>
              <strong>Sync with Live Property Search</strong>
              <p>Apply your target acreage, budget, and counties directly to active search filters.</p>
            </div>
            <button
              type="button"
              className="pref-sync-btn"
              onClick={handleApplyPreferencesToSearch}
            >
              <Sliders size={14} /> Apply to Search
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications & Alerts */}
      {activeTab === 'notifications' && (
        <div className="profile-tab-content">
          <div className="notif-settings-list">
            <label className="notif-item">
              <div className="notif-item-text">
                <strong>Price Drop Alerts</strong>
                <p>Instant notification whenever properties in your saved list drop in price.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                checked={notifications.priceDrops}
                onChange={(e) =>
                  setNotifications({ ...notifications, priceDrops: e.target.checked })
                }
              />
            </label>

            <label className="notif-item">
              <div className="notif-item-text">
                <strong>New Matching Land Listings</strong>
                <p>Get alerted when new acreage matching your preferred counties hits the market.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                checked={notifications.newListings}
                onChange={(e) =>
                  setNotifications({ ...notifications, newListings: e.target.checked })
                }
              />
            </label>

            <label className="notif-item">
              <div className="notif-item-text">
                <strong>Land Tour & Showing Reminders</strong>
                <p>Receive SMS and calendar alerts 24h & 2h before guided property visits.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                checked={notifications.tourReminders}
                onChange={(e) =>
                  setNotifications({ ...notifications, tourReminders: e.target.checked })
                }
              />
            </label>

            <label className="notif-item">
              <div className="notif-item-text">
                <strong>Arizona Land Market Report</strong>
                <p>Monthly digest on water basin regulations, rural zoning, and local land sales.</p>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                checked={notifications.marketReports}
                onChange={(e) =>
                  setNotifications({ ...notifications, marketReports: e.target.checked })
                }
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Account */}
      {activeTab === 'security' && (
        <div className="profile-tab-content">
          {/* Quick Account Summary */}
          <div className="account-stats-row">
            <div
              className="account-stat-box clickable"
              onClick={() => {
                onClose()
                navigate('/saved')
              }}
            >
              <div className="stat-icon-wrap">
                <Heart size={16} />
              </div>
              <div className="stat-info">
                <strong>{savedIds.length}</strong>
                <span>Saved Places</span>
              </div>
              <ExternalLink size={13} className="stat-arrow" />
            </div>

            <div className="account-stat-box">
              <div className="stat-icon-wrap shield">
                <Shield size={16} />
              </div>
              <div className="stat-info">
                <strong>Active</strong>
                <span>Verified Client</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="security-form-box">
            <h4>
              <KeyRound size={15} /> Change Password
            </h4>

            {passwordStatus && (
              <div
                className={`profile-alert-banner ${
                  passwordStatus.isError ? 'is-error' : 'is-success'
                }`}
              >
                {passwordStatus.isError ? <AlertCircle size={14} /> : <Check size={14} />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <div className="profile-field-group">
              <label htmlFor="sec-current">Current Password</label>
              <input
                id="sec-current"
                type="password"
                className="profile-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="sec-new">New Password</label>
              <input
                id="sec-new"
                type="password"
                className="profile-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="profile-field-group">
              <label htmlFor="sec-confirm">Confirm New Password</label>
              <input
                id="sec-confirm"
                type="password"
                className="profile-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="security-submit-btn">
              Update Password
            </button>
          </form>

          {/* Export and Sign out */}
          <div className="security-actions-card">
            <button
              type="button"
              className="security-action-btn export-btn"
              onClick={handleExportProfile}
            >
              <Download size={15} /> Export Profile & Saved Places Summary
            </button>

            <button
              type="button"
              className="security-action-btn signout-btn"
              onClick={onSignOut}
            >
              <LogOut size={15} /> Sign out of Arizona Life
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="profile-hub-footer">
        <button
          type="button"
          className="profile-save-btn"
          onClick={handleSaveAll}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? (
            <span>Saving changes…</span>
          ) : saveStatus === 'saved' ? (
            <>
              <Check size={16} strokeWidth={2.5} /> Saved successfully!
            </>
          ) : (
            <>
              <Check size={16} /> Save Changes
            </>
          )}
        </button>

        <button
          type="button"
          className="profile-done-btn"
          onClick={onClose}
        >
          Done <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
