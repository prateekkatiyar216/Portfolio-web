import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

/**
 * Counts from 0 to `value` once it scrolls into view. Static for reduced-motion users.
 * Frames write straight to the text node — no React re-render per frame.
 * The final value is rendered from the start, so it is correct without JS / for screen readers.
 */
export default function CountUp({ value, duration = 1.4 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!inView || reduce || !el) return
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => {
      controls.stop()
      el.textContent = String(value)
    }
  }, [inView, reduce, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}
