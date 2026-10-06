import { motion, useReducedMotion } from 'motion/react'
import { Briefcase, GraduationCap, MapPin } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import Reveal, { EASE, TF_REST, VIEWPORT, calmVariants, tf } from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import { highlightTerms } from '../utils/highlight.jsx'

/*
 * Editorial composition: the personal statement set large on the left,
 * a compact "spec sheet" of facts and data points on the right.
 * Every stat is a count of real rows in the Excel file; zero counts are hidden.
 * Motion personality: slow, long fades with almost no travel.
 */
const slow = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }
const slowItem = { hidden: { opacity: 0, transform: tf({ y: 10 }) }, show: { opacity: 1, transform: TF_REST, transition: { duration: 0.9, ease: EASE } } }
const slowItemReduced = calmVariants(slowItem)

export default function About({ index, profile, skills, projects, experience, education, certifications }) {
  const item = useReducedMotion() ? slowItemReduced : slowItem
  const current = experience.find((e) => e.current) ?? experience[0]
  const latestEducation = education[0]

  const stats = [
    { value: projects.length, label: projects.length === 1 ? 'Project' : 'Projects' },
    { value: skills.all.length, label: 'Skills' },
    { value: experience.length, label: experience.length === 1 ? 'Role' : 'Roles' },
    { value: certifications.length, label: certifications.length === 1 ? 'Certification' : 'Certifications' },
  ].filter((s) => s.value > 0)

  const facts = [
    current && {
      icon: Briefcase,
      label: current.current ? 'Currently' : 'Most recently',
      value: current.role,
      detail: current.organization,
    },
    latestEducation && {
      icon: GraduationCap,
      label: 'Education',
      value: latestEducation.qualification ?? latestEducation.institution,
      detail: latestEducation.qualification ? latestEducation.institution : null,
    },
    profile.location && { icon: MapPin, label: 'Based in', value: profile.location },
  ].filter(Boolean)

  return (
    <Section
      id="about"
      index={index}
      eyebrow="About"
      title={
        <>
          A bit <Accent>about</Accent> me
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          {profile.summary && (
            <Reveal as="figure" preset="editorial" className="relative">
              {/* Oversized serif quote mark — editorial cue, decorative only */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -left-2 font-serif text-[7rem] leading-none text-accent/15 select-none sm:-top-14 sm:-left-6 sm:text-[9rem]"
              >
                &ldquo;
              </span>
              <p className="relative text-[1.3rem] leading-[1.55] tracking-[-0.01em] text-fg/85 sm:text-[1.7rem] sm:leading-[1.5]">
                {highlightTerms(profile.summary, skills.all, 'text-accent')}
              </p>
            </Reveal>
          )}

          {skills.soft.length > 0 && (
            <Reveal preset="editorial" delay={0.2} className="mt-12 border-t border-line-soft pt-6">
              <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-subtle uppercase">How I work</h3>
              <ul className="flex flex-wrap gap-x-1 gap-y-2 text-[0.9375rem] text-muted">
                {/* Separators trail their item, so a wrapped line never starts with "/" */}
                {skills.soft.map((s, i) => (
                  <li key={s} className="flex items-center gap-1">
                    <span className="transition-colors duration-200 hover:text-accent">{s}</span>
                    {i < skills.soft.length - 1 && (
                      <span aria-hidden="true" className="px-1.5 text-accent/40">
                        /
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <motion.aside initial="hidden" whileInView="show" viewport={VIEWPORT} variants={slow} className="space-y-10" aria-label="Profile facts">
          {facts.length > 0 && (
            <motion.dl variants={item} className="relative border-l border-line pl-6">
              <span aria-hidden="true" className="absolute top-0 -left-px h-12 w-px bg-accent" />
              {facts.map(({ icon: Icon, label, value, detail }) => (
                <div key={label} className="group border-b border-line-soft py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <dt className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.16em] text-subtle uppercase">
                    <Icon className="size-3.5 text-accent/80 transition-colors duration-200 group-hover:text-accent" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-2 leading-snug">
                    <span className="block text-[1.0625rem] font-medium tracking-tight text-fg">{value}</span>
                    {detail && <span className="mt-0.5 block text-[0.9375rem] text-muted">{detail}</span>}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}

          {stats.length > 0 && (
            <motion.div variants={item}>
              <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-subtle uppercase">In numbers</h3>
              {/* Data points: hairline grid, no card chrome */}
              <dl className="grid grid-cols-2 border-t border-l border-line-soft">
                {stats.map((s) => (
                  <div key={s.label} className="group flex flex-col-reverse border-r border-b border-line-soft p-5 transition-colors duration-300 hover:bg-accent/[0.03]">
                    <dt className="mt-1.5 font-mono text-[0.7rem] tracking-[0.14em] text-subtle uppercase">{s.label}</dt>
                    <dd className="text-[2.5rem] leading-none font-semibold tracking-[-0.04em] text-fg transition-colors duration-300 group-hover:text-accent">
                      <CountUp value={s.value} duration={1.8} />
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </motion.aside>
      </div>
    </Section>
  )
}
