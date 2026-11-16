import { useEffect, useRef, type ReactNode } from 'react'

interface SlidableScrollerProps {
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export default function SlidableScroller({
  children,
  className = 'featured-scroller',
  ariaLabel = 'Featured properties slider',
}: SlidableScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    // Smooth horizontal scrolling on mouse wheel for PC browsers
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) return

      const canLeft = el.scrollLeft > 2
      const canRight = el.scrollLeft < maxScroll - 2

      if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY * 0.9
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  // Mouse / Pointer drag handling for PC and non-touch devices
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    if (e.button !== 0) return

    const scroller = scrollerRef.current
    if (!scroller) return

    isDownRef.current = true
    startXRef.current = e.pageX
    scrollLeftRef.current = scroller.scrollLeft
    isDraggingRef.current = false

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDownRef.current || !scroller) return
      const dx = moveEvent.pageX - startXRef.current

      if (Math.abs(dx) > 4) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true
          scroller.classList.add('is-pointer-dragging')
          scroller.style.scrollSnapType = 'none'
          scroller.style.scrollBehavior = 'auto'
        }
        scroller.scrollLeft = scrollLeftRef.current - dx
      }
    }

    const onPointerUp = () => {
      isDownRef.current = false

      if (scroller) {
        scroller.classList.remove('is-pointer-dragging')
        scroller.style.scrollSnapType = ''
        scroller.style.scrollBehavior = ''
      }

      if (isDraggingRef.current) {
        // Suppress card click navigation that triggers immediately after mouse drag release
        const captureClick = (clickEvent: MouseEvent) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
          clickEvent.stopImmediatePropagation()
        }

        window.addEventListener('click', captureClick, { capture: true, once: true })
        window.setTimeout(() => {
          window.removeEventListener('click', captureClick, { capture: true })
          isDraggingRef.current = false
        }, 50)
      }

      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <div
      ref={scrollerRef}
      className={className}
      onPointerDown={handlePointerDown}
      role="region"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
