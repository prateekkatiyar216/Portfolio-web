import { motion } from 'motion/react'
import { useItemVariants } from './Reveal.jsx'
import { cn } from '../utils/format.js'

/**
 * The site's single card surface.
 *  - `interactive`: lifts on hover and the border warms up with a soft glow.
 *                   Pure CSS (`translate` + an opacity-faded shadow), so hovers
 *                   never run JavaScript or repaint the card per frame.
 *  - `lift`:        hover lift in px (default 4)
 *  - `staggered`:   participates in a parent <StaggerGroup> entrance
 *                   (`staggered="fast"` inside a `<StaggerGroup fast>`)
 */
export default function Card({ as = 'div', interactive = false, staggered = false, lift = 4, className, style, children, ...props }) {
  const Component = motion[as] ?? motion.div
  const items = useItemVariants(staggered === 'fast' ? 'fast' : 'base')
  return (
    <Component
      variants={staggered ? items : undefined}
      className={cn('card', interactive && 'card-interactive', className)}
      style={interactive ? { '--card-lift': `-${lift}px`, ...style } : style}
      {...props}
    >
      {children}
    </Component>
  )
}
