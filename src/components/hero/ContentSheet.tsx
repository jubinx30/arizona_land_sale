import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react'
import StatStrip from './StatStrip'
import ContinueCard from './ContinueCard'
import { useAppStore } from '../../store/useAppStore'

interface ContentSheetProps {
  children: ReactNode
  onNotify?: (message: string) => void
  search?: string
  onSearch?: (value: string) => void
  onFilters?: () => void
  sort?: string
  onSortOpen?: () => void
}

/**
 * ContentSheet wraps the content below the hero carousel in a visual bottom sheet surface
 * that overlaps the bottom edge of the carousel by ~28px.
 * Features a top grabber handle, live personal stat strip, search bar with filter, featured,
 * and quick tags, continue browsing card, and hosts the Featured Properties and subsequent content sections.
 */
export default function ContentSheet({
  children,
  onNotify,
  search = '',
  onSearch,
  onFilters,
  sort = 'Featured',
  onSortOpen,
}: ContentSheetProps) {
  const navigate = useNavigate()
  const [prevSearch, setPrevSearch] = useState(search)
  const [inputValue, setInputValue] = useState(search)
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

  if (prevSearch !== search) {
    setPrevSearch(search)
    setInputValue(search)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = inputValue.trim()
    if (onSearch) {
      onSearch(query)
    }
    navigate('/search')
  }

  const handleTagClick = (tag: string) => {
    const nextValue = search.toLowerCase() === tag.toLowerCase() ? '' : tag
    if (onSearch) {
      onSearch(nextValue)
    }
    navigate('/search')
  }

  return (
    <div className="content-sheet-surface" role="region" aria-label="Main content sheet">
      {/* Visual grabber handle indicator (36x4px rounded) */}
      <div className="content-sheet-grabber" aria-hidden="true" />

      {/* Change 5: Live personal stat strip */}
      <StatStrip onNotify={onNotify} />

      {/* Search bar with filter, featured buttons on right side and quick tags */}
      <div className="sheet-search-wrap">
        <div className="search-bar-row">
          <form
            className="heading-searchbar"
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Search properties"
          >
            <button
              type="submit"
              className="heading-search-icon heading-search-btn"
              aria-label="Submit search"
              title="Search"
            >
              <Search size={16} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search city, county, title..."
              aria-label="Search properties"
            />
            {inputValue && (
              <button
                type="button"
                className="heading-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setInputValue('')
                  if (onSearch) onSearch('')
                  if (onNotify) onNotify('Search cleared')
                }}
              >
                <X size={15} />
              </button>
            )}
          </form>

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
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Change 5: Continue where you left off mini card */}
      <ContinueCard />

      {/* Children content (Featured Properties section, etc.) */}
      {children}
    </div>
  )
}
