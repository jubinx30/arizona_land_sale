import React from 'react'
import { motion } from 'framer-motion'

export type TabId = 'type' | 'location' | 'price'

export type TabOption = {
  id: TabId
  label: string
}

const TABS: TabOption[] = [
  { id: 'type', label: 'Type' },
  { id: 'location', label: 'Location' },
  { id: 'price', label: 'Price' },
]

type SegmentedControlProps = {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ activeTab, onChange }) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % TABS.length
      onChange(TABS[nextIndex].id)
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + TABS.length) % TABS.length
      onChange(TABS[prevIndex].id)
    }
  }

  return (
    <div
      className="fyp-segmented-control-wrap"
      role="tablist"
      aria-label="Filter category tabs"
    >
      <div className="fyp-segmented-control">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              id={`fyp-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`fyp-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`fyp-tab-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              {isActive && (
                <motion.div
                  layoutId="fyp-active-pill"
                  className="fyp-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="fyp-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SegmentedControl

