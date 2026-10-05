import { motion } from 'motion/react'
import { SPRING } from './Reveal.jsx'
import { cn } from '../utils/format.js'

const VARIANTS = {
  primary: 'bg-accent text-bg hover:bg-accent-hover shadow-[0_10px_30px_-12px_var(--primary-glow)]',
  secondary: 'border border-accent/35 bg-transparent text-accent hover:border-accent hover:bg-accent/10',
  ghost: 'text-muted hover:bg-accent/10 hover:text-accent',
}

const SIZES = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-[0.9375rem] gap-2',
}

/**
 * Link styled as a button, with subtle Motion press/hover feedback.
 * External links open in a new tab with a safe rel; pass `download` for files.
 * Icons inside get the `group` hover to nudge themselves.
 */
export default function ButtonLink({ href, variant = 'primary', size = 'md', external, className, children, ...props }) {
  const isExternal = external ?? /^https?:/.test(href)
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      className={cn(
        'group/btn inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-200',
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

/** Icon that slides a couple of pixels when its button is hovered. */
export function ButtonIcon({ icon: Icon, direction = 'right', className }) {
  const move = {
    right: 'group-hover/btn:translate-x-0.5',
    'up-right': 'group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5',
    down: 'group-hover/btn:translate-y-0.5',
  }[direction]
  return <Icon className={cn('size-4 shrink-0 transition-transform duration-200', move, className)} aria-hidden="true" />
}
