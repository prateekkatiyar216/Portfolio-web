import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently crossing the middle band of the
 * viewport. Uses a single IntersectionObserver — no scroll listeners.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  const key = ids.join('|')

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

    // Top of page: nothing is "active" (hero is not a nav item).
    const onTop = () => window.scrollY < 120 && setActive(null)
    window.addEventListener('scroll', onTop, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onTop)
    }
  }, [key])

  return active
}
