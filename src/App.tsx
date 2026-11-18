import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowDownUp, ArrowLeft, ArrowRight, BadgeCheck, Bell, Building2, Calendar, Camera, Check, ChevronDown, ChevronLeft,
  ChevronRight, Clock3, Compass, DollarSign, Heart, House, LandPlot, Layers,
  Mail, MapPin, Maximize2, MessageCircle, Moon, Mountain, Pause, Phone, Play, RotateCcw, RotateCw, Satellite, Search, Send, Share2, ShieldCheck,
  SlidersHorizontal, Sun, Trees, User as UserIcon, Users, Volume2, VolumeX, X,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { categories, cities, properties } from './data/properties'
import type { Property } from './data/properties'
import PropertyCard, { formatPrice } from './components/PropertyCard'
import SlidableScroller from './components/SlidableScroller'
import LiquidNavbar from './components/LiquidNavbar'
import AuthModal from './components/AuthModal'
import UserDashboard from './components/UserDashboard'
import UserMenuDropdown from './components/UserMenuDropdown'
import ucLogo from './assets/uc-logo.png'
import { getFilteredProperties, initialFilters, propertyMatchesType, useAppStore } from './store/useAppStore'
import type { AppNotification, Filters } from './store/useAppStore'
import { HeroCarousel, ContentSheet } from './components/hero'
import { LAST_VIEWED_STORAGE_KEY } from './data/userActivity'
import './App.css'
const counties = ['Cochise', 'Pima', 'Graham', 'Santa Cruz']
const featureOptions = ['Well', 'Gated community', 'Horses allowed', 'Mountain views', 'Near National Forest', 'Commercial potential', 'Owner financing']

const partnerLogos = [
  { name: 'United Country Real Estate', src: `${import.meta.env.BASE_URL}partners/UnitedCountry.png` },
  { name: 'John Deere', src: `${import.meta.env.BASE_URL}partners/johndeere.png` },
  { name: 'Land id', src: `${import.meta.env.BASE_URL}partners/landid.png` },
  { name: 'UC Hunting Properties', src: `${import.meta.env.BASE_URL}partners/uchuntingproperties.png` },
  { name: 'PotlatchDeltic', src: `${import.meta.env.BASE_URL}partners/potlatchdeltic.png` },
  { name: 'Mineral Marketing', src: `${import.meta.env.BASE_URL}partners/MineralMarketing.png` },
  { name: 'Global Auction Guide', src: `${import.meta.env.BASE_URL}partners/globalauctionguide.png` },
  { name: 'HiBid', src: `${import.meta.env.BASE_URL}partners/hibid.png` },
  { name: 'ReScore', src: `${import.meta.env.BASE_URL}partners/rescore.png` },
  { name: 'REALTORS Land Institute', src: `${import.meta.env.BASE_URL}partners/RLI.png` },
  { name: 'Ducks Unlimited', src: `${import.meta.env.BASE_URL}partners/DucksUnlimited.png` },
  { name: 'Rocky Mountain Elk Foundation', src: `${import.meta.env.BASE_URL}partners/RMEF.png` },
  { name: 'infoUSA', src: `${import.meta.env.BASE_URL}partners/infoUSA.png` },
]

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState('Featured')
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [intro, setIntro] = useState(false)
  const darkMode = useAppStore((state) => state.darkMode)
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode)

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dark') === '1') {
      useAppStore.getState().setDarkMode(true)
    }
  }, [])
  const currentUser = useAppStore((state) => state.currentUser)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifications = useAppStore((state) => state.notifications)
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const [islandExpanded, setIslandExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${displayHours}:${displayMinutes}`
  })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const displayHours = hours % 12 || 12
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes
      setCurrentTime(`${displayHours}:${displayMinutes}`)
    }
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (value) useAppStore.getState().addRecentSearch(value)
  }, [])
  const handleBrowsePick = useCallback((category: string, value: string) => {
    const filters = { ...initialFilters }
    const kind = category.toLowerCase()
    if (kind === 'type' || categories.some((item) => item.toLowerCase() === kind)) {
      const matchedCategory = categories.find((item) => item.toLowerCase() === value.toLowerCase()) || value
      filters.types = [matchedCategory]
    } else if (kind === 'county') {
      filters.counties = [value.replace(/ County$/i, '')]
    } else if (kind === 'city') {
      filters.cities = [value]
    } else if (kind === 'price') {
      const ranges: Record<string, [number, number]> = {
        'Under $50,000': [0, 50000],
        '$50,000 – $100,000': [50000, 100000],
        '$100,000 – $150,000': [100000, 150000],
        '$150,000+': [150000, initialFilters.maxPrice],
      }
      const range = ranges[value]
      if (range) [filters.minPrice, filters.maxPrice] = range
    } else if (kind === 'state') {
      // resets to initial filters (all properties in Arizona)
    }
    useAppStore.getState().setFilters(filters)
    setSearch('')
    navigate('/search')
  }, [navigate])
  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const mainEl = document.querySelector('.screen-main')
    if (mainEl) mainEl.scrollTop = 0
    setProfileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#121b22')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1f7a54')
    }
  }, [darkMode])

  const handleToggleTheme = useCallback(() => {
    toggleDarkMode()
    notify(darkMode ? 'Switched to light mode' : 'Switched to dark mode')
  }, [darkMode, notify, toggleDarkMode])

  return (
    <div className={`app-root ${darkMode ? 'dark-mode' : ''}`}>
      <div className="phone-wrapper">
        <div className="phone-btn phone-btn--action" aria-hidden="true" />
        <div className="phone-btn phone-btn--vol-up" aria-hidden="true" />
        <div className="phone-btn phone-btn--vol-down" aria-hidden="true" />
        <div className="phone-btn phone-btn--power" aria-hidden="true" />
        <div className="phone-speaker" aria-hidden="true" />

        <div className="phone-frame">
          <div className="phone-status-bar">
            <span className="status-time">{currentTime}</span>
            <div
              className={`dynamic-island ${islandExpanded ? 'expanded' : ''}`}
              onClick={() => setIslandExpanded((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label="Dynamic Island"
              title="Dynamic Island"
            >
              {islandExpanded && (
                <div className="island-content">
                  <span className="island-pill-title">🌵 Arizona Life</span>
                  <span className="island-pill-sub">Pearce, AZ</span>
                </div>
              )}
              <div className="island-compact">
                <span className="island-camera" />
                <span className="island-sensor" />
              </div>
            </div>
            <div className="status-icons">
              <svg className="status-icon" width="16" height="10" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
                <rect x="0" y="7.5" width="2.5" height="3.5" rx="0.8" />
                <rect x="4" y="5" width="2.5" height="6" rx="0.8" />
                <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.8" />
                <rect x="12" y="0" width="2.5" height="11" rx="0.8" />
              </svg>
              <svg className="status-icon" width="15" height="10" viewBox="0 0 15 11" fill="currentColor" aria-hidden="true">
                <path d="M7.5 10.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zm3.3-3.4a4.8 4.8 0 00-6.6 0 .8.8 0 01-1.1-1.1 6.4 6.4 0 018.8 0 .8.8 0 11-1.1 1.1zm2.5-2.6a8.2 8.2 0 00-11.6 0 .8.8 0 01-1.1-1.1 9.8 9.8 0 0113.8 0 .8.8 0 01-1.1 1.1z" />
              </svg>
              <svg className="status-icon" width="22" height="10" viewBox="0 0 24 11" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="1" />
                <rect x="2.5" y="2.5" width="14" height="6" rx="1.5" fill="currentColor" />
                <path d="M22 3.5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1v-4z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
          </div>

          <header className="appbar">
          <Link className="brand-lockup" to="/" aria-label="Arizona Life Homes and Land home">
            <img src={ucLogo} alt="United Country Real Estate" className="uc-mark" /><span>|</span>
            <div className="brand-copy"><strong>ARIZONA LIFE</strong><span>HOMES & LAND</span></div>
          </Link>
          <div className="appbar-actions">
            <button
              className={`contact-trigger ${location.pathname.startsWith('/contact') ? 'is-active' : ''}`}
              type="button"
              aria-label="Contact"
              title="Contact"
              onClick={() => navigate('/contact')}
            >
              <Phone size={19} />
            </button>
            <button
              className="theme-trigger"
              type="button"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={handleToggleTheme}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={darkMode ? 'dark' : 'light'}
                  className="theme-icon-wrap"
                  initial={{ rotate: -70, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 70, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button className="notification-trigger" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => setNotificationsOpen(true)}>
              <Bell size={19} />
              {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className={`user-trigger ${profileMenuOpen ? 'is-active' : ''}`}
                aria-label={currentUser ? `Account menu (${currentUser.name})` : 'Sign in or account menu'}
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                {currentUser ? (
                  currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-badge-img" />
                  ) : (
                    <span className="user-avatar-badge">
                      {currentUser.name.slice(0, 1).toUpperCase()}
                    </span>
                  )
                ) : (
                  <UserIcon size={19} />
                )}
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <UserMenuDropdown
                    currentUser={currentUser}
                    savedCount={useAppStore.getState().savedIds.length}
                    darkMode={darkMode}
                    onClose={() => setProfileMenuOpen(false)}
                    onNavigate={(path) => {
                      setProfileMenuOpen(false)
                      navigate(path)
                    }}
                    onOpenAuth={() => {
                      setProfileMenuOpen(false)
                      setAuthOpen(true)
                    }}
                    onToggleTheme={handleToggleTheme}
                    onContactBroker={() => {
                      setProfileMenuOpen(false)
                      setInquiryOpen(true)
                    }}
                    onSignOut={() => {
                      setProfileMenuOpen(false)
                      useAppStore.getState().setCurrentUser(null)
                      notify('Signed out successfully')
                    }}
                    onDemoSignIn={() => {
                      setProfileMenuOpen(false)
                      useAppStore.getState().setCurrentUser({
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
                      })
                      notify('Welcome, Sarah Miller!')
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="screen-main" key={location.pathname}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} className="route-motion" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              <Routes>
                <Route path="/" element={<Home onNotify={notify} search={search} onSearch={handleSearch} onFilters={() => setFiltersOpen(true)} sort={sort} onSortOpen={() => setSortOpen(true)} />} />
                <Route path="/search" element={<Results search={search} onSearch={handleSearch} onFilters={() => setFiltersOpen(true)} onNotify={notify} sort={sort} onSortOpen={() => setSortOpen(true)} />} />
                <Route path="/saved" element={<Saved onNotify={notify} />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/dashboard" element={<UserDashboard onNotify={notify} onAuthRequest={() => setAuthOpen(true)} onContactBroker={() => setInquiryOpen(true)} />} />
                <Route path="/profile" element={<UserDashboard onNotify={notify} onAuthRequest={() => setAuthOpen(true)} onContactBroker={() => setInquiryOpen(true)} />} />
                <Route path="/contact" element={<Contact onNotify={notify} />} />
                <Route path="/property/:id" element={<PropertyDetail onNotify={notify} onMessage={() => setInquiryOpen(true)} />} />
                <Route path="/browse/:category" element={<Browse onPick={handleBrowsePick} />} />
                <Route path="/info" element={<Info />} />
                <Route path="*" element={<Home onNotify={notify} search={search} onSearch={handleSearch} onFilters={() => setFiltersOpen(true)} sort={sort} onSortOpen={() => setSortOpen(true)} />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <LiquidNavbar />
        <div className="home-indicator"><span /></div>
        <AnimatePresence>{drawer && <Drawer onClose={() => setDrawer(false)} onDark={handleToggleTheme} darkMode={darkMode} onAuth={() => setAuthOpen(true)} />}</AnimatePresence>
        <AnimatePresence>{notificationsOpen && <NotificationSheet notifications={notifications} onClose={() => setNotificationsOpen(false)} onOpen={(notification) => {
          useAppStore.getState().markNotificationRead(notification.id)
          setNotificationsOpen(false)
          if (notification.propertyId) navigate(`/property/${notification.propertyId}`)
          else navigate('/search')
        }} />}</AnimatePresence>
        <AnimatePresence>{filtersOpen && <FilterSheet onClose={() => setFiltersOpen(false)} onApply={() => { setFiltersOpen(false); navigate('/search'); notify('Filters applied') }} />}</AnimatePresence>
        <AnimatePresence>{sortOpen && <BottomSheet title="Sort properties" onClose={() => setSortOpen(false)}><div className="sort-options">{['Featured', 'Price: low to high', 'Price: high to low', 'Acreage', 'Newest'].map((option) => <button key={option} className={sort === option ? 'chosen' : ''} onClick={() => { setSort(option); setSortOpen(false); if (location.pathname !== '/search') navigate('/search'); }}>{option}{sort === option && <Check size={17} />}</button>)}</div></BottomSheet>}</AnimatePresence>
        <AnimatePresence>{inquiryOpen && <InquirySheet onClose={() => setInquiryOpen(false)} onSend={() => { setInquiryOpen(false); notify('Thanks! Rick will be in touch shortly.') }} />}</AnimatePresence>
        <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Check size={16} />{toast}</motion.div>}</AnimatePresence>
        <AnimatePresence>{authOpen && <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={(user) => notify(`Welcome back, ${user.name}!`)} />}</AnimatePresence>
        <AnimatePresence>{intro && <Onboarding onDone={() => { localStorage.setItem('az-intro-done', 'yes'); setIntro(false) }} />}</AnimatePresence>
      </div>
    </div>
  </div>
  )
}



function Home({
  onNotify,
  search,
  onSearch,
  onFilters,
  sort,
  onSortOpen,
}: {
  onNotify?: (message: string) => void
  search: string
  onSearch: (value: string) => void
  onFilters?: () => void
  sort?: string
  onSortOpen?: () => void
}) {
  const navigate = useNavigate()
  const featuredTypes = useMemo(() => [
    {
      name: 'Land',
      category: 'Land',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      icon: Trees,
      count: properties.filter((p) => p.type === 'Land').length,
    },
    {
      name: 'Desert',
      category: 'Desert',
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=600&q=80',
      icon: Sun,
      count: properties.filter((p) => p.type === 'Desert').length,
    },
    {
      name: 'Mountain',
      category: 'Mountain',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      icon: Mountain,
      count: properties.filter((p) => p.type === 'Mountain').length,
    },
    {
      name: 'Country Homes',
      category: 'Country Homes',
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80',
      icon: House,
      count: properties.filter((p) => p.type.toLowerCase().includes('home') || p.type === 'Residential').length || 4,
    },
  ], [])

  return (
    <div className="home-screen">
      {/* Change 1 & 2: Inset rounded swipeable cards & native controls */}
      <HeroCarousel onNotify={onNotify} />

      {/* Change 4 & 5: Visual bottom-sheet overlap containing stat strip, continue card, and featured content */}
      <ContentSheet
        onNotify={onNotify}
        search={search}
        onSearch={onSearch}
        onFilters={onFilters}
        sort={sort}
        onSortOpen={onSortOpen}
      >
        <section className="section-block featured-section">
          <SectionHeading kicker="Serving Southern  Arizona Counties" title="Featured Properties" action="View all" onAction={() => navigate('/search')} />
          <SlidableScroller>
            {properties.slice(0, 5).map((property) => <PropertyCard key={property.id} property={property} compact />)}
            <button className="see-all-card" onClick={() => navigate('/search')}>
              <span><ArrowRight /></span>
              <strong>See all<br />properties</strong>
              <small>12 places to explore</small>
            </button>
          </SlidableScroller>
        </section>

        <section className="promise-card">
          <div className="promise-icon"><Compass size={21} /></div>
          <div>
            <span className="welcome-kicker">ROOTED HERE. READY TO HELP.</span>
            <h3>Local knowledge.<br />A personal touch.</h3>
            <p>We know this land, these communities, and what makes southern Arizona feel like home.</p>
            <button onClick={() => navigate('/contact')}>Meet our local broker <ArrowRight size={15} /></button>
          </div>
        </section>
       
        <section className="partner-section">
          <h3>Our trusted partners</h3>
          <div className="partner-marquee">
            <div className="partner-track">
              <div className="partner-track-group">
                {partnerLogos.map((partner, index) => (
                  <div className="partner-logo-item" key={`${partner.name}-${index}`} title={partner.name}>
                    <img src={partner.src} alt={partner.name} className="partner-logo-img" loading="lazy" />
                  </div>
                ))}
              </div>
              <div className="partner-track-group" aria-hidden="true">
                {partnerLogos.map((partner, index) => (
                  <div className="partner-logo-item" key={`${partner.name}-dup-${index}`} title={partner.name}>
                    <img src={partner.src} alt="" className="partner-logo-img" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-block type-section">
          <SectionHeading kicker="MAKE IT YOUR OWN" title="Find your kind of place" />
          <SlidableScroller className="type-scroller" ariaLabel="Property types slider">
            {featuredTypes.map((item) => (
              <button
                key={item.name}
                className="type-card-unit"
                onClick={() => navigate(`/browse/${encodeURIComponent(item.category.toLowerCase())}`)}
              >
                <div className="type-square-card">
                  <img src={item.image} alt={item.name} className="type-square-img" loading="lazy" />
                </div>
                <div className="type-card-info">
                  <span className="type-card-title">{item.name}</span>
                  <span className="type-card-count">{item.count} places</span>
                </div>
              </button>
            ))}
            <button
              className="type-card-unit type-browse-all-unit"
              onClick={() => navigate('/browse/type')}
              aria-label="Browse all property types"
            >
              <div className="type-circle-container">
                <div className="type-circle-button">
                  <ChevronRight size={18} />
                </div>
              </div>
              <div className="type-card-info">
                <span className="type-card-count">Explore all</span>
              </div>
            </button>
          </SlidableScroller>
          <div className="browse-shortcuts" aria-label="More ways to browse">
            {[['State', 'state'], ['County', 'county'], ['City', 'city'], ['Price', 'price']].map(([label, path]) => <button key={path} onClick={() => navigate(`/browse/${path}`)}>By {label}</button>)}
          </div>
        </section>
      </ContentSheet>
    </div>
  )
}

function SectionHeading({ kicker, title, action, onAction, children }: { kicker?: string; title: string; action?: string; onAction?: () => void; children?: React.ReactNode }) {
  return <div className="section-heading">{kicker && <span className="welcome-kicker">{kicker}</span>}<h2>{title}</h2><div className="heading-underline" />{action && <button className="heading-action" onClick={onAction}>{action} <ArrowRight size={14} /></button>}{children}</div>
}

function Results({
  search,
  onSearch,
  onFilters,
  onNotify,
  sort,
  onSortOpen,
}: {
  search: string
  onSearch: (value: string) => void
  onFilters: () => void
  onNotify: (value: string) => void
  sort: string
  onSortOpen: () => void
}) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'list' | 'grid' | 'map'>('list')
  const filters = useAppStore((state) => state.filters)
  const hasActiveFilters = Boolean(
    filters.types.length ||
    filters.counties.length ||
    filters.cities.length ||
    filters.features.length ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000000 ||
    filters.minAcres > 0 ||
    filters.maxAcres < 500
  )
  const allFiltered = useMemo(() => {
    const query = search.toLowerCase()
    const result = getFilteredProperties(properties, filters).filter((property) => !query || [property.title, property.city, property.county, property.address, property.mls, property.type].some((text) => text.toLowerCase().includes(query)))
    if (sort === 'Price: low to high') result.sort((a, b) => a.price - b.price)
    if (sort === 'Price: high to low') result.sort((a, b) => b.price - a.price)
    if (sort === 'Acreage') result.sort((a, b) => b.acres - a.acres)
    if (sort === 'Newest') result.sort((a, b) => properties.indexOf(b) - properties.indexOf(a))
    return result
  }, [filters, search, sort])

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return <div className="page-screen results-screen">
    <div className="results-nav">
      <button
        type="button"
        className="results-back-btn"
        onClick={handleBack}
        aria-label="Back"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>
      <span className="results-nav-title">SEARCH PROPERTIES</span>
      <div className="results-nav-spacer" aria-hidden="true" />
    </div>
    <SectionHeading title="Find your place">
      <div className="search-bar-row">
        <div className="heading-searchbar">
          <span className="heading-search-icon" aria-hidden="true"><Search size={16} /></span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search city, county, title..."
            aria-label="Search properties"
          />
          {search && (
            <button
              type="button"
              className="heading-search-clear"
              aria-label="Clear search"
              onClick={() => {
                onSearch('')
                onNotify('Search cleared')
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="search-action-btn search-featured-btn"
          onClick={onSortOpen}
          aria-label={`Sort properties, currently: ${sort}`}
          title={`Sort properties: ${sort}`}
        >
          <ArrowDownUp size={16} />
        </button>

        <button
          type="button"
          className={`search-action-btn search-filter-btn ${hasActiveFilters ? 'is-filtered' : ''}`}
          onClick={onFilters}
          aria-label="Filter properties"
          title="Filter properties"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <div className="search-quick-tags" aria-label="Popular search suggestions">
        <span>Popular:</span>
        {['Benson', 'Willcox', 'Pearce', 'Cochise', 'Ranch'].map((tag) => (
          <button
            type="button"
            key={tag}
            className={search.toLowerCase() === tag.toLowerCase() ? 'active' : ''}
            onClick={() => onSearch(search.toLowerCase() === tag.toLowerCase() ? '' : tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </SectionHeading>
    <div className="results-summary"><div><strong>{allFiltered.length}</strong><span> places to explore</span></div><button onClick={onSortOpen}><ArrowDownUp size={15} /> {sort}</button></div>
    <div className="results-toolbar"><div className="view-toggle">{(['list', 'grid', 'map'] as const).map((item) => <button className={mode === item ? 'selected' : ''} key={item} onClick={() => setMode(item)}>{item === 'list' ? 'List' : item === 'grid' ? 'Grid' : 'Map'}</button>)}</div><button className="filter-toolbar" onClick={onFilters}><SlidersHorizontal size={16} /> Filters</button></div>
    {search && <div className="active-search">Showing results for <strong>{search}</strong><button aria-label="Clear search" onClick={() => { onSearch(''); onNotify('Search cleared') }}><X size={14} /></button></div>}
    {mode === 'map' ? <ResultsMap listings={allFiltered} /> : allFiltered.length ? <div className={mode === 'grid' ? 'results-grid' : 'results-list'}>{allFiltered.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <EmptyState title="No places found just yet" text="Try widening your search or removing a filter to discover more Arizona land." action="Clear filters" onAction={() => { useAppStore.getState().setFilters(initialFilters); onSearch('') }} />}
    <div className="results-footer">You’re all caught up <span>·</span> {allFiltered.length} of {properties.length} places</div>
  </div>
}

function EmptyState({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><div className="empty-illustration"><Mountain size={40} /><SunsetIcon /></div><h3>{title}</h3><p>{text}</p>{action && <button className="primary-button" onClick={onAction}>{action}</button>}</div>
}
function SunsetIcon() { return <span className="sunset-icon">☼</span> }

function ResultsMap({ listings }: { listings: Property[] }) {
  const [selected, setSelected] = useState<Property | null>(null)
  const [zoom, setZoom] = useState(8)
  const mapLayer = useAppStore((state) => state.mapLayer)
  const setMapLayer = useAppStore((state) => state.setMapLayer)
  const navigate = useNavigate()
  return (
    <div className="results-map-wrap">
      <MapCanvas listings={listings} onSelect={setSelected} zoom={zoom} />
      <MapLayerToggle value={mapLayer} onChange={setMapLayer} />
      <div className="map-zoom-controls">
        <button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(16, value + 1))}>+</button>
        <button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(4, value - 1))}>−</button>
      </div>
      {selected && (
        <div className="map-preview">
          <button className="preview-close" onClick={() => setSelected(null)} aria-label="Close property preview">
            <X size={15} />
          </button>
          <button className="map-preview-main" onClick={() => navigate(`/property/${selected.id}`)}>
            <img src={selected.images[0]} alt="" />
            <span>
              <b>{formatPrice(selected.price)}</b>
              <strong>{selected.title}</strong>
              <small>{selected.acres} acres · {selected.city}, AZ{selected.video ? ' · ▶ Video' : ''}</small>
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

function FilterSheet({ onClose, onApply }: { onClose: () => void; onApply: () => void }) {
  const stored = useAppStore((state) => state.filters)
  const [filters, setFilters] = useState<Filters>(stored)
  const matched = getFilteredProperties(properties, filters).length
  const toggle = (key: 'types' | 'counties' | 'cities' | 'features', value: string) => setFilters((state) => ({ ...state, [key]: state[key].includes(value) ? state[key].filter((item) => item !== value) : [...state[key], value] }))
  const reset = () => setFilters(initialFilters)
  return <div className="overlay-backdrop" onClick={onClose}><motion.section className="filter-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()}>
    <motion.div className="sheet-handle" drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.y > 60) onClose() }} /><div className="sheet-header"><div><span className="welcome-kicker">MAKE IT YOURS</span><h2>Filters</h2></div><button className="round-close" onClick={onClose} aria-label="Close filters"><X size={19} /></button></div>
    <div className="filter-scroll">
      <FilterGroup title="Price range" note={`${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)}`} icon={<DollarSign size={17} />}><div className="range-pair"><label>Min price<select value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: Number(event.target.value) })}>{[0, 50000, 75000, 100000, 150000, 250000].map((n) => <option value={n} key={n}>{n ? formatPrice(n) : 'No minimum'}</option>)}</select></label><span>—</span><label>Max price<select value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })}>{[50000, 75000, 100000, 150000, 250000, 500000].map((n) => <option value={n} key={n}>{formatPrice(n)}</option>)}</select></label></div></FilterGroup>
      <FilterGroup title="Acreage" note={`${filters.minAcres} – ${filters.maxAcres}+ acres`} icon={<LandPlot size={17} />}><div className="range-pair"><label>From<input type="number" value={filters.minAcres} min="0" onChange={(event) => setFilters({ ...filters, minAcres: Number(event.target.value) })} /></label><span>—</span><label>To<input type="number" value={filters.maxAcres} min="0" onChange={(event) => setFilters({ ...filters, maxAcres: Number(event.target.value) })} /></label></div></FilterGroup>
      <FilterGroup title="Property type" icon={<House size={17} />}><div className="filter-chips">{categories.map((item) => <button key={item} className={filters.types.includes(item) ? 'selected' : ''} onClick={() => toggle('types', item)}>{item}</button>)}</div></FilterGroup>
      <FilterGroup title="County" icon={<MapPin size={17} />}><div className="filter-chips">{counties.map((item) => <button key={item} className={filters.counties.includes(item) ? 'selected' : ''} onClick={() => toggle('counties', item)}>{item}</button>)}</div></FilterGroup>
      <FilterGroup title="City" icon={<Building2 size={17} />}><div className="filter-chips">{cities.map((item) => <button key={item} className={filters.cities.includes(item) ? 'selected' : ''} onClick={() => toggle('cities', item)}>{item}</button>)}</div></FilterGroup>
      <FilterGroup title="Features" icon={<BadgeCheck size={17} />}><div className="feature-toggles">{featureOptions.map((item) => <button key={item} className="feature-toggle" onClick={() => toggle('features', item)}><span>{item}</span><span className={`switch ${filters.features.includes(item) ? 'on' : ''}`}><i /></span></button>)}</div></FilterGroup>
    </div>
    <div className="filter-footer"><button className="text-button" onClick={reset}>Reset all</button><button className="primary-button" onClick={() => { useAppStore.getState().setFilters(filters); onApply() }}>Show {matched} {matched === 1 ? 'place' : 'places'} <ArrowRight size={16} /></button></div>
  </motion.section></div>
}

function FilterGroup({ title, note, icon, children }: { title: string; note?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="filter-group"><div className="filter-group-heading"><span className="filter-icon">{icon}</span><div><strong>{title}</strong>{note && <small>{note}</small>}</div></div>{children}</section>
}

function BottomSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="overlay-backdrop" onClick={onClose}><motion.section className="bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()}><motion.div className="sheet-handle" drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.y > 60) onClose() }} /><div className="sheet-header"><h2>{title}</h2><button className="round-close" onClick={onClose}><X size={18} /></button></div>{children}</motion.section></div>
}

function NotificationSheet({ notifications, onClose, onOpen }: { notifications: AppNotification[]; onClose: () => void; onOpen: (notification: AppNotification) => void }) {
  const markAllRead = useAppStore((state) => state.markAllNotificationsRead)
  const unreadCount = notifications.filter((notification) => !notification.read).length
  return <BottomSheet title="Notifications" onClose={onClose}>
    <div className="notification-sheet-top">
      <span>{unreadCount ? `${unreadCount} new update${unreadCount === 1 ? '' : 's'}` : 'You’re all caught up'}</span>
      {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
    </div>
    <div className="notification-list">
      {notifications.length ? notifications.map((notification) => <button key={notification.id} className={`notification-item ${notification.read ? 'is-read' : 'is-unread'}`} onClick={() => onOpen(notification)}>
        <span className="notification-item-icon">{notification.propertyId ? <MapPin size={17} /> : <Bell size={17} />}</span>
        <span className="notification-item-copy"><span><strong>{notification.title}</strong><time>{notification.date}</time></span><small>{notification.message}</small></span>
        {!notification.read && <i className="notification-unread-dot" aria-label="Unread" />}
      </button>) : <div className="notification-empty"><Bell size={22} /><strong>No notifications yet</strong><span>Updates about Arizona properties will show up here.</span></div>}
    </div>
  </BottomSheet>
}

function CompareSheet({ listings, onClose }: { listings: Property[]; onClose: () => void }) {
  const rows: [string, (property: Property) => string][] = [
    ['Price', (property) => formatPrice(property.price)],
    ['Acreage', (property) => `${property.acres} ac`],
    ['Property type', (property) => property.type],
    ['Location', (property) => `${property.city}, ${property.county} County`],
    ['MLS #', (property) => property.mls],
    ['Highlights', (property) => property.features.slice(0, 3).join(', ')],
  ]
  return <BottomSheet title="Compare places" onClose={onClose}><div className="comparison-grid">{listings.map((property) => <div key={property.id}><img src={property.images[0]} alt="" /><strong>{property.title}</strong></div>)}</div><div className="comparison-rows">{rows.map(([label, value]) => <div key={label}><strong>{label}</strong>{listings.map((property) => <span key={property.id}>{value(property)}</span>)}</div>)}</div></BottomSheet>
}

function Saved({ onNotify }: { onNotify: (value: string) => void }) {
  const navigate = useNavigate()
  const savedIds = useAppStore((state) => state.savedIds)
  const saved = properties.filter((property) => savedIds.includes(property.id))
  const [compare, setCompare] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  return <div className="page-screen">
    <PageHeader title="Saved places" />
    {saved.length ? <><div className="saved-toolbar"><span>{saved.length} {saved.length === 1 ? 'place' : 'places'} saved<small>Swipe left to remove</small></span><button onClick={() => { setCompare((value) => !value); setSelected([]) }}>{compare ? 'Cancel compare' : 'Compare places'}</button></div>{compare && <div className="compare-banner">Select up to 2 places to compare. <button disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>Compare {selected.length}/2</button></div>}<div className="results-list">{saved.map((property) => <div className="saved-item" key={property.id} onTouchStart={(event) => { event.currentTarget.dataset.startX = String(event.touches[0].clientX) }} onTouchEnd={(event) => { const startX = Number(event.currentTarget.dataset.startX || 0); if (startX - event.changedTouches[0].clientX > 80) { useAppStore.getState().removeSaved(property.id); onNotify('Removed from saved places') } }}>{compare && <button aria-label={`Select ${property.title}`} className={`compare-select ${selected.includes(property.id) ? 'checked' : ''}`} onClick={() => setSelected((value) => value.includes(property.id) ? value.filter((id) => id !== property.id) : value.length < 2 ? [...value, property.id] : value)}>{selected.includes(property.id) && <Check size={13} />}</button>}<PropertyCard property={property} /></div>)}</div><AnimatePresence>{compareOpen && <CompareSheet listings={properties.filter((property) => selected.includes(property.id))} onClose={() => setCompareOpen(false)} />}</AnimatePresence></> : <EmptyState title="Your next chapter starts here" text="Tap the heart on any property to save it to your shortlist." action="Explore properties" onAction={() => navigate('/search')} />}
    <div className="save-tip"><Heart size={16} /> Your saved places stay right here on this device.</div>
  </div>
}

function MapScreen() {
  const [selected, setSelected] = useState<Property | null>(null)
  const navigate = useNavigate()
  const [zoom, setZoom] = useState(8)
  const [center, setCenter] = useState<[number, number]>([31.92, -110.1])
  const [locationMessage, setLocationMessage] = useState('')
  const mapLayer = useAppStore((state) => state.mapLayer)
  const setMapLayer = useAppStore((state) => state.setMapLayer)
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not available on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCenter([coords.latitude, coords.longitude]); setZoom(12); setLocationMessage('') },
      () => setLocationMessage('Could not access your location. Check your browser permissions.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }
  return <div className="map-screen"><div className="map-screen-heading"><div><span className="welcome-kicker">A DIFFERENT PERSPECTIVE</span><h1>Map search</h1></div><button className="round-control" aria-label="Find my location" onClick={locate}><MapPin size={19} /></button></div>
    <div className="map-canvas-wrap">
      <MapCanvas listings={properties} onSelect={setSelected} center={center} zoom={zoom} />
      <MapLayerToggle value={mapLayer} onChange={setMapLayer} />
      <div className="map-zoom-controls"><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(16, value + 1))}>+</button><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(4, value - 1))}>−</button></div>
      {locationMessage && <div className="map-location-message" role="status">{locationMessage}</div>}
      {selected && <div className="map-preview"><button className="preview-close" onClick={() => setSelected(null)}><X size={15} /></button><button className="map-preview-main" onClick={() => navigate(`/property/${selected.id}`)}><img src={selected.images[0]} alt="" /><span><b>{formatPrice(selected.price)}</b><strong>{selected.title}</strong><small>{selected.acres} acres · {selected.city}, AZ{selected.video ? ' · ▶ Video' : ''}</small></span><ChevronRight size={18} /></button></div>}
    </div><div className="map-bottom-info"><div><strong>Southern Arizona</strong><span>{properties.length} places in this area</span></div><button onClick={locate}><MapPin size={14} /> My location</button><button onClick={() => navigate('/search')}>View list <ArrowRight size={15} /></button></div>
  </div>
}

function MapLayerToggle({
  value,
  onChange,
  className = '',
}: {
  value: 'street' | 'satellite'
  onChange: (layer: 'street' | 'satellite') => void
  className?: string
}) {
  return (
    <div className={`map-layer-toggle ${className}`} role="group" aria-label="Map view mode">
      <button
        type="button"
        className={`layer-option ${value === 'street' ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onChange('street')
        }}
        aria-pressed={value === 'street'}
        title="Standard street map"
      >
        <Layers size={13} />
        <span>Map</span>
      </button>
      <button
        type="button"
        className={`layer-option ${value === 'satellite' ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onChange('satellite')
        }}
        aria-pressed={value === 'satellite'}
        title="Satellite aerial imagery"
      >
        <Satellite size={13} />
        <span>Satellite</span>
      </button>
    </div>
  )
}

function MapCanvas({
  listings,
  onSelect,
  center = [31.92, -110.1],
  zoom = 8,
  showOffice = false,
  onBoundsChange,
  layer,
}: {
  listings: Property[]
  onSelect?: (property: Property) => void
  center?: [number, number]
  zoom?: number
  showOffice?: boolean
  onBoundsChange?: (bounds: L.LatLngBounds) => void
  layer?: 'street' | 'satellite'
}) {
  const storeMapLayer = useAppStore((state) => state.mapLayer)
  const activeLayer = layer ?? storeMapLayer

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} zoomControl={false} className="leaflet-map">
      {activeLayer === 'satellite' ? (
        <>
          <TileLayer
            key="esri-satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
          <TileLayer
            key="esri-boundaries"
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            zIndex={10}
          />
        </>
      ) : (
        <TileLayer
          key="osm-street"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      )}
      {listings.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={priceMarker(property.price)}
          eventHandlers={{ click: () => onSelect?.(property) }}
        />
      ))}
      {showOffice && (
        <Marker
          position={center}
          icon={L.divIcon({
            className: 'office-marker-icon',
            html: '<span class="office-marker-pin"></span>',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
          })}
        >
          <Popup>
            <strong>Arizona Life Homes and Land</strong>
            <br />
            225 N. Frontage Rd., Suite 107
            <br />
            Pearce, AZ 85625
          </Popup>
        </Marker>
      )}
      <MapResizer />
      <MapViewport center={center} zoom={zoom} />
      <MapBoundsReporter onBoundsChange={onBoundsChange} />
    </MapContainer>
  )
}
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleResize)
    const timer = window.setTimeout(handleResize, 150)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.clearTimeout(timer)
    }
  }, [map])
  return null
}
function MapViewport({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center, map, zoom])
  return null
}
function MapBoundsReporter({ onBoundsChange }: { onBoundsChange?: (bounds: L.LatLngBounds) => void }) {
  const map = useMap()
  useEffect(() => {
    if (!onBoundsChange) return
    const update = () => onBoundsChange(map.getBounds())
    update()
    map.on('moveend', update)
    return () => { map.off('moveend', update) }
  }, [map, onBoundsChange])
  return null
}
function priceMarker(price: number) {
  const label = price >= 1000000 ? `$${(price / 1000000).toFixed(1)}m` : `$${Math.round(price / 1000)}k`
  return L.divIcon({ className: 'price-marker-icon', html: `<span class="price-marker">${label}</span>`, iconSize: [66, 32], iconAnchor: [33, 32] })
}

function formatVideoTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function PropertyDetail({ onNotify, onMessage }: { onNotify: (value: string) => void; onMessage: () => void }) {
  const { id } = useParams()
  const property = properties.find((item) => item.id === id) || properties[0]

  useEffect(() => {
    if (property?.id) {
      try {
        localStorage.setItem(LAST_VIEWED_STORAGE_KEY, property.id)
      } catch (_) {}
    }
  }, [property?.id])
  const [mediaTab, setMediaTab] = useState<'photos' | 'video'>('photos')
  const [imageIndex, setImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(45)
  const [showControls, setShowControls] = useState(true)
  const hideControlsTimerRef = useRef<number | null>(null)
  const isSeekingRef = useRef(false)
  const detailVideoRef = useRef<HTMLVideoElement>(null)
  const [down, setDown] = useState('20')
  const [rate, setRate] = useState('6.5')
  const [term, setTerm] = useState('30')
  const [showCalc, setShowCalc] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const saved = useAppStore((state) => state.savedIds.includes(property.id))
  const toggleSaved = useAppStore((state) => state.toggleSaved)
  const mapLayer = useAppStore((state) => state.mapLayer)
  const setMapLayer = useAppStore((state) => state.setMapLayer)
  const navigate = useNavigate()

  const [prevPropId, setPrevPropId] = useState(property.id)
  if (property.id !== prevPropId) {
    setPrevPropId(property.id)
    setImageIndex(0)
    setMediaTab('photos')
    setIsVideoPlaying(false)
    setCurrentTime(0)
    setShowControls(true)
  }

  const cancelControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current)
      hideControlsTimerRef.current = null
    }
  }, [])

  const scheduleControlsHide = useCallback(() => {
    cancelControlsHide()
    if (detailVideoRef.current && !detailVideoRef.current.paused && !isSeekingRef.current) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        if (!isSeekingRef.current && detailVideoRef.current && !detailVideoRef.current.paused) {
          setShowControls(false)
        }
      }, 3000)
    }
  }, [cancelControlsHide])

  useEffect(() => {
    cancelControlsHide()
    return () => {
      cancelControlsHide()
    }
  }, [property.id, cancelControlsHide])

  const monthly = useMemo(() => {
    const principal = property.price * (1 - Number(down) / 100)
    const monthlyRate = Number(rate) / 1200
    const payments = Number(term) * 12
    return monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -payments)) : principal / payments
  }, [down, property.price, rate, term])

  const propertyVideo = property.video || {
    url: '/videos/drone-tour.mp4',
    title: `Aerial Drone Tour · ${property.title}`,
    duration: '0:45',
    poster: property.images[0],
  }

  const totalMediaItems = property.images.length + 1
  const isVideoSlide = imageIndex === property.images.length

  const galleryMove = (step: number) => {
    setImageIndex((value) => (value + step + totalMediaItems) % totalMediaItems)
  }

  const handleVideoContainerClick = () => {
    if (!showControls) {
      setShowControls(true)
      scheduleControlsHide()
    } else {
      if (detailVideoRef.current && !detailVideoRef.current.paused) {
        setShowControls(false)
        cancelControlsHide()
      }
    }
  }

  const handleToggleVideoPlay = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!detailVideoRef.current) return
    if (detailVideoRef.current.paused) {
      detailVideoRef.current.play().then(() => {
        setIsVideoPlaying(true)
        setShowControls(true)
        scheduleControlsHide()
      }).catch(() => {})
    } else {
      detailVideoRef.current.pause()
      setIsVideoPlaying(false)
      setShowControls(true)
      cancelControlsHide()
    }
  }

  const handleToggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!detailVideoRef.current) return
    detailVideoRef.current.muted = !isVideoMuted
    setIsVideoMuted(!isVideoMuted)
    setShowControls(true)
    scheduleControlsHide()
  }

  const handleTimeUpdate = () => {
    if (!isSeekingRef.current && detailVideoRef.current) {
      setCurrentTime(detailVideoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (detailVideoRef.current && detailVideoRef.current.duration) {
      setVideoDuration(detailVideoRef.current.duration)
    }
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (detailVideoRef.current) {
      detailVideoRef.current.currentTime = newTime
    }
  }

  const handleSeekPointerDown = () => {
    isSeekingRef.current = true
    setShowControls(true)
    cancelControlsHide()
  }

  const handleSeekPointerUp = () => {
    isSeekingRef.current = false
    if (detailVideoRef.current) {
      detailVideoRef.current.currentTime = currentTime
    }
    scheduleControlsHide()
  }

  const handleSkip = (seconds: number) => {
    if (!detailVideoRef.current) return
    const target = Math.max(0, Math.min(videoDuration || 45, detailVideoRef.current.currentTime + seconds))
    detailVideoRef.current.currentTime = target
    setCurrentTime(target)
    setShowControls(true)
    scheduleControlsHide()
  }

  return (
    <div className="detail-screen">
      <div className="detail-nav">
        <button className="detail-back-btn" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back</button>
        <span>PROPERTY DETAILS</span>
        <div className="detail-nav-actions">
          <button
            className={`detail-nav-btn ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            title={saved ? 'Remove from saved' : 'Save property'}
            onClick={() => toggleSaved(property.id)}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button
            className="detail-nav-btn"
            aria-label="Share property"
            title="Share property"
            onClick={() => onNotify('Property link copied')}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Media Switcher: Photos vs Video Tour */}
      <div className="detail-media-switcher">
        <button
          className={`media-switcher-btn ${mediaTab === 'photos' ? 'active' : ''}`}
          onClick={() => setMediaTab('photos')}
        >
          <Camera size={13} />
          <span>Photos ({property.images.length})</span>
        </button>
        <button
          className={`media-switcher-btn ${mediaTab === 'video' ? 'active' : ''}`}
          onClick={() => {
            setMediaTab('video')
            setShowControls(true)
            window.setTimeout(() => {
              detailVideoRef.current?.play().then(() => {
                setIsVideoPlaying(true)
                scheduleControlsHide()
              }).catch(() => {})
            }, 100)
          }}
        >
          <Play size={12} fill={mediaTab === 'video' ? 'currentColor' : 'none'} />
          <span>Video Tour ({propertyVideo.duration})</span>
        </button>
      </div>

      {/* Media Viewer Frame */}
      {mediaTab === 'photos' ? (
        <div
          className="gallery"
          onTouchStart={(event) => { (event.currentTarget as HTMLDivElement).dataset.startX = String(event.touches[0].clientX) }}
          onTouchEnd={(event) => {
            const startX = Number((event.currentTarget as HTMLDivElement).dataset.startX || 0);
            const diff = event.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 40) galleryMove(diff > 0 ? -1 : 1)
          }}
        >
          <img
            src={property.images[imageIndex < property.images.length ? imageIndex : 0]}
            alt={property.title}
            onClick={() => setShowGallery(true)}
          />
          <div className="gallery-top">
            <span className="sale-ribbon">FOR SALE</span>
            <span>{imageIndex < property.images.length ? imageIndex + 1 : 1} / {property.images.length}</span>
          </div>
          <button className="gallery-arrow left" onClick={() => galleryMove(-1)} aria-label="Previous image"><ChevronLeft /></button>
          <button className="gallery-arrow right" onClick={() => galleryMove(1)} aria-label="Next image"><ChevronRight /></button>
          <div className="gallery-dots">
            {property.images.map((image, index) => (
              <button
                key={image}
                className={index === imageIndex ? 'active' : ''}
                onClick={() => setImageIndex(index)}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
          <button
            className="detail-floating-video-btn"
            onClick={() => {
              setMediaTab('video')
              setShowControls(true)
              window.setTimeout(() => {
                detailVideoRef.current?.play().then(() => {
                  setIsVideoPlaying(true)
                  scheduleControlsHide()
                }).catch(() => {})
              }, 100)
            }}
          >
            <Play size={12} fill="currentColor" /> Watch Video Tour ({propertyVideo.duration})
          </button>
        </div>
      ) : (
        <div
          className={`gallery gallery--video ${!showControls ? 'controls-hidden' : ''}`}
          onClick={handleVideoContainerClick}
        >
          <video
            ref={detailVideoRef}
            src={propertyVideo.url}
            poster={propertyVideo.poster || property.images[0]}
            playsInline
            loop
            muted={isVideoMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => {
              setIsVideoPlaying(true)
              setShowControls(true)
              scheduleControlsHide()
            }}
            onPause={() => {
              setIsVideoPlaying(false)
              setShowControls(true)
              cancelControlsHide()
            }}
            className="detail-video-elem"
          />
          <div className="video-overlay-gradient" />
          <div className="gallery-top">
            <span className="sale-ribbon">4K AERIAL TOUR</span>
            <span className="video-duration-pill">{propertyVideo.duration}</span>
          </div>
          <button
            className={`detail-play-center-btn ${isVideoPlaying ? 'is-playing' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleToggleVideoPlay(); }}
            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
          >
            {isVideoPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          </button>

          {/* Bottom Dock: Seekbar and Controls */}
          <div
            className="detail-video-dock"
            onClick={(e) => {
              e.stopPropagation()
              setShowControls(true)
              scheduleControlsHide()
            }}
          >
            <div className="video-seek-bar-row">
              <span className="video-time-label">{formatVideoTime(currentTime)}</span>
              <div className="video-seek-track-wrapper">
                <input
                  type="range"
                  min={0}
                  max={videoDuration || 45}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeekChange}
                  onPointerDown={handleSeekPointerDown}
                  onPointerUp={handleSeekPointerUp}
                  className="video-seek-input"
                  aria-label="Seek video position"
                />
                <div
                  className="video-seek-progress"
                  style={{ width: `${Math.min(100, Math.max(0, (currentTime / (videoDuration || 45)) * 100))}%` }}
                />
              </div>
              <span className="video-time-label">{formatVideoTime(videoDuration || 45)}</span>
            </div>

            <div className="video-controls-action-bar">
              <div className="controls-group-left">
                <button
                  className="video-action-icon-btn"
                  onClick={handleToggleVideoPlay}
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  {isVideoPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                </button>
                <button
                  className="video-action-icon-btn"
                  onClick={() => handleSkip(-5)}
                  aria-label="Skip back 5 seconds"
                  title="Rewind 5s"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  className="video-action-icon-btn"
                  onClick={() => handleSkip(5)}
                  aria-label="Skip forward 5 seconds"
                  title="Forward 5s"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  className="video-action-icon-btn"
                  onClick={handleToggleVideoMute}
                  aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
                >
                  {isVideoMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>

              <div className="controls-group-right">
                <span className="video-hd-chip">4K TOUR</span>
                <button
                  className="video-action-icon-btn"
                  onClick={() => {
                    setImageIndex(property.images.length)
                    setShowGallery(true)
                  }}
                  aria-label="Expand fullscreen"
                  title="Fullscreen"
                >
                  <Maximize2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="detail-content">
        <div className="detail-price-row"><strong>{formatPrice(property.price)}</strong><span className="status-chip"><i /> Active</span></div>
        <h1>{property.title}</h1>
        <div className="detail-meta"><span><Trees size={17} />{property.acres} acres</span><span><span className="meta-dot" /> MLS #{property.mls}</span></div>
        <div className="detail-address"><MapPin size={17} />{property.address}</div>
        <div className="detail-divider" />

     

        <h2 className="detail-section-title">The details</h2>
        <div className="facts-grid"><Fact icon={<LandPlot />} label="Property size" value={`${property.acres} acres`} /><Fact icon={<Compass />} label="Property type" value={property.type} /><Fact icon={<MapPin />} label="County" value={`${property.county} County`} /><Fact icon={<Building2 />} label="Location" value={`${property.city}, AZ`} /></div>
        <h2 className="detail-section-title">Highlights</h2>
        <ul className="detail-feature-list">{property.features.map((feature) => <li key={feature}><span><Check size={14} /></span>{feature}</li>)}</ul>
        <h2 className="detail-section-title">About this place</h2>
        <p className="detail-description">{property.description}{showMore && ' Enjoy the freedom of open land and the beauty of Arizona’s unique landscapes. Contact our local team for more information or to arrange a visit.'}</p>
        <button className="read-more" onClick={() => setShowMore((value) => !value)}>{showMore ? 'Read less' : 'Read more'} <ChevronDown size={15} /></button>
        <div className="detail-cta">
          <button className="cta-call" onClick={() => onNotify('Calling +1 (520) 403-3903…')}><Phone size={16} /> Call</button>
          <button className="cta-message" onClick={onMessage}><MessageCircle size={16} /> Message</button>
          <button className="cta-showing" onClick={() => navigate('/contact')}><Calendar size={16} /> Schedule a meeting</button>
        </div>
        <h2 className="detail-section-title">Explore the area</h2>
        <div className="detail-map" onClick={() => navigate('/map')}>
          <MapCanvas listings={[property]} center={[property.lat, property.lng]} zoom={11} />
          <MapLayerToggle value={mapLayer} onChange={setMapLayer} className="detail-map-layer" />
          <div className="map-label"><MapPin size={15} /> {property.city}, Arizona <ArrowRight size={14} /></div>
        </div>
        <div className="calculator-card"><button className="calculator-title" onClick={() => setShowCalc((value) => !value)}><span><span className="calculator-icon"><DollarSign size={17} /></span><span><b>Estimated monthly payment</b><small>A simple starting point</small></span></span><ChevronDown className={showCalc ? 'rotate-icon' : ''} size={19} /></button><div className="payment-amount">{formatPrice(Math.round(monthly))}<small>/mo</small></div>{showCalc && <div className="calculator-controls"><label>Down payment <select value={down} onChange={(event) => setDown(event.target.value)}><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="50">50%</option></select></label><label>Interest rate <input type="number" value={rate} min="0" step="0.1" onChange={(event) => setRate(event.target.value)} /></label><label>Loan term <select value={term} onChange={(event) => setTerm(event.target.value)}><option value="15">15 years</option><option value="20">20 years</option><option value="30">30 years</option></select></label><small>Estimate excludes taxes, insurance, and fees.</small></div>}</div>
        <div className="similar-section">
          <SectionHeading kicker="KEEP EXPLORING" title="Similar places" />
          <SlidableScroller ariaLabel="Similar places slider">
            {properties.filter((item) => item.id !== property.id).slice(0, 3).map((item) => <PropertyCard key={item.id} property={item} compact />)}
          </SlidableScroller>
        </div>
      </div>
      <AnimatePresence>
        {showGallery && (
          <motion.div
            className="gallery-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGallery(false)}
          >
            <button className="viewer-close"><X /></button>
            <button
              className="viewer-arrow left"
              onClick={(event) => {
                event.stopPropagation()
                galleryMove(-1)
              }}
            >
              <ChevronLeft />
            </button>
            {isVideoSlide ? (
              <div className="viewer-video-container" onClick={(e) => e.stopPropagation()}>
                <video
                  src={propertyVideo.url}
                  poster={propertyVideo.poster || property.images[0]}
                  controls
                  autoPlay
                  playsInline
                  className="viewer-video-element"
                />
                <span className="viewer-caption">
                  <Play size={12} fill="currentColor" /> {propertyVideo.title} ({propertyVideo.duration})
                </span>
              </div>
            ) : (
              <>
                <img src={property.images[imageIndex < property.images.length ? imageIndex : 0]} alt={property.title} />
                <span>{imageIndex + 1} / {property.images.length}</span>
              </>
            )}
            <button
              className="viewer-arrow right"
              onClick={(event) => {
                event.stopPropagation()
                galleryMove(1)
              }}
            >
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="fact"><span className="fact-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>
}

function Browse({ onPick }: { onPick: (category: string, value: string) => void }) {
  const { category = 'type' } = useParams()
  const label = category.replace(/-/g, ' ').toLowerCase()
  const categoryType = categories.find((item) => item.toLowerCase() === label)
  const [selected, setSelected] = useState(categoryType || '')
  const browseKind = ['state', 'county', 'city', 'price'].includes(label) ? label : 'type'
  const options = browseKind === 'county'
    ? counties.map((item) => `${item} County`)
    : browseKind === 'city'
      ? cities
      : browseKind === 'price'
        ? ['Under $50,000', '$50,000 – $100,000', '$100,000 – $150,000', '$150,000+']
        : browseKind === 'state'
          ? ['Arizona']
          : categories
  const navigate = useNavigate()

  const getOptionCount = (kind: string, item: string) => {
    if (kind === 'city') return `${properties.filter((p) => p.city === item).length} places`
    if (kind === 'county') return `${properties.filter((p) => p.county === item.replace(/ County$/i, '')).length} places`
    if (kind === 'state') return `${properties.length} places`
    if (kind === 'price') {
      const ranges: Record<string, [number, number]> = {
        'Under $50,000': [0, 50000],
        '$50,000 – $100,000': [50000, 100000],
        '$100,000 – $150,000': [100000, 150000],
        '$150,000+': [150000, 9999999],
      }
      const range = ranges[item]
      if (range) return `${properties.filter((p) => p.price >= range[0] && p.price <= range[1]).length} places`
    }
    return `${properties.filter((p) => propertyMatchesType(p, item)).length} places`
  }

  const handleSelect = (item: string) => {
    setSelected(item)
    onPick(browseKind, item)
  }

  return (
    <div className="page-screen browse-screen">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Explore
      </button>
      <PageHeader
        kicker="DISCOVER YOUR OPTIONS"
        title={categoryType ? `Browse: ${categoryType}` : `Browse by ${browseKind}`}
        subtitle="Choose what matters to you and we’ll find the right places."
      />
      <div className="browse-options">
        {options.map((item, index) => (
          <button
            key={item}
            type="button"
            className={selected === item ? 'selected' : ''}
            onClick={() => handleSelect(item)}
          >
            <span className="browse-option-icon">
              {index === 0 ? <Mountain size={18} /> : index === 1 ? <Trees size={18} /> : <MapPin size={18} />}
            </span>
            <span>
              <strong>{item}</strong>
              <small>{getOptionCount(browseKind, item)}</small>
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      <button
        className="browse-apply"
        disabled={!selected}
        onClick={() => onPick(browseKind, selected)}
      >
        Show matching places <ArrowRight size={16} />
      </button>
      <p className="browse-note">
        Can’t decide? <Link to="/search">See all available properties</Link>
      </p>
      <div className="browse-other-links">
        <span>Also browse by</span>
        {[
          ['State', 'state'],
          ['Property type', 'type'],
          ['County', 'county'],
          ['City', 'city'],
          ['Price', 'price'],
        ]
          .filter(([, path]) => path !== browseKind)
          .map(([title, path]) => (
            <button key={path} onClick={() => navigate(`/browse/${path}`)}>
              {title}
              <ChevronRight size={14} />
            </button>
          ))}
      </div>
    </div>
  )
}

function Contact({ onNotify }: { onNotify: (value: string) => void }) {
  const navigate = useNavigate()
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const validation = [!first && 'first', !last && 'last', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 'email', !message.trim() && 'message', !consent && 'consent'].filter(Boolean) as string[]
    setErrors(validation)
    if (validation.length) return
    setSending(true)
    window.setTimeout(() => { setSending(false); setSuccess(true); onNotify('Your message is on its way!') }, 900)
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return <div className="contact-screen">
    <div className="contact-nav">
      <button
        type="button"
        className="contact-back-btn"
        onClick={handleBack}
        aria-label="Back"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>
      <span className="contact-nav-title">CONTACT US</span>
      <div className="contact-nav-spacer" aria-hidden="true" />
    </div>
    <div className="contact-content">
      <div className="office-section"><span className="welcome-kicker">COME SAY HELLO</span><h2>Our location</h2><div className="office-card"><div className="office-card-top"><img src={ucLogo} alt="United Country Real Estate" className="office-logo" /><div><strong>Arizona Life Homes and Land</strong><span>United Country Real Estate</span></div><span className="office-status"><i /> OPEN</span></div><div className="office-detail"><MapPin size={17} /><span>225 N. Frontage Rd., Suite 107<br />Pearce, AZ 85625</span></div><div className="office-detail"><Clock3 size={17} /><span>Monday – Friday<br />9:00 AM – 5:00 PM</span></div><div className="office-detail"><Users size={17} /><span>Broker: Richard (Rick) Frank</span></div><div className="office-contacts"><a href="tel:+15204033903"><Phone size={15} /> Call </a><a href="mailto:rick45ap@vtc.net"><Mail size={15} /> Email</a></div><a className="office-website" href="https://www.arizonahomesandlandsales.com" target="_blank" rel="noreferrer">Visit our website <ArrowRight size={14} /></a></div><div className="contact-map"><MapCanvas listings={[]} center={[31.9, -109.83]} zoom={13} showOffice layer="street" /><div className="contact-map-label"><MapPin size={15} /> Pearce, Arizona</div></div><div className="broker-credit"><span>LOCAL HEART. COUNTRY ROOTS.</span><strong>Richard “Rick” Frank <i>·</i> Your Southern Arizona Broker</strong></div></div>

    
      {success ? <div className="success-card"><span className="success-check"><Check size={28} /></span><span className="welcome-kicker">MESSAGE RECEIVED</span><h2>Thanks for reaching out.</h2><p>Rick will be in touch soon. In the meantime, imagine what’s possible.</p><button className="primary-button" onClick={() => { setSuccess(false); setFirst(''); setLast(''); setEmail(''); setPhone(''); setMessage(''); setConsent(false) }}>Send another message</button></div> : <form className="contact-form" onSubmit={submit} noValidate><span className="welcome-kicker">TELL US WHAT YOU’RE LOOKING FOR</span><h2>We’d love to hear from you.</h2><div className="form-row"><FormField label="First name" required error={errors.includes('first')}><input required aria-invalid={errors.includes('first')} value={first} onChange={(event) => setFirst(event.target.value)} placeholder="Your first name" /></FormField><FormField label="Last name" required error={errors.includes('last')}><input required aria-invalid={errors.includes('last')} value={last} onChange={(event) => setLast(event.target.value)} placeholder="Your last name" /></FormField></div><FormField label="Email address" required error={errors.includes('email')}><input required aria-invalid={errors.includes('email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></FormField><FormField label="Phone number"><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(520) 555-0123" /></FormField><FormField label="How can we help?" required error={errors.includes('message')}><textarea required aria-invalid={errors.includes('message')} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us a little about the place you’re looking for…" rows={4} /></FormField><label className={`consent-box ${errors.includes('consent') ? 'invalid' : ''}`}><input required aria-invalid={errors.includes('consent')} type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I agree to be contacted about my inquiry. Reply STOP to opt out. See our <Link to="/info">Terms of Service</Link> and <Link to="/info">Privacy Policy</Link>.</span></label>{errors.length > 0 && <p className="form-error" role="alert">Please complete the required fields and consent.</p>}<button className="send-button" type="submit" disabled={sending}>{sending ? <><span className="spinner" /> Sending…</> : <>Send message <Send size={16} /></>}</button></form>}
    </div>
  </div>
}
function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) { return <label className={`form-field ${error ? 'has-error' : ''}`}><span>{label}{required && <i> *</i>}</span>{children}</label> }

function Info() {
  const [open, setOpen] = useState<string[]>(['brokerage'])
  const toggle = (id: string) => setOpen((value) => value.includes(id) ? value.filter((item) => item !== id) : [...value, id])
  const items = [
    { id: 'brokerage', title: 'Brokerage disclaimer', body: 'Each office is independently owned and operated. Information is deemed accurate but is not guaranteed. Buyers should independently verify all property details, boundaries, zoning, utilities, and measurements.' },
    { id: 'equal', title: 'Equal Housing Opportunity', body: 'We are committed to the letter and spirit of the Fair Housing Act. We support equal housing opportunity for all people.' },
    { id: 'accessibility', title: 'Accessibility statement', body: 'United Country strives to make its website accessible and usable for everyone, consistent with WCAG 2.1 AA. For accessibility assistance call 800-999-1020 or email unitedsupport@unitedrealestate.com.' },
    { id: 'dmca', title: 'DMCA notice', body: 'If you believe content on this website infringes your copyright, please submit a written notice identifying the material and your contact information so we can review it promptly.' },
    { id: 'privacy', title: 'Privacy statement', body: 'We use the information you provide to respond to your inquiry and improve your experience. We do not sell your personal information. You may request access or deletion by contacting our office.' },
    { id: 'terms', title: 'Terms of use', body: 'Website content is provided for general informational purposes. Property details may change without notice. Use of this site is subject to applicable local, state, and federal law.' },
  ]
  const usefulLinks = [
    ['United Country Real Estate', 'https://www.unitedcountry.com'],
    ['Auction Services', 'https://www.ucauction.com'],
    ['UC Ranch Properties', 'https://www.ucranchproperties.com'],
    ['UC Land for Sale', 'https://www.uclandforsale.com'],
    ['Join our team', 'https://www.unitedcountry.com/careers'],
    ['Realtree United Country Hunting Properties', 'https://www.realtreeuc.com'],
  ]
  return <div className="page-screen info-screen"><PageHeader kicker="THE DETAILS MATTER" title="Good to know" subtitle="A little transparency goes a long way." /><div className="equal-housing"><ShieldCheck size={23} /><span><strong>Equal Housing Opportunity</strong><small>We believe everyone deserves a place to call home.</small></span><span className="eho-mark">EHO</span></div><div className="accordion-list">{items.map((item) => <section key={item.id} className={`accordion-item ${open.includes(item.id) ? 'open' : ''}`}><button onClick={() => toggle(item.id)}><strong>{item.title}</strong><ChevronDown size={17} /></button>{open.includes(item.id) && <p>{item.body}</p>}</section>)}</div><div className="useful-links"><h3>Useful links</h3>{usefulLinks.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label}<ArrowRight size={14} /></a>)}</div></div>
}

function PageHeader({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) { return <div className="page-header">{kicker && <span className="welcome-kicker">{kicker}</span>}<h1>{title}</h1><div className="heading-underline" />{subtitle && <p>{subtitle}</p>}</div> }

function Drawer({ onClose, onDark, darkMode, onAuth }: { onClose: () => void; onDark: () => void; darkMode: boolean; onAuth: () => void }) {
  const navigate = useNavigate()
  const currentUser = useAppStore((state) => state.currentUser)
  const links = [{ label: 'Home', to: '/' }, { label: 'User Dashboard', to: '/dashboard' }, { label: 'Buyers', to: '/browse/type' }, { label: 'Sellers', to: '/contact' }, { label: 'Meet Our Team', to: '/contact' }, { label: 'Recently Sold', to: '/search' }, { label: 'Contact Us', to: '/contact' }, { label: 'Privacy Statement', to: '/info' }, { label: 'Terms of Use', to: '/info' }]
  return <div className="drawer-backdrop" onClick={onClose}><motion.aside className="side-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()}><div className="drawer-top"><div className="drawer-logo"><img src={ucLogo} alt="United Country Real Estate" className="uc-mark" /><div className="brand-copy"><strong>ARIZONA LIFE</strong><span>HOMES & LAND</span></div></div><button className="round-close" onClick={onClose}><X size={18} /></button></div><div className="drawer-user-strip" onClick={() => { if (currentUser) { navigate('/dashboard'); onClose(); } else { onAuth(); onClose(); } }}><div className="drawer-user-avatar">{currentUser ? (currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="drawer-avatar-img" /> : currentUser.name[0].toUpperCase()) : <UserIcon size={17} />}</div><div className="drawer-user-copy"><strong>{currentUser ? currentUser.name : 'Sign in / Create account'}</strong><small>{currentUser ? currentUser.email : 'Personalized places & alerts'}</small></div><ChevronRight size={16} /></div><span className="welcome-kicker drawer-kicker">EXPLORE ARIZONA LIFE</span><nav>{links.map((link, index) => <Link key={link.label} to={link.to} onClick={onClose}><span>{link.label}</span>{index < 4 && <ArrowRight size={15} />}</Link>)}</nav><div className="drawer-bottom"><button className="mode-toggle" onClick={onDark}><span>{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span><span className={`switch ${darkMode ? 'on' : ''}`}><i /></span></button><p>Arizona Life Homes and Land<br />A United Country Real Estate office</p><Link to="/info" onClick={onClose}>Legal & accessibility <ArrowRight size={14} /></Link></div></motion.aside></div>
}

function InquirySheet({ onClose, onSend }: { onClose: () => void; onSend: () => void }) {
  const currentUser = useAppStore((state) => state.currentUser)
  const [message, setMessage] = useState('')
  return <BottomSheet title="Let’s talk Arizona" onClose={onClose}><p className="inquiry-intro">{currentUser ? `Connecting as ${currentUser.name} (${currentUser.email})` : 'A local broker is just a message away.'}</p><div className="inquiry-broker"><div className="broker-avatar">RF</div><div><strong>Rick Frank</strong><span>Southern Arizona Broker</span></div><span className="online-indicator"><i /> Here to help</span></div><label className="inquiry-label">What can we help you find?<textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={currentUser?.bio ? `I’m interested in… (e.g. ${currentUser.bio.slice(0, 50)}…)` : 'I’m interested in… (optional)'} /></label><button className="primary-button inquiry-send" onClick={onSend}>Send a quick inquiry <ArrowRight size={16} /></button><a className="inquiry-call" href="tel:+15204033903"><Phone size={15} /> Or call Rick at (520) 403-3903</a></BottomSheet>
}

function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(-1)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  useEffect(() => { const timer = window.setTimeout(() => setStep(0), 2000); return () => window.clearTimeout(timer) }, [])
  const cards = [
    { title: 'Find your kind of wide open.', body: 'Discover land, homes, and hidden corners across southern Arizona.', icon: <Compass size={32} />, color: 'onboard-land' },
    { title: 'Save the places that feel right.', body: 'Keep your favorite finds close while you imagine what’s next.', icon: <Heart size={32} />, color: 'onboard-save' },
    { title: 'Talk to someone who knows.', body: 'Local roots, genuine advice, and a real person in your corner.', icon: <MessageCircle size={32} />, color: 'onboard-talk' },
  ]
  return <motion.div className="onboarding-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="onboard-top"><span className="welcome-kicker">ARIZONA LIFE · PEARCE, AZ</span><button onClick={onDone}>Skip <ArrowRight size={14} /></button></div>{step < 0 ? <div className="splash-mark"><img src={ucLogo} alt="United Country Real Estate" className="uc-mark" /><div className="brand-copy"><strong>ARIZONA LIFE</strong><span>HOMES & LAND</span></div><div className="splash-loading"><i /></div></div> : <><div className={`onboard-art ${cards[step].color}`} onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={(event) => { if (touchStart === null) return; const delta = event.changedTouches[0].clientX - touchStart; if (Math.abs(delta) > 45) setStep((value) => Math.max(0, Math.min(2, value + (delta < 0 ? 1 : -1)))); setTouchStart(null) }}><div className="art-sun" /><div className="art-mountain one" /><div className="art-mountain two" /><div className="art-ground" /><span className="art-icon">{cards[step].icon}</span><span className="art-star star-one">✦</span><span className="art-star star-two">✦</span><span className="art-cactus">♧</span></div><div className="onboard-content"><span className="welcome-kicker">GOOD PLACES. GOOD PEOPLE.</span><h1>{cards[step].title}</h1><div className="heading-underline" /><p>{cards[step].body}</p><div className="onboard-dots">{cards.map((item, index) => <button key={item.title} onClick={() => setStep(index)} className={step === index ? 'active' : ''} aria-label={`Onboarding page ${index + 1}`} />)}</div><button className="primary-button onboard-next" onClick={() => step === 2 ? onDone() : setStep((value) => value + 1)}>{step === 2 ? 'Let’s explore' : 'Continue'} <ArrowRight size={16} /></button></div></>}</motion.div>
}

export default App
