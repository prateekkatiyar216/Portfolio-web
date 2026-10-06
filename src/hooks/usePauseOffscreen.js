import { useEffect } from 'react'

/**
 * Marks top-level page sections that are out of view with `data-offscreen`;
 * index.css pauses every CSS animation inside them. One observer, no React state.
 */
export function usePauseOffscreen() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
      { rootMargin: '200px 0px' },
    )
    document.querySelectorAll('main > section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
