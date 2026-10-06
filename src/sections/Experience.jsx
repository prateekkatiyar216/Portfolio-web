import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Building2, Calendar, MapPin, UserRound } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import Reveal, { EASE } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import { cn, formatDuration, formatRange } from '../utils/format.js'

/*
 * Experience as a journey. A dim rail runs the full length; a warm rail fills
 * it as the visitor scrolls, with a small light at its leading edge. Each
 * node switches on as it crosses the middle of the viewport.
 * Motion personality: directional — entries arrive from the rail side.
 */

// Rail x-position: 7px on mobile, just right of the 13rem date column on desktop.
const RAIL = 'left-[7px] md:left-[calc(13rem+7px)]'

export default function Experience({ index, experience }) {
  const listRef = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 65%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  // The head rides a full-height track; translateY(%) of the track = % of the rail. Transform only, no layout.
  const headY = useTransform(progress, (p) => `${p * 100}%`)
  const headOpacity = useTransform(progress, [0, 0.02, 0.98, 1], [0, 1, 1, 0])

  return (
    <Section
      id="experience"
      index={index}
      eyebrow="Experience"
      decor={<NetworkGraphic variant="a" className="top-28 right-[3%] hidden w-[17rem] md:block lg:right-[6%] lg:w-[20rem]" />}
      title={
        <>
          Where I&apos;ve <Accent>worked</Accent>
        </>
      }
    >
      <div ref={listRef} className="relative">
        {/* Rails */}
        <div aria-hidden="true" className={cn('absolute top-2 bottom-2 w-px', RAIL)}>
          <div className="absolute inset-0 bg-linear-to-b from-accent/20 via-line-soft to-transparent" />
          <motion.div
            style={{ scaleY: reduce ? 1 : progress }}
            className="absolute inset-0 origin-top bg-linear-to-b from-accent via-accent/60 to-accent/10 will-change-transform"
          />
          {!reduce && (
            <motion.div style={{ y: headY, opacity: headOpacity }} className="absolute inset-0 will-change-transform">
              <span className="absolute top-0 left-1/2 size-[7px] -translate-1/2 rounded-full bg-accent shadow-[0_0_14px_3px_rgb(214_170_141/0.45)]" />
            </motion.div>
          )}
        </div>

        <ol>
          {experience.map((job, i) => (
            <TimelineItem key={job.id} job={job} index={i} />
          ))}
        </ol>
      </div>
    </Section>
  )
}

const nodeVariants = {
  idle: { scale: 0.85, borderColor: 'rgba(214, 170, 141, 0.35)', boxShadow: '0 0 0 0px rgba(214, 170, 141, 0)' },
  lit: {
    scale: 1,
    borderColor: 'rgba(214, 170, 141, 1)',
    boxShadow: '0 0 0 5px rgba(214, 170, 141, 0.12)',
    transition: { duration: 0.5, ease: EASE },
  },
}
const coreVariants = { idle: { opacity: 0.35, scale: 0.6 }, lit: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } } }

function TimelineItem({ job, index }) {
  const range = formatRange(job.start, job.end)
  const duration = formatDuration(job.start, job.end)

  return (
    <motion.li
      initial="idle"
      whileInView="lit"
      viewport={{ once: true, margin: '0px 0px -45% 0px' }}
      className="relative pb-14 pl-9 last:pb-0 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:pl-0"
    >
      {/* Date column (desktop) — sticks beside its role while the card scrolls past */}
      <div className="hidden self-start pr-10 text-right md:sticky md:top-28 md:block">
        <Reveal preset="directional" delay={0.05}>
          <p className="font-mono text-[0.7rem] tracking-[0.16em] text-subtle uppercase">{String(index + 1).padStart(2, '0')}</p>
          {range && <p className="mt-2 font-mono text-sm text-accent">{range}</p>}
          {duration && <p className="mt-1 font-mono text-xs text-subtle">{duration}</p>}
        </Reveal>
      </div>

      {/* Node: lights up as it reaches the middle of the screen */}
      <motion.span
        aria-hidden="true"
        variants={nodeVariants}
        className="absolute top-1.5 left-0 z-10 grid size-[15px] place-items-center rounded-full border bg-bg md:left-52"
      >
        <motion.span variants={coreVariants} className={cn('size-[5px] rounded-full bg-accent', job.current && 'pulse-dot')} />
      </motion.span>

      <Reveal preset="directional" delay={0.1} className="md:pl-10">
        <Card as="article" interactive lift={3} className="group/card p-5 sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight text-fg sm:text-[1.375rem]">{job.role}</h3>
              {job.organization && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent">
                  <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                  {job.organization}
                </p>
              )}
            </div>
            {job.current && (
              <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                Current
              </span>
            )}
          </header>

          {/* Meta row (dates shown here on mobile) */}
          {(range || job.location || job.mentor) && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-subtle">
              {range && (
                <span className="flex items-center gap-1.5 font-mono text-[0.8125rem] md:hidden">
                  <Calendar className="size-3.5 text-accent/80" aria-hidden="true" />
                  {range}
                  {duration && <span>· {duration}</span>}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-accent/80" aria-hidden="true" />
                  {job.location}
                </span>
              )}
              {job.mentor && (
                <span className="flex items-center gap-1.5">
                  <UserRound className="size-3.5 text-accent/80" aria-hidden="true" />
                  Mentor: {job.mentor}
                </span>
              )}
            </div>
          )}

          {job.highlights.length > 0 && (
            <ul className="mt-5 space-y-3 border-t border-line-soft pt-5">
              {job.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7rem] h-px w-3 shrink-0 bg-accent/70 transition-[width,background-color] duration-300 group-hover/card:w-4 group-hover/card:bg-accent"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {job.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
              {job.tags.map((t) => (
                <li key={t}>
                  <Badge>{t}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </motion.li>
  )
}
