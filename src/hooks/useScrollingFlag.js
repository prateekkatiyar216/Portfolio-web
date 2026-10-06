import { useEffect } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'

let timer = 0

/**
 * Sets `data-scrolling` on <html> while the page is actively scrolling and
 * clears it ~150ms after the last scroll frame. index.css disables pointer
 * hit-testing during that window, so cards sliding under a stationary cursor
 * don't fire hover lifts / border transitions mid-scroll (a major source of
 * scroll-time repaints). Reuses Motion's shared scroll value; no React state.
 */
export function useScrollingFlag(idleMs = 150) {
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', () => {
    const root = document.documentElement
    if (!root.hasAttribute('data-scrolling')) root.setAttribute('data-scrolling', '')
    clearTimeout(timer)
    timer = setTimeout(() => root.removeAttribute('data-scrolling'), idleMs)
  })
  useEffect(() => () => clearTimeout(timer), [])
}
