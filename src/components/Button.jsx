import { motion } from 'motion/react'
import { EASE } from './Reveal.jsx'
import { cn } from '../utils/format.js'

const VARIANTS = {
  // Warm fill with a hairline top highlight; the glow deepens on hover.
  primary:
    'bg-accent text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_30px_-12px_var(--primary-glow)] hover:bg-accent-hover hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_16px_38px_-12px_rgb(214_170_141/0.45)]',
  // Dark, translucent, warm border — reads as the clear second choice.
  secondary:
    'border border-accent/30 bg-bg/40 text-fg backdrop-blur-sm hover:border-accent/70 hover:bg-accent/[0.07] hover:text-accent',
  ghost: 'text-muted hover:bg-accent/10 hover:text-accent',
}

const SIZES = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-[0.9375rem] gap-2',
}

// Buttons use a short tween (not a spring): crisp, ~250ms, no overshoot.
const HOVER = { y: -2, scale: 1.015, transition: { duration: 0.25, ease: EASE } }
const TAP = { y: 0, scale: 0.98, transition: { duration: 0.12 } }

/**
 * Link styled as a button, with subtle Motion lift/press feedback.
 * External links open in a new tab with a safe rel; pass `download` for files.
 * Icons inside get the `group` hover to nudge themselves.
 */
export default function ButtonLink({ href, variant = 'primary', size = 'md', external, className, children, ...props }) {
  const isExternal = external ?? /^https?:/.test(href)
  return (
    <motion.a
      href={href}
      whileHover={HOVER}
      whileTap={TAP}
      className={cn(
        'group/btn inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-250 ease-out',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </motion.a>
  )
}

/** Icon that slides a few pixels when its button is hovered. */
export function ButtonIcon({ icon: Icon, direction = 'right', className }) {
  const move = {
    right: 'group-hover/btn:translate-x-1',
    'up-right': 'group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5',
    down: 'group-hover/btn:translate-y-0.5',
  }[direction]
  return (
    <Icon
      className={cn('size-4 shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]', move, className)}
      aria-hidden="true"
    />
  )
}
