import React from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Compass,
  DollarSign,
  House,
  LandPlot,
  Trees,
} from 'lucide-react'

export type ChipItem = {
  name: string
  category: string
  count: number
}

type ChipRowProps = {
  chips: ChipItem[]
  isLoading?: boolean
  isError?: boolean
  onSelect: (category: string) => void
  onExploreAll: () => void
}

const getIconForType = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('equine') || lower.includes('horse')) return <Compass size={15} />
  if (lower.includes('home')) return <House size={15} />
  if (lower.includes('financing')) return <DollarSign size={15} />
  if (lower.includes('investment')) return <LandPlot size={15} />
  if (lower.includes('commercial')) return <Building2 size={15} />
  if (lower.includes('recreational')) return <Trees size={15} />
  return <BadgeCheck size={15} />
}

export const ChipRow: React.FC<ChipRowProps> = ({
  chips,
  isLoading = false,
  isError = false,
  onSelect,
  onExploreAll,
}) => {
  if (isLoading) {
    return (
      <div className="fyp-chip-scroller" aria-label="Loading property categories">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="fyp-pill-chip fyp-skeleton-chip" />
        ))}
      </div>
    )
  }

  // Filter out items with 0 counts unless error state
  const visibleChips = chips.filter((chip) => isError || chip.count > 0)

  return (
    <div
      className="fyp-chip-scroller"
      role="region"
      aria-label="Additional property types"
      tabIndex={0}
    >
      <div className="fyp-chip-row">
        {visibleChips.map((chip) => (
          <button
            key={chip.category}
            type="button"
            className="fyp-pill-chip"
            onClick={() => onSelect(chip.category)}
            aria-label={`${chip.name}${!isError && chip.count > 0 ? `, ${chip.count} listings` : ''}`}
          >
            <span className="fyp-chip-icon" aria-hidden="true">
              {getIconForType(chip.name)}
            </span>
            <span className="fyp-chip-name">{chip.name}</span>
            {!isError && chip.count > 0 && (
              <span className="fyp-chip-badge">{chip.count}</span>
            )}
          </button>
        ))}

        <button
          type="button"
          className="fyp-pill-chip fyp-explore-all-chip"
          onClick={onExploreAll}
          aria-label="Explore all property types"
        >
          <span className="fyp-chip-name">Explore all</span>
          <span className="fyp-chip-icon" aria-hidden="true">
            <ArrowRight size={14} />
          </span>
        </button>
      </div>
    </div>
  )
}

export default ChipRow

