import { useEffect, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'

/**
 * Returns the id of the section currently crossing the middle band of the
 * viewport. Uses a single IntersectionObserver; the "back at the top" reset
 * reads Motion's shared scroll value rather than adding a window listener.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  const key = ids.join('|')
  const { scrollY } = useScroll()

  // Top of page: nothing is "active" (hero is not a nav item).
  useMotionValueEvent(scrollY, 'change', (y) => y < 120 && setActive(null))

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [key])

  return active
}
