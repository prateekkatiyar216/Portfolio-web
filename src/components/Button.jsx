import { cn } from '../utils/format.js'

const VARIANTS = {
  // Warm fill with a hairline top highlight and a static warm glow (shadows are never transitioned).
  primary:
    'bg-accent text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_12px_32px_-12px_rgb(214_170_141/0.35)] hover:bg-accent-hover',
  // Dark, near-opaque, warm border — reads as the clear second choice. No backdrop blur:
  // it would re-blur every frame the ambient background beneath it moves.
  secondary:
    'border border-accent/30 bg-bg/70 text-fg hover:border-accent/70 hover:bg-accent/[0.07] hover:text-accent',
  ghost: 'text-muted hover:bg-accent/10 hover:text-accent',
}

const SIZES = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-[0.9375rem] gap-2',
}


/**
 * Link styled as a button. Hover lift / press feedback is CSS (`btn-lift`):
 * crisp 200ms, compositor-only, no JavaScript per hover.
 * External links open in a new tab with a safe rel; pass `download` for files.
 * Icons inside get the `group` hover to nudge themselves.
 */
export default function ButtonLink({ href, variant = 'primary', size = 'md', external, className, children, ...props }) {
  const isExternal = external ?? /^https?:/.test(href)
  return (
    <a
      href={href}
      className={cn(
        'group/btn btn-lift inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
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
