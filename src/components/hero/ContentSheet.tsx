import type { ReactNode } from 'react'
import StatStrip from './StatStrip'
import ContinueCard from './ContinueCard'

interface ContentSheetProps {
  children: ReactNode
  onNotify?: (message: string) => void
}

/**
 * ContentSheet wraps the content below the hero carousel in a visual bottom sheet surface
 * that overlaps the bottom edge of the carousel by ~28px.
 * Features a top grabber handle, live personal stat strip, continue browsing card,
 * and hosts the Featured Properties and subsequent content sections.
 */
export default function ContentSheet({ children, onNotify }: ContentSheetProps) {
  return (
    <div className="content-sheet-surface" role="region" aria-label="Main content sheet">
      {/* Visual grabber handle indicator (36x4px rounded) */}
      <div className="content-sheet-grabber" aria-hidden="true" />

      {/* Change 5: Live personal stat strip */}
      <StatStrip onNotify={onNotify} />

      {/* Change 5: Continue where you left off mini card */}
      <ContinueCard />

      {/* Children content (Featured Properties section, etc.) */}
      {children}
    </div>
  )
}
