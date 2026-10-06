import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { EASE, VIEWPORT } from './Reveal.jsx'
import { cn } from '../utils/format.js'

// Header entrance: thread → label → rule → heading. Shared by every section so
// headings feel like one editorial system; section *content* carries the personality.
const HEADER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  thread: { hidden: { scaleY: 0, opacity: 0 }, show: { scaleY: 1, opacity: 1, transition: { duration: 0.7, ease: EASE } } },
  label: { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } },
  rule: { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: 0.2 } } },
  title: { hidden: { opacity: 0, y: '70%' }, show: { opacity: 1, y: '0%', transition: { duration: 0.9, ease: EASE } } },
}

/**
 * Standard page section: anchor id, numbered eyebrow, heading, optional
 * intro. `title` may contain <Accent> words.
 *
 * Sections sit on the shared <AmbientBackground>, so they don't draw their
 * own backdrop or separators. Optional atmosphere:
 *  - `watermark`: oversized outlined word drifting slowly behind the content
 *  - `decor`:     extra background elements (e.g. <NetworkGraphic>)
 * `isolate` keeps any -z-10 decor behind this section's content only.
 */
export default function Section({ id, index, eyebrow, title, intro, watermark, decor, className, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('relative isolate py-24 sm:py-32', className)}>
      {(watermark || decor) && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {watermark && <Watermark text={watermark} />}
          {decor}
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.header
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={HEADER.container}
          className="relative mb-12 max-w-2xl sm:mb-16"
        >
          {/* Thread: a hairline dropping in from the previous section, landing on the index number */}
          <motion.span
            aria-hidden="true"
            variants={HEADER.thread}
            className="absolute -top-16 left-[0.3em] h-12 w-px origin-top bg-linear-to-b from-transparent to-accent/35 sm:-top-20 sm:h-16"
          />
          {/* Technical label: 01 / ABOUT ———— */}
          <motion.p variants={HEADER.label} className="mb-5 flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase">
            {index && (
              <>
                <span className="text-accent">{index}</span>
                <span className="text-accent/40" aria-hidden="true">
                  /
                </span>
              </>
            )}
            <span className="text-subtle">{eyebrow}</span>
            <motion.span
              aria-hidden="true"
              variants={HEADER.rule}
              className="ml-2 h-px w-12 origin-left bg-linear-to-r from-accent/50 to-transparent"
            />
          </motion.p>
          {/* Heading rises out of a mask; padding keeps serif descenders / italic overhang unclipped */}
          <div className="-mb-[0.14em] overflow-hidden pr-[0.1em] pb-[0.14em]">
            <motion.h2
              id={`${id}-title`}
              variants={HEADER.title}
              className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
            >
              {title}
            </motion.h2>
          </div>
          {intro && (
            <motion.p variants={HEADER.label} className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              {intro}
            </motion.p>
          )}
        </motion.header>
        {children}
      </div>
    </section>
  )
}

/** Outlined serif word behind a section, moving slightly slower than the page. */
function Watermark({ text }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-0 h-[24rem] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
    >
      <motion.span style={{ y: reduce ? 0 : y }} className="watermark absolute top-12 right-[-0.04em] block sm:top-16">
        {text}
      </motion.span>
    </div>
  )
}

/** Serif-italic accent word for headings: <Accent>built</Accent>. */
export function Accent({ children }) {
  return <span className="accent-word pr-[0.06em] text-[1.08em]">{children}</span>
}
