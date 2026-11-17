import React from 'react'

type SectionHeaderProps = {
  eyebrow?: string
  title?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow = 'MAKE IT YOUR OWN',
  title = 'Find your kind of place',
}) => {
  return (
    <div className="fyp-section-header">
      {eyebrow && <span className="welcome-kicker fyp-eyebrow">{eyebrow}</span>}
      <h2 className="fyp-title">{title}</h2>
      <div className="heading-underline fyp-underline" aria-hidden="true" />
    </div>
  )
}

export default SectionHeader

