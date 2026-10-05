import { motion } from 'motion/react'
import { Building2, Calendar, MapPin, UserRound } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import Reveal, { EASE } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { cn, formatDuration, formatRange } from '../utils/format.js'

export default function Experience({ index, experience }) {
  return (
    <Section
      id="experience"
      index={index}
      eyebrow="Experience"
      title={
        <>
          Where I&apos;ve <Accent>worked</Accent>
        </>
      }
    >
      <ol className="relative">
        {/* Timeline rail — draws itself downward as it scrolls into view */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '0px 0px -20% 0px' }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-linear-to-b from-accent/70 via-accent/25 to-transparent md:left-[calc(13rem+7px)]"
        />
        {experience.map((job, i) => (
          <TimelineItem key={job.id} job={job} delay={i * 0.08} />
        ))}
      </ol>
    </Section>
  )
}

function TimelineItem({ job, delay }) {
  const range = formatRange(job.start, job.end)
  const duration = formatDuration(job.start, job.end)

  return (
    <Reveal as="li" delay={delay} className="relative pb-12 pl-9 last:pb-0 md:grid md:grid-cols-[13rem_1fr] md:pl-0">
      {/* Date column (desktop) */}
      <div className="hidden pt-1 pr-10 text-right md:block">
        {range && <p className="font-mono text-sm text-accent">{range}</p>}
        {duration && <p className="mt-1.5 font-mono text-xs text-subtle">{duration}</p>}
      </div>

      {/* Node */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1.5 left-0 grid size-[15px] place-items-center rounded-full border bg-bg md:left-52',
          job.current ? 'border-accent shadow-[0_0_0_4px_rgb(214_170_141/0.12)]' : 'border-accent/50',
        )}
      >
        <span className={cn('size-[5px] rounded-full bg-accent', job.current ? 'animate-pulse-dot' : 'opacity-60')} />
      </span>

      <div className="md:pl-10">
        <Card as="article" interactive className="p-5 sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">{job.role}</h3>
              {job.organization && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent">
                  <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                  {job.organization}
                </p>
              )}
            </div>
            {job.current && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Current</span>
            )}
          </header>

          {/* Meta row (dates shown here on mobile) */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-subtle">
            {range && (
              <span className="flex items-center gap-1.5 md:hidden">
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

          {job.highlights.length > 0 && (
            <ul className="mt-5 space-y-3">
              {job.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-accent" />
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
      </div>
    </Reveal>
  )
}
