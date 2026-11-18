import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  FileText,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  useAppStore,
  type UserPropertyListing,
  type TeamApplication,
} from '../store/useAppStore'
import { categories } from '../data/properties'
import './SellAndJoinView.css'

interface SellAndJoinViewProps {
  onNotify: (msg: string) => void
  onAuthRequest?: () => void
}

type ActiveTab = 'list_property' | 'submissions' | 'join_team'

// Curated high-res sample photos of Arizona properties for quick preview
const SAMPLE_AZ_PHOTOS = [
  {
    name: 'Desert Vista & Mountains',
    url: 'https://images.unsplash.com/photo-1602138759009-ca3386c95619?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Dragoon Foothills Acreage',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Southwest Ranch Estate',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Saguaro High Desert Land',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Country Homestead & Fencing',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Mountain Sunset Basin',
    url: 'https://images.unsplash.com/photo-1705869340514-c3512ede4311?auto=format&fit=crop&w=1000&q=85',
  },
]

const PROPERTY_FEATURE_OPTIONS = [
  'Mountain views',
  'Private well potential',
  'Electricity at lot line',
  'Off-grid / solar ready',
  'Horses allowed',
  'Perimeter fenced',
  'Near National Forest / BLM',
  'Gated community',
  'Paved road access',
  'Owner financing available',
  'Septic installed / perc approved',
  'High-speed internet ready',
  'Holding tank installed',
  'Agricultural zoning',
]

const ARIZONA_COUNTIES = ['Cochise', 'Pima', 'Graham', 'Santa Cruz', 'Pinal', 'Maricopa']

export default function SellAndJoinView({ onNotify, onAuthRequest }: SellAndJoinViewProps) {
  const navigate = useNavigate()
  const currentUser = useAppStore((state) => state.currentUser)
  const userPropertyListings = useAppStore((state) => state.userPropertyListings || [])
  const teamApplications = useAppStore((state) => state.teamApplications || [])
  const addUserPropertyListing = useAppStore((state) => state.addUserPropertyListing)
  const updateUserPropertyListingStatus = useAppStore((state) => state.updateUserPropertyListingStatus)
  const deleteUserPropertyListing = useAppStore((state) => state.deleteUserPropertyListing)
  const addTeamApplication = useAppStore((state) => state.addTeamApplication)
  const addNotification = useAppStore((state) => state.addNotification)

  const [activeTab, setActiveTab] = useState<ActiveTab>('list_property')

  // --- Listing Form State ---
  const [title, setTitle] = useState('')
  const [propType, setPropType] = useState('Land')
  const [price, setPrice] = useState('')
  const [county, setCounty] = useState('Cochise')
  const [city, setCity] = useState('Saint David')
  const [address, setAddress] = useState('')
  const [acres, setAcres] = useState('')
  const [hasStructure, setHasStructure] = useState(false)
  const [bedrooms, setBedrooms] = useState('3')
  const [bathrooms, setBathrooms] = useState('2')
  const [sqft, setSqft] = useState('1800')
  const [description, setDescription] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Mountain views',
    'Horses allowed',
  ])
  const [images, setImages] = useState<string[]>([])
  const [sellerName, setSellerName] = useState(currentUser?.name || '')
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || '')
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '')
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false)
  const [isSubmittingProp, setIsSubmittingProp] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Agent / Career Form State ---
  const [agentName, setAgentName] = useState(currentUser?.name || '')
  const [agentEmail, setAgentEmail] = useState(currentUser?.email || '')
  const [agentPhone, setAgentPhone] = useState(currentUser?.phone || '')
  const [roleInterest, setRoleInterest] = useState<TeamApplication['roleInterest']>('salesperson')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState('2-5 years')
  const [targetTerritory, setTargetTerritory] = useState('Cochise & Pima County')
  const [agentSpecialties, setAgentSpecialties] = useState<string[]>([
    'Land & Acreage',
    'Country Homes',
  ])
  const [agentMessage, setAgentMessage] = useState('')
  const [isSubmittingApp, setIsSubmittingApp] = useState(false)
  const [appSubmittedSuccess, setAppSubmittedSuccess] = useState(false)

  // Handle image upload from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImageUrls: string[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      newImageUrls.push(url)
    })

    setImages((prev) => [...prev, ...newImageUrls])
    onNotify(`Attached ${files.length} property photo${files.length > 1 ? 's' : ''}!`)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Add sample photo
  const handleAddSamplePhoto = (sampleUrl: string) => {
    if (images.includes(sampleUrl)) {
      onNotify('Photo already added')
      return
    }
    setImages((prev) => [...prev, sampleUrl])
    onNotify('Sample Arizona photo added')
  }

  // Remove photo
  const handleRemovePhoto = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Set as cover photo
  const handleSetCoverPhoto = (indexToCover: number) => {
    setImages((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(indexToCover, 1)
      return [item, ...copy]
    })
    onNotify('Updated cover photo')
  }

  // Toggle features
  const handleToggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  // Toggle agent specialties
  const handleToggleSpecialty = (item: string) => {
    setAgentSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    )
  }

  // Submit Listing
  const handleListingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: string[] = []

    if (!title.trim()) errors.push('title')
    if (!price || Number(price) <= 0) errors.push('price')
    if (!address.trim()) errors.push('address')
    if (!acres || Number(acres) <= 0) errors.push('acres')
    if (!description.trim()) errors.push('description')
    if (images.length === 0) errors.push('images')
    if (!sellerName.trim()) errors.push('sellerName')
    if (!sellerEmail.trim() || !/^\S+@\S+\.\S+$/.test(sellerEmail)) errors.push('sellerEmail')
    if (!ownershipConfirmed) errors.push('ownershipConfirmed')

    setFormErrors(errors)

    if (errors.length > 0) {
      if (errors.includes('images')) {
        onNotify('Please upload at least 1 photo of your property')
      } else if (errors.includes('ownershipConfirmed')) {
        onNotify('Please confirm legal ownership authorization')
      } else {
        onNotify('Please complete all required fields marked in red')
      }
      return
    }

    setIsSubmittingProp(true)

    setTimeout(() => {
      const newListing: UserPropertyListing = {
        id: `listing-${Date.now()}`,
        title: title.trim(),
        type: propType,
        price: Number(price),
        county,
        city,
        address: address.trim(),
        acres: Number(acres),
        bedrooms: hasStructure ? Number(bedrooms) : undefined,
        bathrooms: hasStructure ? Number(bathrooms) : undefined,
        sqft: hasStructure ? Number(sqft) : undefined,
        description: description.trim(),
        features: selectedFeatures,
        images: [...images],
        status: 'pending_review',
        submittedAt: 'Just now',
        assignedBroker: 'Rick Frank, Designated Broker',
        brokerNotes:
          'Listing received. Designated Broker Rick Frank is pulling Cochise/Pima county GIS parcel records and deed history for verification.',
        sellerName: sellerName.trim(),
        sellerEmail: sellerEmail.trim(),
        sellerPhone: sellerPhone.trim() || '(520) 403-3903',
        ownershipConfirmed: true,
        mlsNumber: `AZ-02034-PEN${Math.floor(1000 + Math.random() * 9000)}`,
      }

      addUserPropertyListing(newListing)
      addNotification({
        title: 'Listing Submitted for Broker Review',
        message: `"${newListing.title}" was submitted. Designated Broker Rick Frank will audit title & valuation within 24-48 hrs.`,
        date: 'Just now',
      })

      setIsSubmittingProp(false)
      onNotify('Property submitted for broker review!')

      // Reset form
      setTitle('')
      setPrice('')
      setAddress('')
      setAcres('')
      setDescription('')
      setImages([])
      setOwnershipConfirmed(false)
      setFormErrors([])

      // Navigate to submissions tab so user can see it
      setActiveTab('submissions')
    }, 800)
  }

  // Submit Career / Agent Application
  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName.trim() || !agentEmail.trim() || !/^\S+@\S+\.\S+$/.test(agentEmail)) {
      onNotify('Please enter a valid full name and email')
      return
    }

    setIsSubmittingApp(true)
    setTimeout(() => {
      const newApp: TeamApplication = {
        id: `app-${Date.now()}`,
        fullName: agentName.trim(),
        email: agentEmail.trim(),
        phone: agentPhone.trim() || '(520) 403-3903',
        roleInterest,
        licenseNumber: licenseNumber.trim() || 'In Progress',
        experienceYears,
        targetTerritory,
        specialties: agentSpecialties,
        message: agentMessage.trim() || 'Interested in joining Arizona Life Homes & Land broker team.',
        submittedAt: 'Just now',
        status: 'under_broker_review',
        brokerFeedback:
          'Application received. Rick Frank will review your background and reach out for an introductory call within 24 hours.',
      }

      addTeamApplication(newApp)
      addNotification({
        title: 'Agent Application Received! 🤝',
        message:
          'Thank you for applying to Arizona Life Homes & Land. Broker Rick Frank will review your profile shortly.',
        date: 'Just now',
      })

      setIsSubmittingApp(false)
      setAppSubmittedSuccess(true)
      onNotify('Application sent to Broker Rick Frank!')
    }, 700)
  }

  // Broker Approval Simulation Toggle
  const handleSimulateBrokerApproval = (listing: UserPropertyListing) => {
    if (listing.status === 'approved') {
      updateUserPropertyListingStatus(
        listing.id,
        'under_review',
        'Cochise County title audit verified. Reviewing comparable sales before final sign-off.'
      )
      onNotify('Status changed back to Under Review (Demo)')
    } else {
      const finalMls = `AZ-02034-${Math.floor(500000 + Math.random() * 499999)}`
      updateUserPropertyListingStatus(
        listing.id,
        'approved',
        'Official Broker Sign-off: Title clear, zoning verified, valuation confirmed. Agreement executed and syndicated to MLS & Land.com.',
        finalMls
      )
      addNotification({
        title: '🎉 Property Approved for Sale by Broker!',
        message: `"${listing.title}" is officially approved! MLS #${finalMls} has been assigned and is live on Arizona Life.`,
        date: 'Just now',
      })
      onNotify(`Approved! Assigned MLS #${finalMls}`)
    }
  }

  const pendingCount = userPropertyListings.filter((l) => l.status !== 'approved').length

  return (
    <div className="page-screen sell-join-screen">
      {/* Top Header */}
      <div className="sell-join-header">
        <div className="sell-join-header-nav">
          <button
            type="button"
            className="round-back-btn"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="sell-join-header-titles">
            <span className="welcome-kicker">SELLER SERVICES & CAREERS</span>
            <h1>List Property & Join Team</h1>
          </div>
        </div>

        {/* Value Proposition Badge Strip */}
        <div className="sell-join-trust-strip">
          <div className="trust-pill">
            <ShieldCheck size={14} className="trust-icon" />
            <span>Broker Verified Listings</span>
          </div>
          <div className="trust-pill">
            <Building2 size={14} className="trust-icon" />
            <span>United Country Network</span>
          </div>
          <div className="trust-pill">
            <Users size={14} className="trust-icon" />
            <span>Top Commission Splits</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="sell-join-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'list_property'}
            className={`sell-join-tab ${activeTab === 'list_property' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('list_property')}
          >
            <BadgeDollarSign size={15} />
            <span>List Property</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'submissions'}
            className={`sell-join-tab ${activeTab === 'submissions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <BadgeCheck size={15} />
            <span>Approval Status</span>
            {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'join_team'}
            className={`sell-join-tab ${activeTab === 'join_team' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('join_team')}
          >
            <Users size={15} />
            <span>Become an Agent</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="sell-join-body">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* TAB 1: LIST PROPERTY FOR SALE                                            */}
          {/* ========================================================================= */}
          {activeTab === 'list_property' && (
            <motion.div
              key="tab-list-property"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sell-join-tab-panel"
            >
              {/* Educational Broker Approval Banner */}
              <div className="broker-notice-card">
                <div className="broker-notice-icon-box">
                  <ShieldCheck size={24} />
                </div>
                <div className="broker-notice-content">
                  <h4>How Broker Approval Works</h4>
                  <p>
                    Under Arizona Real Estate law and brokerage standards, every submission is audited by{' '}
                    <strong>Designated Broker Rick Frank</strong>. We verify parcel records, legal access,
                    water rights, and market valuation before your listing goes live to buyers nationwide.
                  </p>
                  <div className="broker-workflow-mini">
                    <span className="step-tag active">1. Submit Details & Photos</span>
                    <ChevronRight size={13} className="step-arrow" />
                    <span className="step-tag">2. Broker Title & Parcel Audit</span>
                    <ChevronRight size={13} className="step-arrow" />
                    <span className="step-tag">3. Live on MLS & Arizona Life</span>
                  </div>
                </div>
              </div>

              {/* Submission Form */}
              <form className="property-listing-form" onSubmit={handleListingSubmit}>
                {/* 1. Property Basics */}
                <div className="form-card-section">
                  <div className="form-section-title">
                    <Building2 size={18} />
                    <h3>1. Property Details</h3>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="prop-title">
                      Listing Title / Headline <span className="req">*</span>
                    </label>
                    <input
                      id="prop-title"
                      type="text"
                      className={`form-input ${formErrors.includes('title') ? 'input-error' : ''}`}
                      placeholder="e.g. 20-Acre High Desert Sanctuary with Spectacular Mountain Views"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <small className="form-hint">Highlight key attributes: acreage, mountain views, or water.</small>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label" htmlFor="prop-type">Property Category</label>
                      <select
                        id="prop-type"
                        className="form-select"
                        value={propType}
                        onChange={(e) => setPropType(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" htmlFor="prop-price">
                        Asking Price ($) <span className="req">*</span>
                      </label>
                      <div className="input-currency-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                          id="prop-price"
                          type="number"
                          className={`form-input currency-input ${formErrors.includes('price') ? 'input-error' : ''}`}
                          placeholder="125,000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label" htmlFor="prop-county">County</label>
                      <select
                        id="prop-county"
                        className="form-select"
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                      >
                        {ARIZONA_COUNTIES.map((c) => (
                          <option key={c} value={c}>
                            {c} County, AZ
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" htmlFor="prop-city">City / Nearest Town</label>
                      <input
                        id="prop-city"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Saint David, Benson, Willcox"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="prop-address">
                      Street Address or APN / Parcel Number <span className="req">*</span>
                    </label>
                    <input
                      id="prop-address"
                      type="text"
                      className={`form-input ${formErrors.includes('address') ? 'input-error' : ''}`}
                      placeholder="e.g. 5782 E De Vaca Circle, or APN # 208-14-009"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <small className="form-hint">
                      For vacant parcels, the Cochise or Pima County APN allows the broker to verify title.
                    </small>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="prop-acres">
                      Total Acreage (Acres) <span className="req">*</span>
                    </label>
                    <input
                      id="prop-acres"
                      type="number"
                      step="0.01"
                      className={`form-input ${formErrors.includes('acres') ? 'input-error' : ''}`}
                      placeholder="e.g. 36.82 or 10.0"
                      value={acres}
                      onChange={(e) => setAcres(e.target.value)}
                    />
                  </div>

                  {/* Structure toggle */}
                  <div className="structure-toggle-box">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasStructure}
                        onChange={(e) => setHasStructure(e.target.checked)}
                      />
                      <span>Property has a Home, Cabin, or Structure on it</span>
                    </label>

                    {hasStructure && (
                      <motion.div
                        className="structure-details-grid"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="form-field-group">
                          <label className="form-label">Bedrooms</label>
                          <input
                            type="number"
                            className="form-input"
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                          />
                        </div>
                        <div className="form-field-group">
                          <label className="form-label">Bathrooms</label>
                          <input
                            type="number"
                            step="0.5"
                            className="form-input"
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                          />
                        </div>
                        <div className="form-field-group">
                          <label className="form-label">Sq Ft</label>
                          <input
                            type="number"
                            className="form-input"
                            value={sqft}
                            onChange={(e) => setSqft(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 2. Photo Upload Section */}
                <div className="form-card-section">
                  <div className="form-section-title">
                    <Camera size={18} />
                    <h3>2. Upload Property Photos <span className="req">*</span></h3>
                  </div>

                  <p className="section-instruction">
                    High-quality photos significantly accelerate broker review and attract serious buyers.
                    Upload views, boundary terrain, access roads, and structures.
                  </p>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  {/* Dropzone button */}
                  <div
                    className={`photo-dropzone ${formErrors.includes('images') && images.length === 0 ? 'dropzone-error' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon-circle">
                      <UploadCloud size={28} />
                    </div>
                    <strong>Click or drag photos to upload</strong>
                    <span>Supports JPG, PNG, WEBP (Multiple files allowed)</span>
                    <button
                      type="button"
                      className="upload-browse-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      Browse Device Photos
                    </button>
                  </div>

                  {/* Sample Photos Quick-Picker */}
                  <div className="sample-photos-box">
                    <div className="sample-photos-head">
                      <span>Or pick from Arizona property presets:</span>
                    </div>
                    <div className="sample-photos-scroll">
                      {SAMPLE_AZ_PHOTOS.map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          className="sample-photo-pill"
                          onClick={() => handleAddSamplePhoto(sample.url)}
                          title={`Add ${sample.name}`}
                        >
                          <img src={sample.url} alt={sample.name} />
                          <span>+ {sample.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gallery Grid of Uploaded Images */}
                  {images.length > 0 && (
                    <div className="uploaded-gallery-section">
                      <div className="gallery-header-row">
                        <span className="gallery-count">
                          <strong>{images.length}</strong> photo{images.length > 1 ? 's' : ''} attached
                        </span>
                        <button
                          type="button"
                          className="clear-photos-btn"
                          onClick={() => setImages([])}
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="uploaded-photos-grid">
                        {images.map((imgUrl, index) => (
                          <div key={index} className="uploaded-photo-card">
                            <img src={imgUrl} alt={`Property upload ${index + 1}`} />
                            {index === 0 && (
                              <span className="cover-badge">
                                <Sparkles size={11} /> Cover Photo
                              </span>
                            )}
                            <div className="photo-card-actions">
                              {index !== 0 && (
                                <button
                                  type="button"
                                  className="set-cover-btn"
                                  onClick={() => handleSetCoverPhoto(index)}
                                  title="Make Cover Photo"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                className="remove-photo-btn"
                                onClick={() => handleRemovePhoto(index)}
                                title="Remove photo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Features & Amenities */}
                <div className="form-card-section">
                  <div className="form-section-title">
                    <LandPlot size={18} />
                    <h3>3. Features & Amenities</h3>
                  </div>
                  <p className="section-instruction">
                    Select all attributes that apply to your parcel or home.
                  </p>

                  <div className="feature-chips-wrap">
                    {PROPERTY_FEATURE_OPTIONS.map((feat) => {
                      const isSelected = selectedFeatures.includes(feat)
                      return (
                        <button
                          key={feat}
                          type="button"
                          className={`feature-chip ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleToggleFeature(feat)}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{feat}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Description */}
                <div className="form-card-section">
                  <div className="form-section-title">
                    <FileText size={18} />
                    <h3>4. Property Description <span className="req">*</span></h3>
                  </div>
                  <textarea
                    rows={4}
                    className={`form-textarea ${formErrors.includes('description') ? 'input-error' : ''}`}
                    placeholder="Describe your parcel: views, terrain, road access, utilities, vegetation, wildlife, nearby Coronado Forest access, and why a buyer will love this land..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* 5. Seller Contact & Verification */}
                <div className="form-card-section">
                  <div className="form-section-title">
                    <UserCheck size={18} />
                    <h3>5. Seller & Ownership Verification</h3>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label" htmlFor="seller-name">
                        Owner / Representative Name <span className="req">*</span>
                      </label>
                      <input
                        id="seller-name"
                        type="text"
                        className={`form-input ${formErrors.includes('sellerName') ? 'input-error' : ''}`}
                        placeholder="Full Legal Name"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" htmlFor="seller-email">
                        Email Address <span className="req">*</span>
                      </label>
                      <input
                        id="seller-email"
                        type="email"
                        className={`form-input ${formErrors.includes('sellerEmail') ? 'input-error' : ''}`}
                        placeholder="you@example.com"
                        value={sellerEmail}
                        onChange={(e) => setSellerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="seller-phone">Phone Number</label>
                    <input
                      id="seller-phone"
                      type="tel"
                      className="form-input"
                      placeholder="(520) 555-0199"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                    />
                  </div>

                  <div
                    className={`legal-affirmation-box ${formErrors.includes('ownershipConfirmed') ? 'box-error' : ''}`}
                  >
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={ownershipConfirmed}
                        onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                      />
                      <span>
                        <strong>I declare under penalty of law</strong> that I am the legal owner of record or
                        authorized agent holding title / power of attorney for this property, and authorize
                        Arizona Life Homes and Land (United Country) to audit parcel records and prepare a
                        brokerage listing agreement.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    className="primary-button submit-listing-btn"
                    disabled={isSubmittingProp}
                  >
                    {isSubmittingProp ? (
                      <>
                        <RefreshCw size={18} className="spinner-icon" />
                        <span>Submitting for Broker Audit...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit for Broker Approval</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="submit-disclaimer">
                    <ShieldCheck size={14} /> No upfront fees. A licensed broker will contact you within 24–48 hours.
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BROKER APPROVAL STATUS & SUBMITTED PROPERTIES                     */}
          {/* ========================================================================= */}
          {activeTab === 'submissions' && (
            <motion.div
              key="tab-submissions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sell-join-tab-panel"
            >
              {/* Top Explainer */}
              <div className="approval-status-hero">
                <div className="approval-hero-left">
                  <span className="welcome-kicker">ADRE VERIFIED PROCESS</span>
                  <h2>Broker Approval Workflow</h2>
                  <p>
                    Every parcel on Arizona Life is verified by Designated Broker Rick Frank. Below you can
                    track your submitted properties in real time and test the broker approval simulation.
                  </p>
                </div>
                <div className="broker-avatar-badge">
                  <div className="broker-initials">RF</div>
                  <div>
                    <strong>Rick Frank</strong>
                    <span>Designated Broker · Southern AZ</span>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div className="submissions-list">
                {userPropertyListings.length === 0 ? (
                  <div className="empty-submissions-card">
                    <Building2 size={36} className="empty-icon" />
                    <h3>No Properties Submitted Yet</h3>
                    <p>
                      List your acreage, homestead, or ranch to have our broker team review it for sale.
                    </p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setActiveTab('list_property')}
                    >
                      <Plus size={16} /> List Your Property Now
                    </button>
                  </div>
                ) : (
                  userPropertyListings.map((listing) => {
                    const isApproved = listing.status === 'approved'

                    return (
                      <div
                        key={listing.id}
                        className={`submission-card ${isApproved ? 'is-approved-card' : ''}`}
                      >
                        {/* Status Header */}
                        <div className="submission-card-header">
                          <div className="submission-status-chip-row">
                            {isApproved ? (
                              <span className="status-badge approved">
                                <BadgeCheck size={14} /> Approved for Sale · Active MLS
                              </span>
                            ) : (
                              <span className="status-badge pending">
                                <Clock size={14} /> Pending Broker Review
                              </span>
                            )}
                            <span className="submission-date">Submitted: {listing.submittedAt}</span>
                          </div>

                          <button
                            type="button"
                            className="delete-sub-btn"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing submission?')) {
                                deleteUserPropertyListing(listing.id)
                                onNotify('Listing removed')
                              }
                            }}
                            title="Withdraw Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Card Content Row */}
                        <div className="submission-card-body">
                          <div className="submission-thumb-wrap">
                            <img
                              src={
                                listing.images[0] ||
                                'https://images.unsplash.com/photo-1602138759009-ca3386c95619?auto=format&fit=crop&w=600&q=80'
                              }
                              alt={listing.title}
                            />
                            <span className="submission-photo-count">
                              <Camera size={12} /> {listing.images.length}
                            </span>
                          </div>

                          <div className="submission-details">
                            <span className="submission-price">
                              ${listing.price.toLocaleString()}
                            </span>
                            <h4 className="submission-title">{listing.title}</h4>
                            <div className="submission-location">
                              <MapPin size={13} />
                              <span>
                                {listing.city}, {listing.county} County, AZ · {listing.acres} Acres
                              </span>
                            </div>

                            {listing.mlsNumber && (
                              <div className="mls-badge-row">
                                <span className="mls-label">MLS #</span>
                                <code>{listing.mlsNumber}</code>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Workflow Steps Indicator */}
                        <div className="workflow-steps-tracker">
                          <div className="tracker-step done">
                            <div className="tracker-dot">
                              <Check size={11} />
                            </div>
                            <span>Submitted</span>
                          </div>
                          <div className="tracker-line done" />

                          <div className="tracker-step done">
                            <div className="tracker-dot">
                              <Check size={11} />
                            </div>
                            <span>APN / Title Check</span>
                          </div>
                          <div className={`tracker-line ${isApproved ? 'done' : ''}`} />

                          <div className={`tracker-step ${isApproved ? 'done' : 'active'}`}>
                            <div className="tracker-dot">
                              {isApproved ? <Check size={11} /> : <Compass size={11} />}
                            </div>
                            <span>Broker Sign-Off</span>
                          </div>
                          <div className={`tracker-line ${isApproved ? 'done' : ''}`} />

                          <div className={`tracker-step ${isApproved ? 'done' : ''}`}>
                            <div className="tracker-dot">
                              {isApproved ? <Check size={11} /> : <BadgeCheck size={11} />}
                            </div>
                            <span>Live on Market</span>
                          </div>
                        </div>

                        {/* Broker Feedback / Notes Box */}
                        <div className="broker-feedback-box">
                          <div className="broker-feedback-top">
                            <div className="broker-avatar-mini">RF</div>
                            <div className="broker-feedback-meta">
                              <strong>{listing.assignedBroker}</strong>
                              <span>Broker Audit Notes</span>
                            </div>
                          </div>
                          <p className="broker-note-text">
                            {listing.brokerNotes ||
                              'Parcel GIS check in progress. Title examination underway.'}
                          </p>
                        </div>

                        {/* Interactive Demo Simulation Controls */}
                        <div className="submission-actions-row">
                          <div className="simulation-tag">
                            <Sparkles size={13} />
                            <span>Broker Action Simulation:</span>
                          </div>

                          <button
                            type="button"
                            className={`sim-approve-btn ${isApproved ? 'is-revert' : ''}`}
                            onClick={() => handleSimulateBrokerApproval(listing)}
                          >
                            {isApproved ? (
                              <>
                                <RefreshCw size={14} /> Revert to Review (Demo)
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} /> Approve Property (Broker Sign-Off)
                              </>
                            )}
                          </button>

                          {isApproved && (
                            <button
                              type="button"
                              className="view-live-listing-btn"
                              onClick={() => {
                                onNotify(`Listing is active! MLS #${listing.mlsNumber}`)
                                navigate('/')
                              }}
                            >
                              <span>View Marketplace</span>
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BECOME AN AGENT / JOIN OUR TEAM                                    */}
          {/* ========================================================================= */}
          {activeTab === 'join_team' && (
            <motion.div
              key="tab-join-team"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sell-join-tab-panel"
            >
              {/* Career Banner */}
              <div className="careers-hero-card">
                <div className="careers-hero-content">
                  <span className="welcome-kicker">GROW YOUR REAL ESTATE CAREER</span>
                  <h2>Join Arizona Life Homes & Land</h2>
                  <p>
                    A premier United Country Real Estate office serving Southern Arizona. Whether you are a
                    licensed agent, an associate broker, or studying for your Arizona real estate exam, partner
                    with the nation’s #1 lifestyle and rural real estate franchise since 1925.
                  </p>
                </div>
              </div>

              {/* Value Proposition Grid */}
              <div className="careers-perks-grid">
                <div className="perk-card">
                  <div className="perk-icon-wrap">
                    <Building2 size={20} />
                  </div>
                  <h4>#1 National Brand</h4>
                  <p>Tap into United Country’s 100-year legacy and national buyer marketing reach.</p>
                </div>

                <div className="perk-card">
                  <div className="perk-icon-wrap">
                    <DollarSign size={20} />
                  </div>
                  <h4>Top Commission Splits</h4>
                  <p>Competitive commission plans with zero hidden desk fees or unnecessary overhead.</p>
                </div>

                <div className="perk-card">
                  <div className="perk-icon-wrap">
                    <LandPlot size={20} />
                  </div>
                  <h4>Exclusive Land Leads</h4>
                  <p>Receive pre-qualified land, homestead, and ranch buyer inquiries directly.</p>
                </div>

                <div className="perk-card">
                  <div className="perk-icon-wrap">
                    <Sparkles size={20} />
                  </div>
                  <h4>1-on-1 Mentorship</h4>
                  <p>Hands-on guidance from Broker Rick Frank on deeds, water rights, and rural escrow.</p>
                </div>
              </div>

              {/* Direct Broker Contact Card */}
              <div className="recruiter-contact-card">
                <div className="recruiter-left">
                  <div className="recruiter-avatar">RF</div>
                  <div>
                    <strong>Rick Frank</strong>
                    <span>Designated Broker · Arizona Life Homes & Land</span>
                    <small>Direct broker line: (520) 403-3903</small>
                  </div>
                </div>
                <div className="recruiter-actions">
                  <a href="tel:+15204033903" className="recruiter-btn phone-btn">
                    <Phone size={14} /> Call Broker
                  </a>
                  <a href="mailto:rick@arizonalifehomes.com" className="recruiter-btn email-btn">
                    <Mail size={14} /> Email
                  </a>
                </div>
              </div>

              {/* Application Form */}
              <div className="career-application-card">
                <div className="career-card-head">
                  <Users size={20} />
                  <div>
                    <h3>Agent & Broker Application</h3>
                    <p>Tell us about your background and goals in Southern Arizona real estate.</p>
                  </div>
                </div>

                {currentUser ? (
                  <div className="auth-account-badge">
                    <span>Applying as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
                  </div>
                ) : onAuthRequest ? (
                  <div className="auth-account-prompt">
                    <span>Already have an Arizona Life profile?</span>
                    <button type="button" className="auth-inline-btn" onClick={onAuthRequest}>
                      Sign in to auto-fill details
                    </button>
                  </div>
                ) : null}

                {appSubmittedSuccess ? (
                  <div className="application-success-box">
                    <CheckCircle2 size={42} className="success-check-icon" />
                    <h3>Application Submitted Successfully!</h3>
                    <p>
                      Thank you, <strong>{agentName}</strong>. Broker Rick Frank will review your
                      credentials and contact you at <strong>{agentEmail}</strong> to schedule an
                      introductory conversation.
                    </p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setAppSubmittedSuccess(false)}
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form className="agent-form" onSubmit={handleAgentSubmit}>
                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-name">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          id="agent-name"
                          type="text"
                          className="form-input"
                          placeholder="Your Name"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-email">
                          Email Address <span className="req">*</span>
                        </label>
                        <input
                          id="agent-email"
                          type="email"
                          className="form-input"
                          placeholder="you@example.com"
                          value={agentEmail}
                          onChange={(e) => setAgentEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-phone">Phone Number</label>
                        <input
                          id="agent-phone"
                          type="tel"
                          className="form-input"
                          placeholder="(520) 555-0142"
                          value={agentPhone}
                          onChange={(e) => setAgentPhone(e.target.value)}
                        />
                      </div>

                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-role">Current Status / License</label>
                        <select
                          id="agent-role"
                          className="form-select"
                          value={roleInterest}
                          onChange={(e) =>
                            setRoleInterest(e.target.value as TeamApplication['roleInterest'])
                          }
                        >
                          <option value="salesperson">Licensed AZ Real Estate Agent</option>
                          <option value="associate_broker">Licensed AZ Associate Broker</option>
                          <option value="student">Currently in AZ Real Estate School</option>
                          <option value="new_to_real_estate">New to Real Estate / Seeking License</option>
                          <option value="referral_partner">Referral Partner / Regional Broker</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-lic-num">
                          AZ License # (if active)
                        </label>
                        <input
                          id="agent-lic-num"
                          type="text"
                          className="form-input"
                          placeholder="e.g. SA689210000 or In Progress"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                        />
                      </div>

                      <div className="form-field-group">
                        <label className="form-label" htmlFor="agent-exp">Years of Experience</label>
                        <select
                          id="agent-exp"
                          className="form-select"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                        >
                          <option value="0-1 years">0 - 1 years (New or in School)</option>
                          <option value="2-5 years">2 - 5 years</option>
                          <option value="5-10 years">5 - 10 years</option>
                          <option value="10+ years">10+ years (Experienced Broker)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" htmlFor="agent-terr">Primary Territory of Interest</label>
                      <input
                        id="agent-terr"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Cochise County, Tucson / Pima, Santa Cruz, Graham"
                        value={targetTerritory}
                        onChange={(e) => setTargetTerritory(e.target.value)}
                      />
                    </div>

                    {/* Specialties */}
                    <div className="form-field-group">
                      <label className="form-label">Specialties & Passions</label>
                      <div className="feature-chips-wrap">
                        {[
                          'Land & Acreage',
                          'Country Homes',
                          'Equestrian & Horse Ranches',
                          'Off-Grid & Homesteads',
                          'Commercial & Investment',
                          'Auctions & Large Tracts',
                        ].map((spec) => {
                          const isSel = agentSpecialties.includes(spec)
                          return (
                            <button
                              key={spec}
                              type="button"
                              className={`feature-chip ${isSel ? 'is-selected' : ''}`}
                              onClick={() => handleToggleSpecialty(spec)}
                            >
                              {isSel && <Check size={12} />}
                              <span>{spec}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" htmlFor="agent-msg">
                        Why Arizona Life Homes & Land? (Brief note or background)
                      </label>
                      <textarea
                        id="agent-msg"
                        rows={3}
                        className="form-textarea"
                        placeholder="Tell us what motivates you, what markets you know best, and what you’re looking for in your brokerage team..."
                        value={agentMessage}
                        onChange={(e) => setAgentMessage(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="primary-button submit-agent-btn"
                      disabled={isSubmittingApp}
                    >
                      {isSubmittingApp ? (
                        <>
                          <RefreshCw size={18} className="spinner-icon" />
                          <span>Sending Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application to Broker</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Submitted Applications History Tracker */}
              {teamApplications.length > 0 && (
                <div className="submitted-apps-card">
                  <div className="submitted-apps-head">
                    <BadgeCheck size={16} />
                    <h4>Your Submitted Team Inquiries ({teamApplications.length})</h4>
                  </div>
                  <div className="submitted-apps-list">
                    {teamApplications.map((app) => (
                      <div key={app.id} className="submitted-app-item">
                        <div className="app-item-top">
                          <strong>{app.fullName}</strong>
                          <span className="app-status-pill">{app.status.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="app-item-role">
                          Role: {app.roleInterest.replace(/_/g, ' ')} · {app.experienceYears} · {app.targetTerritory}
                        </span>
                        {app.brokerFeedback && (
                          <div className="app-feedback-bubble">
                            <small>Broker Note: {app.brokerFeedback}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
