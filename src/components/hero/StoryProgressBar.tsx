interface StoryProgressBarProps {
  total: number
  activeIndex: number
  progress: number // 0 to 1 for active segment
}

/**
 * StoryProgressBar renders an Instagram-story style segmented progress bar
 * pinned inside the hero card at the top.
 */
export default function StoryProgressBar({ total, activeIndex, progress }: StoryProgressBarProps) {
  return (
    <div
      className="hero-story-progress"
      role="progressbar"
      aria-label={`Slide ${activeIndex + 1} of ${total}`}
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => {
        let fillWidth = '0%'
        if (i < activeIndex) {
          fillWidth = '100%'
        } else if (i === activeIndex) {
          fillWidth = `${Math.min(100, Math.max(0, progress * 100))}%`
        }

        return (
          <div key={i} className="hero-story-segment">
            <div
              className="hero-story-fill"
              style={{
                width: fillWidth,
                transition: i === activeIndex ? 'width 0.1s linear' : 'none',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
