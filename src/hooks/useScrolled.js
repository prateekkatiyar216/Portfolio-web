import { useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'

/**
 * True once the page has scrolled past `threshold` px.
 * Reads Motion's shared, frame-batched scroll value instead of adding another
 * window scroll listener; React only re-renders when the boolean flips.
 */
export function useScrolled(threshold = 12) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > threshold))
  return scrolled
}
