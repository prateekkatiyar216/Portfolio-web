import { Briefcase, GraduationCap, MapPin } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import Reveal, { StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import CountUp from '../components/CountUp.jsx'
import { highlightTerms } from '../utils/highlight.jsx'

/**
 * Summary + facts. All stats are counts of real rows in the Excel file;
 * a stat with a zero count is not shown.
 */
export default function About({ index, profile, skills, projects, experience, education, certifications }) {
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
      value: [current.role, current.organization].filter(Boolean).join(' · '),
    },
    latestEducation && {
      icon: GraduationCap,
      label: 'Education',
      value: [latestEducation.qualification, latestEducation.institution].filter(Boolean).join(' · '),
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
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          {profile.summary && (
            <Reveal as="p" className="text-xl leading-[1.6] text-fg/80 sm:text-[1.5rem] sm:leading-[1.55]">
              {highlightTerms(profile.summary, skills.all, 'text-accent')}
            </Reveal>
          )}

          {skills.soft.length > 0 && (
            <Reveal delay={0.1} className="mt-12">
              <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-subtle uppercase">How I work</h3>
              <ul className="flex flex-wrap gap-2">
                {skills.soft.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line-soft bg-card/60 px-4 py-2 text-sm text-muted transition-colors duration-200 hover:border-line-strong hover:text-accent"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <div className="space-y-5">
          {facts.length > 0 && (
            <Reveal as="dl" delay={0.05} className="card divide-y divide-line-soft overflow-hidden">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="group flex gap-4 p-5 transition-colors duration-200 hover:bg-card-hover">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-soft bg-accent/[0.06] text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="font-mono text-[0.7rem] tracking-wider text-subtle uppercase">{label}</dt>
                    <dd className="mt-1 text-[0.9375rem] leading-snug text-fg/90">{value}</dd>
                  </div>
                </div>
              ))}
            </Reveal>
          )}

          {stats.length > 0 && (
            <StaggerGroup as="dl" className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <Card key={s.label} staggered interactive className="relative flex flex-col-reverse overflow-hidden p-5">
                  <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                  <dd className="text-4xl font-semibold tracking-tight text-fg">
                    <CountUp value={s.value} />
                    <span className="text-accent">.</span>
                  </dd>
                </Card>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    </Section>
  )
}
