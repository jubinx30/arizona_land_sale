import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellRing,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  Heart,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react'
import {
  useAppStore,
  type User,
  type UserPreferences,
  type PersonalizedAlert,
} from '../store/useAppStore'
import { properties, type Property } from '../data/properties'
import { formatPrice } from './PropertyCard'
import './UserDashboard.css'

interface UserDashboardProps {
  onNotify?: (message: string) => void
  onAuthRequest?: () => void
  onContactBroker?: () => void
}

type DashboardTab = 'overview' | 'alerts' | 'saved' | 'settings' | 'security'

const PRESET_AVATARS = [
  { id: 'desert-explorer', label: 'Desert Explorer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'western-rancher', label: 'Western Rancher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'saguaro-trail', label: 'Saguaro Trail', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'arizona-sunset', label: 'Arizona Sunset', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'mountain-hiker', label: 'Mountain Hiker', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'desert-homesteader', label: 'Desert Homesteader', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80' },
]

const BUYER_TYPES = ['Land Buyer & Homesteader', 'Ranch & Horse Property', 'Land Investment & Acreage', 'Country Residential Living', 'Commercial & Development', 'Vacation & Mountain Retreat']
const ACREAGE_OPTIONS = ['Any Acreage', 'Under 5 acres', '5 - 20 acres', '20 - 50 acres', '50 - 100+ acres']
const BUDGET_OPTIONS = [{ label: 'Any Budget', value: 0 }, { label: 'Under $100k', value: 100000 }, { label: 'Under $250k', value: 250000 }, { label: 'Under $500k', value: 500000 }, { label: 'Under $1M', value: 1000000 }]
const COUNTY_OPTIONS = ['Cochise', 'Pima', 'Santa Cruz', 'Graham', 'Pinal', 'Maricopa']
const PROPERTY_TYPES = ['Desert Land', 'Country Homes', 'Equine / Horse Property', 'Investment & Commercial', 'Off-Grid Acreage']
const MUST_HAVE_FEATURES = ['Mountain views', 'Private well / water rights', 'Electric on site / nearby', 'Horses allowed', 'Off-grid solar ready', 'Paved road access', 'Fenced perimeter']

export function getAlertMatches(
  criteria: { counties?: string[]; acreage?: string; maxPrice?: number; propertyTypes?: string[]; mustHaves?: string[] },
  allProperties: Property[]
): Property[] {
  return allProperties.filter((property) => {
    if (criteria.counties && criteria.counties.length > 0) {
      const matchCounty = criteria.counties.some((c) => property.county.toLowerCase().includes(c.replace(' County', '').toLowerCase()))
      if (!matchCounty) return false
    }
    if (criteria.maxPrice && criteria.maxPrice > 0 && property.price > criteria.maxPrice) return false
    if (criteria.acreage && criteria.acreage !== 'Any Acreage') {
      if (criteria.acreage === 'Under 5 acres' && property.acres >= 5) return false
      if (criteria.acreage === '5 - 20 acres' && (property.acres < 5 || property.acres > 20)) return false
      if (criteria.acreage === '20 - 50 acres' && (property.acres < 20 || property.acres > 50)) return false
      if (criteria.acreage === '50 - 100+ acres' && property.acres < 50) return false
    }
    if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
      const matchType = criteria.propertyTypes.some((t) => {
        const clean = t.toLowerCase(); const pt = property.type.toLowerCase()
        if (clean.includes('horse') || clean.includes('equine')) return property.features.some((f) => f.toLowerCase().includes('horse')) || pt.includes('ranch')
        if (clean.includes('desert') || clean.includes('land')) return pt.includes('land') || pt.includes('desert')
        if (clean.includes('country') || clean.includes('home')) return pt.includes('home') || property.title.toLowerCase().includes('home')
        return pt.includes(clean)
      })
      if (!matchType) return false
    }
    if (criteria.mustHaves && criteria.mustHaves.length > 0) {
      const matchFeature = criteria.mustHaves.some((feat) => {
        const keyword = feat.toLowerCase().split(' ')[0]
        return property.features.some((f) => f.toLowerCase().includes(keyword)) || property.description.toLowerCase().includes(keyword)
      })
      if (!matchFeature) return false
    }
    return true
  })
}

export default function UserDashboard({ onNotify, onAuthRequest, onContactBroker }: UserDashboardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser)
  const savedIds = useAppStore((s) => s.savedIds)
  const removeSaved = useAppStore((s) => s.removeSaved)
  const setFilters = useAppStore((s) => s.setFilters)
  const addNotification = useAppStore((s) => s.addNotification)
  const darkMode = useAppStore((s) => s.darkMode)
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode)
  const personalizedAlerts = useAppStore((s) => s.personalizedAlerts || [])
  const addPersonalizedAlert = useAppStore((s) => s.addPersonalizedAlert)
  const updatePersonalizedAlert = useAppStore((s) => s.updatePersonalizedAlert)
  const deletePersonalizedAlert = useAppStore((s) => s.deletePersonalizedAlert)
  const togglePersonalizedAlertActive = useAppStore((s) => s.togglePersonalizedAlertActive)

  // Tab resolution
  const tabParam = searchParams.get('tab')
  let activeTab: DashboardTab = 'overview'
  if (tabParam === 'alerts' || tabParam === 'preferences' || tabParam === 'notifications') activeTab = 'alerts'
  else if (tabParam === 'saved') activeTab = 'saved'
  else if (tabParam === 'settings' || tabParam === 'profile') activeTab = 'settings'
  else if (tabParam === 'security' || tabParam === 'password') activeTab = 'security'

  const handleTabChange = (tab: DashboardTab) => setSearchParams(tab === 'overview' ? {} : { tab })

  // Profile state
  const [name, setName] = useState(currentUser?.name || '')
  const [username, setUsername] = useState(currentUser?.username || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [avatar, setAvatar] = useState(currentUser?.avatar || '')
  const [location, setLocation] = useState(currentUser?.location || 'Southern Arizona')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [buyerType, setBuyerType] = useState(currentUser?.buyerType || currentUser?.preferences?.buyerType || 'Land Buyer & Homesteader')
  const [notificationsPrefs, setNotificationsPrefs] = useState({
    priceDrops: currentUser?.preferences?.notifications?.priceDrops ?? true,
    newListings: currentUser?.preferences?.notifications?.newListings ?? true,
    tourReminders: currentUser?.preferences?.notifications?.tourReminders ?? true,
    marketReports: currentUser?.preferences?.notifications?.marketReports ?? false,
  })

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdStatus, setPwdStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [pwdError, setPwdError] = useState('')

  // UI state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Alert builder state
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertCounties, setAlertCounties] = useState<string[]>(['Cochise'])
  const [alertAcreage, setAlertAcreage] = useState('5 - 20 acres')
  const [alertMaxPrice, setAlertMaxPrice] = useState(250000)
  const [alertPropertyTypes, setAlertPropertyTypes] = useState<string[]>(['Desert Land', 'Country Homes'])
  const [alertMustHaves, setAlertMustHaves] = useState<string[]>(['Mountain views'])
  const [alertFrequency, setAlertFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant')
  const [alertDelivery, setAlertDelivery] = useState({ email: true, sms: true, inApp: true })

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || ''); setUsername(currentUser.username || currentUser.email.split('@')[0] || '')
      setEmail(currentUser.email || ''); setPhone(currentUser.phone || ''); setAvatar(currentUser.avatar || '')
      setLocation(currentUser.location || 'Southern Arizona'); setBio(currentUser.bio || '')
      setBuyerType(currentUser.buyerType || currentUser.preferences?.buyerType || 'Land Buyer & Homesteader')
      setNotificationsPrefs({
        priceDrops: currentUser.preferences?.notifications?.priceDrops ?? true,
        newListings: currentUser.preferences?.notifications?.newListings ?? true,
        tourReminders: currentUser.preferences?.notifications?.tourReminders ?? true,
        marketReports: currentUser.preferences?.notifications?.marketReports ?? false,
      })
    }
  }, [currentUser])

  const savedProperties = properties.filter((p) => savedIds.includes(p.id))
  const liveBuilderMatches = useMemo(() => getAlertMatches({ counties: alertCounties, acreage: alertAcreage, maxPrice: alertMaxPrice, propertyTypes: alertPropertyTypes, mustHaves: alertMustHaves }, properties), [alertCounties, alertAcreage, alertMaxPrice, alertPropertyTypes, alertMustHaves])
  const activeAlerts = personalizedAlerts.filter((a) => a.active)
  const totalMatchesCount = useMemo(() => { const ids = new Set<string>(); activeAlerts.forEach((a) => getAlertMatches(a, properties).forEach((m) => ids.add(m.id))); return ids.size }, [activeAlerts])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { setErrorMessage('Please choose a valid image file.'); return }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas'); const maxDim = 240
        let w = img.width, h = img.height
        if (w > h) { if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim } } else { if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim } }
        canvas.width = w; canvas.height = h; canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(dataUrl); setShowAvatarPicker(false); setErrorMessage('')
        updateCurrentUser({ avatar: dataUrl })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

  const handleSaveProfile = () => {
    setErrorMessage('')
    if (!name.trim()) { setErrorMessage('Full name cannot be empty.'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrorMessage('Please provide a valid email.'); return }
    setSaveStatus('saving')
    setTimeout(() => {
      const prefs: UserPreferences = { ...(currentUser?.preferences || {}), buyerType, notifications: notificationsPrefs }
      updateCurrentUser({ name: name.trim(), username: username.trim().replace(/^@/, ''), email: email.trim(), phone: phone.trim() || undefined, avatar: avatar || undefined, location: location.trim(), bio: bio.trim(), buyerType, preferences: prefs })
      setSaveStatus('saved'); onNotify?.('Profile updated!'); setTimeout(() => setSaveStatus('idle'), 2200)
    }, 350)
  }

  const handleSaveNotifPrefs = () => {
    const prefs: UserPreferences = { ...(currentUser?.preferences || {}), buyerType, notifications: notificationsPrefs }
    updateCurrentUser({ buyerType, preferences: prefs }); setSettingsSaved(true); onNotify?.('Preferences saved!')
    setTimeout(() => setSettingsSaved(false), 2200)
  }

  const handleChangePassword = () => {
    setPwdError('')
    if (!currentPassword) { setPwdError('Enter your current password.'); return }
    if (newPassword.length < 8) { setPwdError('New password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPwdError("New passwords don't match."); return }
    setPwdStatus('saving')
    setTimeout(() => {
      setPwdStatus('saved'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      onNotify?.('Password updated!'); setTimeout(() => setPwdStatus('idle'), 2500)
    }, 700)
  }

  const handleOpenNewAlert = () => {
    setEditingAlertId(null); setAlertTitle(''); setAlertCounties(['Cochise']); setAlertAcreage('5 - 20 acres')
    setAlertMaxPrice(250000); setAlertPropertyTypes(['Desert Land', 'Country Homes']); setAlertMustHaves(['Mountain views'])
    setAlertFrequency('instant'); setAlertDelivery({ email: true, sms: true, inApp: true }); setShowBuilder(true)
  }

  const handleEditAlert = (a: PersonalizedAlert) => {
    setEditingAlertId(a.id); setAlertTitle(a.title); setAlertCounties(a.counties); setAlertAcreage(a.acreage)
    setAlertMaxPrice(a.maxPrice); setAlertPropertyTypes(a.propertyTypes); setAlertMustHaves(a.mustHaves)
    setAlertFrequency(a.frequency); setAlertDelivery(a.delivery); setShowBuilder(true)
  }

  const handleSaveAlert = () => {
    if (!alertTitle.trim()) { setErrorMessage('Alert needs a title.'); return }
    const payload = { title: alertTitle.trim(), counties: alertCounties, acreage: alertAcreage, maxPrice: alertMaxPrice, propertyTypes: alertPropertyTypes, mustHaves: alertMustHaves, frequency: alertFrequency, delivery: alertDelivery }
    if (editingAlertId) { updatePersonalizedAlert(editingAlertId, payload); onNotify?.(`Alert updated`) }
    else { addPersonalizedAlert({ id: `alert-${Date.now()}`, ...payload, active: true, createdAt: 'Active' }); onNotify?.(`Alert created!`) }
    setShowBuilder(false); setEditingAlertId(null); setErrorMessage('')
  }

  const handleViewMatches = (a: PersonalizedAlert) => {
    let minAcres = 0, maxAcres = 500
    if (a.acreage === 'Under 5 acres') maxAcres = 5
    else if (a.acreage === '5 - 20 acres') { minAcres = 5; maxAcres = 20 }
    else if (a.acreage === '20 - 50 acres') { minAcres = 20; maxAcres = 50 }
    else if (a.acreage === '50 - 100+ acres') { minAcres = 50 }
    setFilters({ minPrice: 0, maxPrice: a.maxPrice > 0 ? a.maxPrice : 1000000, minAcres, maxAcres, types: a.propertyTypes.map((t) => t.toLowerCase()), counties: a.counties.map((c) => c.replace(' County', '')), cities: [], features: a.mustHaves })
    onNotify?.(`Filters applied for "${a.title}"`); navigate('/search')
  }

  const handleExport = () => {
    if (!currentUser) return
    const data = { name, username, email, phone, location, buyerType, memberSince: currentUser.memberSince, personalizedAlerts, savedPropertyIds: savedIds, exportedAt: new Date().toISOString() }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = `arizona-profile-${username || 'user'}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); onNotify?.('Profile exported')
  }

  const handleDemoLogin = () => {
    setCurrentUser({ name: 'Sarah Miller', email: 'sarah.miller@example.com', username: 'sarah_miller', phone: '(602) 555-0142', location: 'Tucson, AZ', buyerType: 'Land Buyer & Homesteader', bio: 'Searching for 10-40 acres in Cochise or Santa Cruz County with mountain views and water well potential.', memberSince: 'Nov 2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80', preferences: { buyerType: 'Land Buyer & Homesteader', targetAcreage: '5 - 20 acres', budgetRange: '$100k - $250k', preferredCounties: ['Cochise', 'Pima'], preferredTypes: ['Desert Land', 'Country Homes'], mustHaves: ['Mountain views', 'Off-grid solar ready'], notifications: { priceDrops: true, newListings: true, tourReminders: true, marketReports: false } } })
    onNotify?.('Signed in as Sarah Miller')
  }

  const getPwdStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' }
    let s = 0; if (pwd.length >= 8) s++; if (pwd.length >= 12) s++; if (/[A-Z]/.test(pwd)) s++; if (/[0-9]/.test(pwd)) s++; if (/[^A-Za-z0-9]/.test(pwd)) s++
    if (s <= 1) return { level: 1, label: 'Weak', color: '#dc2626' }
    if (s <= 3) return { level: 2, label: 'Fair', color: '#d97706' }
    if (s <= 4) return { level: 3, label: 'Good', color: '#1f7a54' }
    return { level: 4, label: 'Strong', color: '#059669' }
  }
  const pwdStrength = getPwdStrength(newPassword)

  const initials = currentUser?.name ? currentUser.name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'AZ'

  // ── GUEST ──────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-guest-hero">
          <div className="dashboard-guest-icon-badge"><UserIcon size={32} /></div>
          <h1>My Dashboard</h1>
          <p className="dashboard-guest-sub">Your personalized portal for Southern Arizona land, homesteads, and ranches.</p>
          <div className="dashboard-guest-features-card">
            <h3>Everything in one place</h3>
            <ul>
              <li><CheckCircle2 size={16} className="feature-check" /><span>Personalized alerts for price drops & acreage</span></li>
              <li><CheckCircle2 size={16} className="feature-check" /><span>Save & compare favorite properties</span></li>
              <li><CheckCircle2 size={16} className="feature-check" /><span>Direct line to broker Rick Frank</span></li>
            </ul>
          </div>
          <div className="dashboard-guest-actions">
            <button type="button" className="db-primary-btn" onClick={onAuthRequest}>Sign In or Register <ArrowRight size={16} /></button>
            <button type="button" className="db-secondary-btn" onClick={handleDemoLogin}><Sparkles size={15} /> Try Demo Account</button>
          </div>
        </div>
      </div>
    )
  }

  // ── LOGGED IN ──────────────────────────────────
  const TABS: { id: DashboardTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: 'overview', icon: <LayoutDashboard size={14} />, label: 'Overview' },
    { id: 'saved', icon: <Heart size={14} />, label: 'Saved', badge: savedIds.length || undefined },
    { id: 'alerts', icon: <Bell size={14} />, label: 'Alerts', badge: activeAlerts.length || undefined },
    { id: 'settings', icon: <Settings size={14} />, label: 'Settings' },
    { id: 'security', icon: <ShieldCheck size={14} />, label: 'Security' },
  ]

  return (
    <div className="dashboard-container">

      {/* ── HERO ── */}
      <div className="db-hero">
        <div className="db-hero-bg" />
        <div className="db-hero-content">
          <div className="db-avatar-wrap">
            {avatar ? <img src={avatar} alt={name} className="db-avatar-img" /> : <div className="db-avatar-placeholder">{initials}</div>}
            <button type="button" className="db-avatar-cam" onClick={() => setShowAvatarPicker((v) => !v)} title="Change photo">
              <Camera size={11} />
            </button>
          </div>
          <div className="db-hero-info">
            <div className="db-hero-name-row">
              <h2>{name}</h2>
              <span className="db-verified-pill"><Sparkles size={9} /> Verified</span>
            </div>
            <p className="db-hero-sub"><span>@{username || 'buyer'}</span><span className="db-dot">·</span><MapPin size={11} />{location || 'Southern Arizona'}</p>
            <div className="db-hero-tags">
              <span className="db-hero-tag">{buyerType}</span>
              <span className="db-hero-date">Member since {currentUser.memberSince || 'Today'}</span>
            </div>
          </div>
          <button type="button" className="db-hero-edit" onClick={() => handleTabChange('settings')} title="Edit profile"><Pencil size={13} /></button>
        </div>
      </div>

      {/* ── AVATAR PICKER ── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div className="db-avatar-picker" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="db-picker-head"><h4>Choose Profile Photo</h4><button type="button" className="db-picker-close" onClick={() => setShowAvatarPicker(false)}><X size={15} /></button></div>
            <div className="db-picker-actions">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={handleFileUpload} />
              <button type="button" className="db-upload-btn" onClick={() => fileInputRef.current?.click()}><Upload size={12} /> Upload</button>
              {avatar && <button type="button" className="db-remove-btn" onClick={() => { setAvatar(''); updateCurrentUser({ avatar: undefined }); setShowAvatarPicker(false) }}><Trash2 size={12} /> Remove</button>}
            </div>
            <span className="db-presets-label">Arizona Presets:</span>
            <div className="db-presets-grid">
              {PRESET_AVATARS.map((p) => (
                <button key={p.id} type="button" className={`db-preset-btn ${avatar === p.url ? 'selected' : ''}`} onClick={() => { setAvatar(p.url); updateCurrentUser({ avatar: p.url }); setShowAvatarPicker(false) }}>
                  <img src={p.url} alt={p.label} /><span>{p.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAB BAR ── */}
      <div className="db-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id}
            className={`db-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => handleTabChange(t.id)}>
            {t.icon}<span>{t.label}</span>
            {t.badge !== undefined && <span className="db-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── ERROR BANNER ── */}
      {errorMessage && (
        <div className="db-banner error">
          <AlertCircle size={14} /><span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')}><X size={13} /></button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          OVERVIEW
      ══════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="db-pane">
          {/* Stats */}
          <div className="db-stats">
            {[
              { icon: <Heart size={15} />, value: savedIds.length, label: 'Saved', color: 'red', action: () => handleTabChange('saved') },
              { icon: <BellRing size={15} />, value: activeAlerts.length, label: 'Alerts', color: 'green', action: () => handleTabChange('alerts') },
              { icon: <Search size={15} />, value: totalMatchesCount, label: 'Matches', color: 'blue', action: () => handleTabChange('alerts') },
              { icon: <Sparkles size={15} />, value: 'Rick', label: 'Broker', color: 'amber', action: onContactBroker },
            ].map(({ icon, value, label, color, action }) => (
              <div key={label} className={`db-stat db-stat--${color}`} role="button" tabIndex={0} onClick={action as () => void}>
                <div className="db-stat-icon">{icon}</div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="db-quick-row">
            <button type="button" className="db-quick primary" onClick={() => navigate('/search')}><Search size={14} /> Browse</button>
            <button type="button" className="db-quick" onClick={() => { handleTabChange('alerts'); handleOpenNewAlert() }}><Plus size={14} /> Alert</button>
            <button type="button" className="db-quick" onClick={() => handleTabChange('settings')}><Settings size={14} /> Settings</button>
            <button type="button" className="db-quick" onClick={() => handleTabChange('security')}><ShieldCheck size={14} /> Security</button>
          </div>

          {/* Alerts snapshot */}
          <div className="db-card">
            <div className="db-card-head">
              <div><h4>Listing Alerts</h4><p>Get notified when parcels match your criteria</p></div>
              <button type="button" className="db-link" onClick={() => handleTabChange('alerts')}>Manage ({personalizedAlerts.length}) <ChevronRight size={12} /></button>
            </div>
            {personalizedAlerts.length > 0 ? (
              <div className="db-alert-rows">
                {personalizedAlerts.slice(0, 2).map((a) => {
                  const matches = getAlertMatches(a, properties)
                  return (
                    <div key={a.id} className="db-alert-row">
                      <div className={`db-dot-indicator ${a.active ? 'on' : 'off'}`} />
                      <div className="db-alert-row-info"><strong>{a.title}</strong><span>{a.counties.join(', ')} · {a.acreage}</span></div>
                      <button type="button" className="db-matches-pill" onClick={() => handleViewMatches(a)}>{matches.length} matches <ChevronRight size={11} /></button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="db-empty-mini">
                <Bell size={18} /><p>No alerts yet</p>
                <button type="button" className="db-pill" onClick={() => { handleTabChange('alerts'); handleOpenNewAlert() }}><Plus size={11} /> First alert</button>
              </div>
            )}
          </div>

          {/* Broker */}
          <div className="db-broker">
            <div className="db-broker-av">RF</div>
            <div className="db-broker-body">
              <span className="db-broker-badge">Your Dedicated Broker</span>
              <h4>Rick Frank</h4>
              <p>Southern Arizona Specialist · United Country Real Estate</p>
              <p className="db-broker-quote">"Direct help with boundary lines, water wells & parcel showings."</p>
              <div className="db-broker-btns">
                <a href="tel:+15204033903" className="db-broker-call"><Phone size={12} /> (520) 403-3903</a>
                {onContactBroker && <button type="button" className="db-broker-msg" onClick={onContactBroker}><Mail size={12} /> Message</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SAVED
      ══════════════════════════════════════════ */}
      {activeTab === 'saved' && (
        <div className="db-pane">
          <div className="db-pane-hd">
            <div><h3>Saved Properties</h3><p>{savedProperties.length} shortlisted parcels & homesteads</p></div>
            {savedProperties.length > 0 && <button type="button" className="db-secondary-btn" onClick={() => navigate('/saved')}>Compare <ExternalLink size={12} /></button>}
          </div>
          {savedProperties.length > 0 ? (
            <div className="db-saved-grid">
              {savedProperties.map((p) => (
                <div key={p.id} className="db-prop-card">
                  <div className="db-prop-thumb" onClick={() => navigate(`/property/${p.id}`)}>
                    <img src={p.images[0]} alt={p.title} />
                    <span className="db-price-pill">{formatPrice(p.price)}</span>
                  </div>
                  <div className="db-prop-body">
                    <strong className="db-prop-name" onClick={() => navigate(`/property/${p.id}`)}>{p.title}</strong>
                    <div className="db-prop-meta"><span>{p.acres} ac</span><span>·</span><span>{p.type}</span><span>·</span><span>{p.city}, AZ</span></div>
                    <div className="db-prop-feats">{p.features.slice(0, 2).map((f) => <span key={f} className="db-feat-tag">{f}</span>)}</div>
                    <div className="db-prop-actions">
                      <button type="button" className="db-view-btn" onClick={() => navigate(`/property/${p.id}`)}>View <ArrowRight size={12} /></button>
                      <button type="button" className="db-rm-btn" onClick={() => { removeSaved(p.id); onNotify?.('Removed') }} title="Remove"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty">
              <Heart size={36} /><h3>No saved properties yet</h3>
              <p>Browse Arizona acreage, ranches, and country homes. Tap ♥ to save any listing.</p>
              <button type="button" className="db-primary-btn" onClick={() => navigate('/search')}>Find Properties <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          ALERTS
      ══════════════════════════════════════════ */}
      {activeTab === 'alerts' && (
        <div className="db-pane">
          <div className="db-pane-hd">
            <div><h3>Personalized Alerts</h3><p>Get notified instantly when land matches your criteria.</p></div>
            <button type="button" className="db-primary-btn" onClick={handleOpenNewAlert}><Plus size={13} /> New Alert</button>
          </div>

          {/* Builder */}
          <AnimatePresence>
            {showBuilder && (
              <motion.div className="db-builder" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className="db-builder-hd">
                  <div><span className="db-builder-tag"><BellRing size={11} /> {editingAlertId ? 'Edit Alert' : 'New Alert'}</span><h4>{editingAlertId ? 'Update Criteria' : 'Set Criteria'}</h4></div>
                  <button type="button" className="db-builder-close" onClick={() => { setShowBuilder(false); setEditingAlertId(null) }}><X size={15} /></button>
                </div>
                <div className="db-builder-bd">
                  <div className="db-field"><label htmlFor="alert-name">Alert Name *</label><input id="alert-name" type="text" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} placeholder="e.g. Cochise 10+ Acres with Views" className="db-input" /></div>
                  <div className="db-field"><label>Counties</label><div className="db-chips">{COUNTY_OPTIONS.map((c) => <button key={c} type="button" className={`db-chip ${alertCounties.includes(c) ? 'on' : ''}`} onClick={() => toggleItem(alertCounties, setAlertCounties, c)}>{alertCounties.includes(c) && <Check size={10} />}{c}</button>)}</div></div>
                  <div className="db-field"><label>Acreage</label><div className="db-chips">{ACREAGE_OPTIONS.map((o) => <button key={o} type="button" className={`db-chip ${alertAcreage === o ? 'on' : ''}`} onClick={() => setAlertAcreage(o)}>{o}</button>)}</div></div>
                  <div className="db-field"><label>Max Budget</label><div className="db-chips">{BUDGET_OPTIONS.map((b) => <button key={b.label} type="button" className={`db-chip ${alertMaxPrice === b.value ? 'on' : ''}`} onClick={() => setAlertMaxPrice(b.value)}>{b.label}</button>)}</div></div>
                  <div className="db-field"><label>Property Types</label><div className="db-chips">{PROPERTY_TYPES.map((pt) => <button key={pt} type="button" className={`db-chip ${alertPropertyTypes.includes(pt) ? 'on' : ''}`} onClick={() => toggleItem(alertPropertyTypes, setAlertPropertyTypes, pt)}>{alertPropertyTypes.includes(pt) && <Check size={10} />}{pt}</button>)}</div></div>
                  <div className="db-field"><label>Must-Have Features</label><div className="db-chips">{MUST_HAVE_FEATURES.map((f) => <button key={f} type="button" className={`db-chip ${alertMustHaves.includes(f) ? 'on' : ''}`} onClick={() => toggleItem(alertMustHaves, setAlertMustHaves, f)}>{alertMustHaves.includes(f) && <Check size={10} />}{f}</button>)}</div></div>
                  <div className="db-builder-split">
                    <div className="db-field"><label>Frequency</label><div className="db-chips">
                      <button type="button" className={`db-chip ${alertFrequency === 'instant' ? 'on' : ''}`} onClick={() => setAlertFrequency('instant')}>⚡ Instant</button>
                      <button type="button" className={`db-chip ${alertFrequency === 'daily' ? 'on' : ''}`} onClick={() => setAlertFrequency('daily')}>📅 Daily</button>
                      <button type="button" className={`db-chip ${alertFrequency === 'weekly' ? 'on' : ''}`} onClick={() => setAlertFrequency('weekly')}>📊 Weekly</button>
                    </div></div>
                    <div className="db-field"><label>Channels</label><div className="db-checks">
                      {(['email', 'sms', 'inApp'] as const).map((k) => <label key={k} className="db-check"><input type="checkbox" checked={alertDelivery[k]} onChange={(e) => setAlertDelivery((p) => ({ ...p, [k]: e.target.checked }))} /><span>{{email:'Email',sms:'SMS',inApp:'In-App'}[k]}</span></label>)}
                    </div></div>
                  </div>
                  <div className="db-builder-matches"><Sparkles size={13} /><span><strong>{liveBuilderMatches.length}</strong> matching Arizona parcels with current criteria</span></div>
                  <div className="db-builder-footer">
                    <button type="button" className="db-primary-btn" onClick={handleSaveAlert}><Check size={13} /> {editingAlertId ? 'Update Alert' : 'Save & Activate'}</button>
                    <button type="button" className="db-secondary-btn" onClick={() => { setShowBuilder(false); setEditingAlertId(null) }}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification Subscriptions */}
          <div className="db-card">
            <h4 className="db-card-title">Alert Subscriptions</h4>
            <div className="db-toggle-list">
              {[
                { k: 'priceDrops', label: 'Price Drop Alerts', desc: 'When saved properties reduce in price' },
                { k: 'newListings', label: 'New MLS Matches', desc: 'When new parcels match your profile' },
                { k: 'tourReminders', label: 'Tour Reminders', desc: 'Reminders for scheduled showings' },
                { k: 'marketReports', label: 'Market Reports', desc: 'Weekly Arizona land market updates' },
              ].map(({ k, label, desc }) => (
                <div key={k} className="db-toggle-row">
                  <div className="db-toggle-text"><strong>{label}</strong><span>{desc}</span></div>
                  <button type="button" className={`db-switch ${notificationsPrefs[k as keyof typeof notificationsPrefs] ? 'on' : ''}`}
                    onClick={() => setNotificationsPrefs((p) => ({ ...p, [k]: !p[k as keyof typeof p] }))} aria-label={`Toggle ${label}`}>
                    <span className="db-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
            <div className="db-save-strip">
              <button type="button" className="db-secondary-btn" onClick={handleSaveNotifPrefs}>
                {settingsSaved ? <><Check size={13} /> Saved!</> : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Alert Cards */}
          {personalizedAlerts.length > 0 && (
            <div className="db-alert-cards">
              {personalizedAlerts.map((a) => {
                const matches = getAlertMatches(a, properties)
                return (
                  <div key={a.id} className="db-alert-card">
                    <div className="db-alert-card-top">
                      <div className="db-alert-card-title"><strong>{a.title}</strong><span className={`db-status-badge ${a.active ? 'on' : 'off'}`}>{a.active ? 'Active' : 'Paused'}</span></div>
                      <div className="db-alert-meta"><span>{a.counties.join(', ')}</span><span>·</span><span>{a.acreage}</span><span>·</span><span>{a.maxPrice > 0 ? `Under ${formatPrice(a.maxPrice)}` : 'Any Budget'}</span></div>
                    </div>
                    <div className="db-alert-card-actions">
                      <button type="button" className="db-matches-pill" onClick={() => handleViewMatches(a)}><strong>{matches.length}</strong> matches <ChevronRight size={11} /></button>
                      <button type="button" className="db-icon-btn" onClick={() => handleEditAlert(a)} title="Edit"><Pencil size={12} /></button>
                      <button type="button" className="db-icon-btn" onClick={() => togglePersonalizedAlertActive(a.id)} title={a.active ? 'Pause' : 'Resume'}>{a.active ? <Bell size={12} /> : <BellRing size={12} />}</button>
                      <button type="button" className="db-icon-btn danger" onClick={() => { deletePersonalizedAlert(a.id); onNotify?.('Alert deleted') }} title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {personalizedAlerts.length === 0 && !showBuilder && (
            <div className="db-empty">
              <Bell size={34} /><h3>No alerts yet</h3>
              <p>Set up personalized criteria and get instant notifications when matching Arizona land is listed.</p>
              <button type="button" className="db-primary-btn" onClick={handleOpenNewAlert}><Plus size={14} /> Create First Alert</button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          SETTINGS
      ══════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="db-pane">
          <div className="db-pane-hd">
            <div><h3>Profile Settings</h3><p>Update your contact details, buyer profile, and preferences.</p></div>
          </div>

          {/* Personal Info */}
          <div className="db-settings-block">
            <div className="db-block-label"><UserIcon size={13} /> Personal Information</div>
            <div className="db-form-grid">
              <div className="db-field-grp">
                <label htmlFor="s-name">Full Name *</label>
                <input id="s-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Miller" className="db-input" />
              </div>
              <div className="db-field-grp">
                <label htmlFor="s-username">Username</label>
                <div className="db-prefix-wrap"><span className="db-prefix">@</span><input id="s-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="sarah_miller" className="db-input db-input--prefixed" /></div>
              </div>
              <div className="db-field-grp">
                <label htmlFor="s-email">Email *</label>
                <input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="db-input" />
              </div>
              <div className="db-field-grp">
                <label htmlFor="s-phone">Phone</label>
                <input id="s-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(602) 555-0142" className="db-input" />
              </div>
              <div className="db-field-grp">
                <label htmlFor="s-loc">Location</label>
                <input id="s-loc" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Tucson, AZ" className="db-input" />
              </div>
              <div className="db-field-grp">
                <label htmlFor="s-buyer">Buyer Goal</label>
                <select id="s-buyer" value={buyerType} onChange={(e) => setBuyerType(e.target.value)} className="db-select">{BUYER_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}</select>
              </div>
              <div className="db-field-grp full">
                <label htmlFor="s-bio">About / Search Goals</label>
                <textarea id="s-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about the land or homestead you're seeking..." className="db-input db-textarea" />
              </div>
            </div>
            <div className="db-save-strip">
              <button type="button" className="db-primary-btn" onClick={handleSaveProfile} disabled={saveStatus === 'saving'}>
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? <><Check size={13} /> Profile Saved!</> : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* General Settings */}
          <div className="db-settings-block">
            <div className="db-block-label"><Settings size={13} /> General Settings</div>
            <div className="db-toggle-list">
              <div className="db-toggle-row">
                <div className="db-toggle-text">
                  <strong>Appearance</strong>
                  <span>Toggle between light and dark mode</span>
                </div>
                <button type="button" className={`db-theme-btn ${darkMode ? 'dark' : 'light'}`} onClick={() => { toggleDarkMode(); onNotify?.(darkMode ? 'Light mode' : 'Dark mode') }} aria-label="Toggle theme">
                  <Sun size={13} className="theme-sun" />
                  <span className="db-theme-label">{darkMode ? 'Dark' : 'Light'}</span>
                  <Moon size={13} className="theme-moon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SECURITY
      ══════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="db-pane">
          <div className="db-pane-hd">
            <div><h3>Security</h3><p>Manage your password and account data.</p></div>
          </div>

          {/* Password Change */}
          <div className="db-settings-block">
            <div className="db-block-label"><KeyRound size={13} /> Change Password</div>
            <div className="db-pwd-form">
              {/* Current */}
              <div className="db-field-grp">
                <label htmlFor="p-current">Current Password</label>
                <div className="db-pwd-wrap">
                  <Lock size={13} className="db-pwd-icon" />
                  <input id="p-current" type={showCurrentPwd ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="db-input db-pwd-input" />
                  <button type="button" className="db-eye-btn" onClick={() => setShowCurrentPwd((v) => !v)}>{showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </div>
              {/* New */}
              <div className="db-field-grp">
                <label htmlFor="p-new">New Password</label>
                <div className="db-pwd-wrap">
                  <Lock size={13} className="db-pwd-icon" />
                  <input id="p-new" type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="db-input db-pwd-input" />
                  <button type="button" className="db-eye-btn" onClick={() => setShowNewPwd((v) => !v)}>{showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                {newPassword && (
                  <div className="db-strength">
                    <div className="db-strength-bars">{[1,2,3,4].map((i) => <div key={i} className={`db-strength-bar ${i <= pwdStrength.level ? 'filled' : ''}`} style={i <= pwdStrength.level ? { background: pwdStrength.color } : {}} />)}</div>
                    <span className="db-strength-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                  </div>
                )}
              </div>
              {/* Confirm */}
              <div className="db-field-grp">
                <label htmlFor="p-confirm">Confirm Password</label>
                <div className="db-pwd-wrap">
                  <Lock size={13} className="db-pwd-icon" />
                  <input id="p-confirm" type={showConfirmPwd ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="db-input db-pwd-input" />
                  <button type="button" className="db-eye-btn" onClick={() => setShowConfirmPwd((v) => !v)}>{showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                {confirmPassword && newPassword && (
                  <div className={`db-pwd-match ${confirmPassword === newPassword ? 'ok' : 'err'}`}>
                    {confirmPassword === newPassword ? <><Check size={11} /> Passwords match</> : <><X size={11} /> Don't match</>}
                  </div>
                )}
              </div>
              {pwdError && <div className="db-banner error small"><AlertCircle size={13} />{pwdError}</div>}
              <div className="db-save-strip">
                <button type="button" className="db-primary-btn" onClick={handleChangePassword} disabled={pwdStatus === 'saving'}>
                  {pwdStatus === 'saving' ? 'Updating…' : pwdStatus === 'saved' ? <><Check size={13} /> Password Updated!</> : <><KeyRound size={13} /> Update Password</>}
                </button>
              </div>
            </div>
          </div>

          {/* Account Operations */}
          <div className="db-settings-block">
            <div className="db-block-label"><ShieldCheck size={13} /> Account</div>
            <div className="db-account-ops">
              <div className="db-op-row">
                <div><strong>Export Data</strong><p>Download your profile, alerts & saved IDs as JSON.</p></div>
                <button type="button" className="db-secondary-btn" onClick={handleExport}><Download size={13} /> Export</button>
              </div>
              <div className="db-op-row danger-row">
                <div><strong>Sign Out</strong><p>Sign out from this device.</p></div>
                <button type="button" className="db-signout-btn" onClick={() => { setCurrentUser(null); onNotify?.('Signed out') }}><LogOut size={13} /> Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
