import { motion, useReducedMotion } from 'motion/react'

/*
 * Shared motion tokens — every animation on the site uses these so the
 * whole page moves with one rhythm.
 *
 * Performance: entrances animate the full `transform` property (not x / y),
 * which Motion hands to the browser's compositor (WAAPI), so section reveals
 * cost no main-thread work per frame. Hover lifts are plain CSS `translate`
 * (see the `card-interactive` utility), which composes with that transform.
 *
 * Reduced motion: Motion only auto-reduces x / y / scale, not `transform`, so
 * `calm()` strips transforms here and reduced-motion users get opacity fades.
 */
export const EASE = [0.22, 1, 0.36, 1]
export const DURATION = { fast: 0.2, base: 0.55, slow: 0.9 }

export const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' }

/** Builds a translate/scale transform string with a fixed structure, so start and end interpolate on the compositor. */
export const tf = ({ x = 0, y = 0, scale = 1 } = {}) =>
  `translate3d(${typeof x === 'number' ? `${x}px` : x}, ${typeof y === 'number' ? `${y}px` : y}, 0) scale(${scale})`
export const TF_REST = tf()

/** Remove `transform` from a target (or every target of a variants object) for reduced-motion users. */
export function calm(target) {
  if (!target || typeof target !== 'object') return target
  const { transform: _drop, ...rest } = target
  return rest
}
export const calmVariants = (variants) => Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, calm(v)]))

/*
 * Motion personalities — each section moves in its own way:
 *   rise        default fade + lift
 *   editorial   About: slow, long fade, barely any travel
 *   directional Experience: enters from the timeline side
 *   fast        Skills: short and snappy
 *   calm        Contact: opacity only
 */
export const PRESETS = {
  rise: { from: { opacity: 0, transform: tf({ y: 24 }) }, transition: { duration: DURATION.base, ease: EASE } },
  editorial: { from: { opacity: 0, transform: tf({ y: 14 }) }, transition: { duration: 0.9, ease: EASE } },
  directional: { from: { opacity: 0, transform: tf({ x: -24 }) }, transition: { duration: 0.6, ease: EASE } },
  fast: { from: { opacity: 0, transform: tf({ y: 12 }) }, transition: { duration: 0.35, ease: EASE } },
  calm: { from: { opacity: 0 }, transition: { duration: 0.9, ease: 'easeOut' } },
}

/** Fades its content in once, when scrolled into view, using a motion preset. */
export default function Reveal({ as = 'div', preset = 'rise', delay = 0, className, children, ...props }) {
  const reduce = useReducedMotion()
  const Component = motion[as] ?? motion.div
  const { from, transition } = PRESETS[preset] ?? PRESETS.rise
  const initial = reduce ? calm(from) : from
  const settled = 'transform' in initial ? { opacity: 1, transform: TF_REST } : { opacity: 1 }
  return (
    <Component initial={initial} whileInView={settled} viewport={VIEWPORT} transition={{ ...transition, delay }} className={className} {...props}>
      {children}
    </Component>
  )
}

/** Container + item variants for staggered grids (45 ms between items). */
export const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.045 } },
  },
  item: {
    hidden: { opacity: 0, transform: tf({ y: 20 }) },
    show: { opacity: 1, transform: TF_REST, transition: { duration: 0.5, ease: EASE } },
  },
}

/** Snappier stagger for dense grids (Skills). */
export const staggerFast = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.035 } } },
  item: {
    hidden: { opacity: 0, transform: tf({ y: 12, scale: 0.98 }) },
    show: { opacity: 1, transform: TF_REST, transition: { duration: 0.35, ease: EASE } },
  },
}

/** Item variants for a stagger flavour, reduced to opacity when the user asks for less motion. */
export function useItemVariants(kind = 'base') {
  const reduce = useReducedMotion()
  const item = (kind === 'fast' ? staggerFast : stagger).item
  return reduce ? calmVariants(item) : item
}

export function StaggerGroup({ as = 'div', fast = false, className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      variants={(fast ? staggerFast : stagger).container}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ as = 'div', className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  const variants = useItemVariants()
  return (
    <Component variants={variants} className={className} {...props}>
      {children}
    </Component>
  )
}
