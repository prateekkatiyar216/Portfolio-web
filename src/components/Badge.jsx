import { cn } from '../utils/format.js'

const TONES = {
  accent: 'border-accent/20 bg-accent/[0.07] text-accent hover:border-accent/45 hover:bg-accent/[0.12]',
  neutral: 'border-line-soft bg-bg-elevated/60 text-muted hover:border-line hover:text-fg/90',
}

/** Small mono tag used for tech stacks. */
export default function Badge({ tone = 'accent', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.72rem] leading-5 transition-[border-color,background-color,color] duration-200',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
