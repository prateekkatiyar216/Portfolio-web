import { motion } from 'motion/react'

/*
 * Shared motion tokens — every animation on the site uses these so the
 * whole page moves with one rhythm. Reduced-motion users get opacity-only
 * fades (see <MotionConfig reducedMotion="user"> in App.jsx).
 */
export const EASE = [0.22, 1, 0.36, 1]
export const DURATION = { fast: 0.2, base: 0.6, slow: 0.9 }
export const SPRING = { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }

/** Card hover: lift + slight scale (border/glow comes from the `card-interactive` CSS utility). */
export const hoverLift = { y: -4, scale: 1.01, transition: SPRING }

export const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' }

/*
 * Motion personalities — each section moves in its own way:
 *   rise        default fade + lift
 *   editorial   About: slow, long fade, barely any travel
 *   directional Experience: enters from the timeline side
 *   fast        Skills: short and snappy
 *   calm        Contact: opacity only
 */
export const PRESETS = {
  rise: { from: { opacity: 0, y: 30 }, transition: { duration: DURATION.base, ease: EASE } },
  editorial: { from: { opacity: 0, y: 14 }, transition: { duration: 1.2, ease: EASE } },
  directional: { from: { opacity: 0, x: -28 }, transition: { duration: 0.75, ease: EASE } },
  fast: { from: { opacity: 0, y: 12 }, transition: { duration: 0.35, ease: EASE } },
  calm: { from: { opacity: 0 }, transition: { duration: 1.1, ease: 'easeOut' } },
}

/** Fades its content in once, when scrolled into view, using a motion preset. */
export default function Reveal({ as = 'div', preset = 'rise', delay = 0, y, className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  const { from, transition } = PRESETS[preset] ?? PRESETS.rise
  const initial = y === undefined ? from : { ...from, y }
  const settled = Object.fromEntries(Object.keys(initial).map((k) => [k, k === 'opacity' ? 1 : 0]))
  return (
    <Component
      initial={initial}
      whileInView={settled}
      viewport={VIEWPORT}
      transition={{ ...transition, delay }}
      className={className}
      {...props}
    >
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
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  },
}

/** Snappier stagger for dense grids (Skills). */
export const staggerFast = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.035 } } },
  item: {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } },
  },
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
  return (
    <Component variants={stagger.item} className={className} {...props}>
      {children}
    </Component>
  )
}
