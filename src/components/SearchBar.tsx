import { useEffect, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { cities } from '../data/properties'
import { useAppStore } from '../store/useAppStore'

type Props = { onSearch: (value: string) => void; onFilters: () => void; compact?: boolean }

export default function SearchBar({ onSearch, onFilters, compact = false }: Props) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const recent = useAppStore((state) => state.recentSearches)
  const suggestions = [...cities, 'Cochise County', '02034-521731'].filter((item) => !query || item.toLowerCase().includes(query.toLowerCase())).slice(0, 4)

  useEffect(() => {
    if (!query.trim()) return
    const timer = window.setTimeout(() => onSearch(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query, onSearch])

  function choose(value: string) {
    setQuery(value)
    setShowSuggestions(false)
    onSearch(value)
  }

  return (
    <div className={`searchbar ${compact ? 'searchbar--compact' : ''}`}>
      <div className="search-input-wrap">
        <Search size={18} />
        <input aria-label="Search properties" placeholder="Search city, county, address…" value={query} onFocus={() => setShowSuggestions(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && choose(query)} />
        {query && <button className="clear-search" aria-label="Clear search" onClick={() => { setQuery(''); setShowSuggestions(false); onSearch('') }}><X size={15} /></button>}
        {showSuggestions && <div className="suggestion-popover">
          {query ? suggestions.map((item) => <button key={item} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)}><MapPin size={15} />{item}</button>) : recent.length ? <><div className="suggestion-heading">Recent searches</div>{recent.map((item) => <button key={item} onClick={() => choose(item)}><MapPin size={15} />{item}</button>)}</> : <div className="suggestion-heading">Try “Benson” or a listing number</div>}
        </div>}
      </div>
      <button className="search-submit" onClick={() => { setShowSuggestions(false); onSearch(query) }}>Search</button>
      {!compact && <button className="filter-button" onClick={onFilters}>Filters</button>}
    </div>
  )
}
