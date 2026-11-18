import { motion } from 'framer-motion'
import {
  BadgeDollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Phone,
  Sliders,
  Sparkles,
  Sun,
  User as UserIcon,
} from 'lucide-react'
import type { User } from '../store/useAppStore'
import './UserMenuDropdown.css'

interface UserMenuDropdownProps {
  currentUser: User | null
  savedCount: number
  darkMode: boolean
  onClose: () => void
  onNavigate: (path: string) => void
  onOpenAuth: () => void
  onToggleTheme: () => void
  onSignOut: () => void
  onDemoSignIn: () => void
  onContactBroker?: () => void
}

export default function UserMenuDropdown({
  currentUser,
  savedCount,
  darkMode,
  onClose,
  onNavigate,
  onOpenAuth,
  onToggleTheme,
  onSignOut,
  onDemoSignIn,
  onContactBroker,
}: UserMenuDropdownProps) {
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AZ'

  return (
    <>
      {/* Invisible backdrop to dismiss dropdown on outside click */}
      <div
        className="user-dropdown-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="user-menu-dropdown"
        role="menu"
        aria-label="User profile menu"
        initial={{ opacity: 0, scale: 0.94, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -6 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {currentUser ? (
          <>
            {/* User Profile Snapshot Header */}
            <div
              className="user-menu-header"
              role="button"
              tabIndex={0}
              onClick={() => onNavigate('/dashboard')}
              title="Open User Dashboard"
            >
              <div className="user-menu-avatar-wrap">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="user-menu-avatar-img"
                  />
                ) : (
                  <div className="user-menu-avatar-fallback">{initials}</div>
                )}
              </div>
              <div className="user-menu-user-info">
                <span className="user-menu-name">{currentUser.name}</span>
                <span className="user-menu-email">{currentUser.email}</span>
                <span className="user-menu-badge">
                  <Sparkles size={10} /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="user-menu-divider" />

            {/* Essential Feature Links */}
            <div className="user-menu-group">
              <button
                type="button"
                className="user-menu-item user-menu-item--primary"
                role="menuitem"
                onClick={() => onNavigate('/dashboard')}
              >
                <span className="user-menu-item-icon">
                  <LayoutDashboard size={16} />
                </span>
                <span className="user-menu-item-text">
                  <strong>User Dashboard</strong>
                  <small>Full profile & search hub</small>
                </span>
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/saved')}
              >
                <span className="user-menu-item-icon">
                  <Heart size={16} />
                </span>
                <span className="user-menu-item-text">
                  <strong>Saved Places</strong>
                  <small>Shortlisted Arizona land</small>
                </span>
                {savedCount > 0 && (
                  <span className="user-menu-badge-count">{savedCount}</span>
                )}
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/sell')}
              >
                <span className="user-menu-item-icon">
                  <BadgeDollarSign size={16} />
                </span>
                <span className="user-menu-item-text">
                  <span>List Property & Join Team</span>
                </span>
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/dashboard?tab=preferences')}
              >
                <span className="user-menu-item-icon">
                  <Sliders size={16} />
                </span>
                <span className="user-menu-item-text">
                  <strong>Preferences</strong>
                  <small>Acreage, budget & counties</small>
                </span>
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/sell')}
              >
                <span className="user-menu-item-icon">
                  <BadgeDollarSign size={16} />
                </span>
                <span className="user-menu-item-text">
                  <strong>List Property & Join Team</strong>
                  <small>Broker approval & careers</small>
                </span>
              </button>
            </div>

            <div className="user-menu-divider" />

            {/* Quick Actions */}
            <div className="user-menu-group">
              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={onToggleTheme}
              >
                <span className="user-menu-item-icon">
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </span>
                <span className="user-menu-item-text">
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
              </button>

              {onContactBroker && (
                <button
                  type="button"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={onContactBroker}
                >
                  <span className="user-menu-item-icon">
                    <Phone size={16} />
                  </span>
                  <span className="user-menu-item-text">
                    <span>Contact Broker</span>
                  </span>
                </button>
              )}
            </div>

            <div className="user-menu-divider" />

            {/* Sign Out */}
            <div className="user-menu-group">
              <button
                type="button"
                className="user-menu-item user-menu-item--danger"
                role="menuitem"
                onClick={onSignOut}
              >
                <span className="user-menu-item-icon">
                  <LogOut size={16} />
                </span>
                <span className="user-menu-item-text">
                  <span>Sign Out</span>
                </span>
              </button>
            </div>
          </>
        ) : (
          /* Guest State Dropdown */
          <>
            <div className="user-menu-guest-header">
              <div className="user-menu-avatar-fallback guest">
                <UserIcon size={18} />
              </div>
              <div>
                <strong className="user-menu-name">Welcome, Guest</strong>
                <span className="user-menu-email">Sign in to save properties</span>
              </div>
            </div>

            <div className="user-menu-divider" />

            <div className="user-menu-guest-actions">
              <button
                type="button"
                className="user-menu-btn-signin"
                onClick={onOpenAuth}
              >
                Sign In / Register
              </button>

              <button
                type="button"
                className="user-menu-btn-demo"
                onClick={onDemoSignIn}
              >
                <Sparkles size={14} /> Try Demo Account
              </button>
            </div>

            <div className="user-menu-divider" />

            <div className="user-menu-group">
              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/saved')}
              >
                <span className="user-menu-item-icon">
                  <Heart size={16} />
                </span>
                <span className="user-menu-item-text">
                  <span>Saved Places</span>
                </span>
                {savedCount > 0 && (
                  <span className="user-menu-badge-count">{savedCount}</span>
                )}
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={() => onNavigate('/sell')}
              >
                <span className="user-menu-item-icon">
                  <BadgeDollarSign size={16} />
                </span>
                <span className="user-menu-item-text">
                  <span>List Property & Join Team</span>
                </span>
              </button>

              <button
                type="button"
                className="user-menu-item"
                role="menuitem"
                onClick={onToggleTheme}
              >
                <span className="user-menu-item-icon">
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </span>
                <span className="user-menu-item-text">
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  )
}
