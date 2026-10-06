import { motion } from 'motion/react'
import { hoverLift, stagger, staggerFast } from './Reveal.jsx'
import { cn } from '../utils/format.js'

/**
 * The site's single card surface.
 *  - `interactive`: lifts on hover and the border warms up with a soft glow
 *  - `staggered`:   participates in a parent <StaggerGroup> entrance
 *                   (`staggered="fast"` inside a `<StaggerGroup fast>`)
 *  - `lift`:        override the hover motion (e.g. translate-only for project cards)
 */
export default function Card({ as = 'div', interactive = false, staggered = false, lift, className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  const variants = staggered === 'fast' ? staggerFast.item : staggered ? stagger.item : undefined
  return (
    <Component
      variants={variants}
      whileHover={interactive ? (lift ?? hoverLift) : undefined}
      className={cn('card', interactive && 'card-interactive', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
