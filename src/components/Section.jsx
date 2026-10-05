import Reveal from './Reveal.jsx'
import { cn } from '../utils/format.js'

/**
 * Standard page section: anchor id, numbered eyebrow, heading, optional
 * intro. `title` may contain <Accent> words.
 */
export default function Section({ id, index, eyebrow, title, intro, className, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('relative py-24 sm:py-32', className)}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal as="header" className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-subtle uppercase">
            {index && <span className="text-accent">{index}</span>}
            <span className="h-px w-10 bg-linear-to-r from-accent/60 to-transparent" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}

/** Serif-italic accent word for headings: <Accent>built</Accent>. */
export function Accent({ children }) {
  return <span className="accent-word pr-[0.06em] text-[1.08em]">{children}</span>
}
