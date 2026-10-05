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

const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' }

/** Fades + lifts its content in once, when scrolled into view. */
export default function Reveal({ as = 'div', delay = 0, y = 30, className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
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

export function StaggerGroup({ as = 'div', className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component variants={stagger.container} initial="hidden" whileInView="show" viewport={VIEWPORT} className={className} {...props}>
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
