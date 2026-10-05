import { motion } from 'motion/react'
import { hoverLift, stagger } from './Reveal.jsx'
import { cn } from '../utils/format.js'

/**
 * The site's single card surface.
 *  - `interactive`: lifts on hover and the border warms up with a soft glow
 *  - `staggered`:   participates in a parent <StaggerGroup> entrance
 */
export default function Card({ as = 'div', interactive = false, staggered = false, className, children, ...props }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      variants={staggered ? stagger.item : undefined}
      whileHover={interactive ? hoverLift : undefined}
      className={cn('card', interactive && 'card-interactive', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
