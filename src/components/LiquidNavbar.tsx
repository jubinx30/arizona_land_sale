import { useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Heart,
  House,
  Map as MapIcon,
  Search,
  User,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import './LiquidNavbar.css'

interface TabConfig {
  to: string
  label: string
  icon: LucideIcon
}

const TABS: TabConfig[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/saved', label: 'Saved', icon: Heart },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/dashboard', label: 'Profile', icon: User },
]

export default function LiquidNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const savedCount = useAppStore((state) => state.savedIds.length)

  // Map current path to active tab index
  const activeIndex = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 0
    if (path.startsWith('/search') || path.startsWith('/browse') || path.startsWith('/property')) return 1
    if (path.startsWith('/saved')) return 2
    if (path.startsWith('/map')) return 3
    if (path.startsWith('/dashboard') || path.startsWith('/profile')) return 4
    return -1
  }, [location.pathname])

  const handleTabClick = useCallback(
    (to: string) => {
      if (location.pathname !== to) {
        navigate(to)
      }
    },
    [location.pathname, navigate]
  )

  return (
    <nav className="liquid-navbar" aria-label="Primary navigation">
      {/* Specular Liquid Glare Rim */}
      <span className="liquid-glass-glare" />

      {/* Tab Track */}
      <div className="liquid-navbar__track">
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex
          const Icon = tab.icon
          const hasBadge = tab.to === '/saved' && savedCount > 0

          return (
            <button
              key={tab.to}
              type="button"
              className={`liquid-tab-item ${isActive ? 'is-active' : ''}`}
              onClick={() => handleTabClick(tab.to)}
              aria-label={tab.label}
              title={tab.label}
            >
              {/* Sliding Liquid Glass Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="liquidTabIndicator"
                  className="liquid-active-indicator"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                    mass: 0.7,
                  }}
                />
              )}

              <span className="liquid-tab-item__icon-wrap">
                <Icon size={19} strokeWidth={isActive ? 2.3 : 1.9} />
                {hasBadge && (
                  <span className="liquid-tab-item__badge" aria-label={`${savedCount} saved`}>
                    {savedCount}
                  </span>
                )}
              </span>
              <span className="liquid-tab-item__label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
