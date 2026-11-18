import type { CSSProperties, ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Reusable frosted glass panel component for hero cards.
 * Inset 10-12px from the card edges with concentric 18px radius,
 * backdrop blur, translucent fill, and soft inner highlight.
 */
export default function GlassPanel({ children, className = '', style }: GlassPanelProps) {
  return (
    <div className={`hero-glass-panel ${className}`} style={style}>
      {children}
    </div>
  )
}
