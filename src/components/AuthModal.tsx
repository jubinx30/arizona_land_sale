import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useAppStore, type User } from '../store/useAppStore'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const currentUser = useAppStore((state) => state.currentUser)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
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
        memberSince: 'Today',
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
        phone: phone.trim() || undefined,
        memberSince: 'Today',
      }
      setCurrentUser(user)
      localStorage.setItem('az-auth-completed', 'yes')
      onSuccess?.(user)
      onClose()
    }, 450)
  }

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user: User = {
        name: provider === 'Google' ? 'Alex Morgan' : 'Jordan Lee',
        email: provider === 'Google' ? 'alex.morgan@gmail.com' : 'jordan.lee@icloud.com',
        memberSince: 'Today',
      }
      setCurrentUser(user)
      localStorage.setItem('az-auth-completed', 'yes')
      onSuccess?.(user)
      onClose()
    }, 400)
  }

  const handleGuestContinue = () => {
    localStorage.setItem('az-auth-completed', 'yes')
    onClose()
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setError('')
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <motion.div
        className="auth-modal-card"
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
          aria-label="Close authentication modal"
        >
          <X size={18} />
        </button>

        {/* Brand Banner */}
        <div className="auth-brand">
          <div className="auth-uc-badge">UC</div>
          <div className="auth-brand-text">
            <strong>ARIZONA LIFE</strong>
            <span>HOMES & LAND · UNITED COUNTRY</span>
          </div>
        </div>

        {/* If user is already logged in, show user profile card */}
        {currentUser ? (
          <div className="auth-logged-in-view">
            <div className="auth-user-avatar">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <h3>Signed in as</h3>
            <h2>{currentUser.name}</h2>
            <p className="auth-user-email">{currentUser.email}</p>

            <div className="auth-member-perks">
              <div><Check size={16} /> <span>Saved property shortlist synced</span></div>
              <div><Check size={16} /> <span>Direct inquiries with broker Rick Frank</span></div>
              <div><Check size={16} /> <span>Real-time price & acreage alerts</span></div>
            </div>

            <div className="auth-logged-in-actions">
              <button className="primary-button auth-continue-btn" onClick={onClose}>
                Explore Properties <ArrowRight size={16} />
              </button>
              <button className="auth-signout-btn" onClick={handleSignOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
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

              {mode === 'signup' && (
                <div className="auth-input-group">
                  <label htmlFor="auth-phone">
                    Phone number <small>(Optional, for text updates)</small>
                  </label>
                  <div className="auth-input-wrap">
                    <Phone size={17} className="auth-input-icon" />
                    <input
                      id="auth-phone"
                      type="tel"
                      placeholder="(520) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              )}

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

            {/* Social Authentication Divider */}
            <div className="auth-divider">
              <span />
              <em>or continue with</em>
              <span />
            </div>

            {/* Social Login Buttons */}
            <div className="auth-social-row">
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialLogin('Google')}
                aria-label="Continue with Google"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialLogin('Apple')}
                aria-label="Continue with Apple"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.63 1.34-.55.63-.99 1.68-.88 2.7.99.08 2-.45 2.59-1.19z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Guest Browsing Option */}
            <div className="auth-guest-footer">
              <button type="button" className="auth-guest-link" onClick={handleGuestContinue}>
                Continue as guest <ArrowRight size={14} />
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
