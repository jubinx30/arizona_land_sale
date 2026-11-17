import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useAppStore, type User } from '../store/useAppStore'
import UserProfileView from './UserProfileView'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
}

// Prototype-only demo data. Replace with empty strings for production.
const DEMO = {
  name: 'Sarah Miller',
  email: 'sarah.miller@example.com',
  password: 'demo1234',
  phone: '(602) 555-0142',
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const currentUser = useAppStore((state) => state.currentUser)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Form fields (prefilled with demo data for the prototype)
  const [name, setName] = useState(DEMO.name)
  const [email, setEmail] = useState(DEMO.email)
  const [password, setPassword] = useState(DEMO.password)
  const [phone, setPhone] = useState(DEMO.phone)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user: User = {
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim(),
        username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        phone: phone.trim() || '(602) 555-0142',
        location: 'Tucson, AZ',
        buyerType: 'Land Buyer & Homesteader',
        bio: 'Searching for 10-40 acres in Cochise or Santa Cruz County with mountain views and water well potential.',
        memberSince: 'Today',
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
      setCurrentUser(user)
      localStorage.setItem('az-auth-completed', 'yes')
      onSuccess?.(user)
      onClose()
    }, 450)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user: User = {
        name: name.trim(),
        email: email.trim(),
        username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        phone: phone.trim() || undefined,
        location: 'Southern Arizona',
        buyerType: 'Land Buyer & Homesteader',
        bio: 'Looking for acreage or country property in Southern Arizona.',
        memberSince: 'Today',
        preferences: {
          buyerType: 'Land Buyer & Homesteader',
          targetAcreage: '5 - 20 acres',
          budgetRange: '$100k - $250k',
          preferredCounties: ['Cochise County'],
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
      setCurrentUser(user)
      localStorage.setItem('az-auth-completed', 'yes')
      onSuccess?.(user)
      onClose()
    }, 450)
  }



  const handleGuestContinue = () => {
    localStorage.setItem('az-auth-completed', 'yes')
    onClose()
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    // Restore demo data so the form isn't blank when the modal reopens
    setName(DEMO.name)
    setEmail(DEMO.email)
    setPassword(DEMO.password)
    setPhone(DEMO.phone)
    setError('')
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <motion.div
        className={`auth-modal-card ${currentUser ? 'is-profile' : ''}`}
        initial={{ opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="auth-modal-close"
          onClick={handleGuestContinue}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Brand Banner */}
        <div className="auth-brand">
          <div className="auth-uc-badge">UC</div>
          <div className="auth-brand-text">
            <strong>ARIZONA LIFE</strong>
            <span>{currentUser ? 'CLIENT ACCOUNT & PROFILE' : 'HOMES & LAND · UNITED COUNTRY'}</span>
          </div>
        </div>

        {/* If user is already logged in, show user profile view */}
        {currentUser ? (
          <UserProfileView onClose={onClose} onSignOut={handleSignOut} />
        ) : (
          <>
            {/* Header intro */}
            <div className="auth-header">
              <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
              <p>
                {mode === 'signin'
                  ? 'Sign in to access your saved Arizona places and personalized listings.'
                  : 'Join to save favorites, receive price drop alerts, and connect with local brokers.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="auth-mode-toggle">
              <button
                type="button"
                className={`auth-toggle-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin')
                  setError('')
                }}
              >
                {mode === 'signin' && (
                  <motion.span
                    layoutId="authTabIndicator"
                    className="auth-tab-glider"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Sign in</span>
              </button>

              <button
                type="button"
                className={`auth-toggle-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
              >
                {mode === 'signup' && (
                  <motion.span
                    layoutId="authTabIndicator"
                    className="auth-tab-glider"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Create account</span>
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="auth-form">
              {mode === 'signup' && (
                <div className="auth-input-group">
                  <label htmlFor="auth-name">Full name</label>
                  <div className="auth-input-wrap">
                    <UserIcon size={17} className="auth-input-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="e.g. Sarah Miller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label htmlFor="auth-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={17} className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label htmlFor="auth-password">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => setError('Password reset instructions sent to your email.')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signin' ? 'Enter your password' : 'At least 6 characters'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>


              {mode === 'signin' && (
                <label className="auth-remember-row">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in on this device</span>
                </label>
              )}

              <button
                type="submit"
                className="primary-button auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? 'Please wait…'
                  : mode === 'signin'
                  ? 'Sign in to Arizona Life'
                  : 'Create account'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Guest Browsing Option */}
            <div className="auth-guest-footer">
              <button type="button" className="auth-guest-link" onClick={handleGuestContinue}>
                Or Continue as guest <ArrowRight size={14} />
              </button>
              <div className="auth-security-note">
                <ShieldCheck size={13} />
                <span>Your privacy is protected. No spam ever.</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}