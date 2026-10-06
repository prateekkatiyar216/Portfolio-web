import { ArrowUpRight, Award, GraduationCap, MapPin, Trophy } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import { StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'

/**
 * Education, plus certifications / achievements when those sheets have rows.
 * Each block disappears on its own when empty.
 */
export default function Education({ index, education, certifications, achievements }) {
  const hasSide = certifications.length > 0 || achievements.length > 0
  const title =
    education.length && certifications.length ? (
      <>
        Education &amp; <Accent>certifications</Accent>
      </>
    ) : education.length ? (
      <Accent>Education</Accent>
    ) : (
      <>
        Certifications &amp; <Accent>achievements</Accent>
      </>
    )

  return (
    <Section id="education" index={index} eyebrow="Education" title={title}>
      <div className={hasSide && education.length ? 'grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10' : ''}>
        {education.length > 0 && (
          <div>
            <SubHeading icon={GraduationCap}>Education</SubHeading>
            <StaggerGroup as="ol" className="space-y-4">
              {education.map((e) => (
                <EducationCard key={e.id} entry={e} />
              ))}
            </StaggerGroup>
          </div>
        )}

        {hasSide && (
          <div className="space-y-12">
            {certifications.length > 0 && (
              <div>
                <SubHeading icon={Award}>Certifications</SubHeading>
                <StaggerGroup as="ul" className="space-y-3">
                  {certifications.map((c) => (
                    <CredentialCard key={c.id} title={c.name} subtitle={c.issuer} date={c.date} url={c.url} linkLabel="View certificate" />
                  ))}
                </StaggerGroup>
              </div>
            )}
            {achievements.length > 0 && (
              <div>
                <SubHeading icon={Trophy}>Achievements</SubHeading>
                <StaggerGroup as="ul" className="space-y-3">
                  {achievements.map((a) => (
                    <CredentialCard key={a.id} title={a.title} subtitle={a.description} date={a.date} url={a.url} linkLabel="View" />
                  ))}
                </StaggerGroup>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

function SubHeading({ icon: Icon, children }) {
  return (
    <h3 className="mb-5 flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-subtle uppercase">
      <Icon className="size-3.5 text-accent" aria-hidden="true" />
      {children}
    </h3>
  )
}

/** Institution leads; the qualification sits under it in accent; dates get their own column. */
function EducationCard({ entry }) {
  const heading = entry.institution ?? entry.qualification
  const subtitle = entry.institution ? entry.qualification : null
  return (
    <Card
      as="li"
      staggered
      interactive
      lift={3}
      className="group/card relative p-5 pl-6 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-6 sm:p-6 sm:pl-7"
    >
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-0 w-0.5 origin-top rounded-full bg-linear-to-b from-accent to-accent/10 transition-transform duration-300 group-hover/card:scale-y-110"
      />

      {(entry.start || entry.end) && (
        <p className="mb-3 flex items-baseline gap-2 font-mono tabular-nums sm:mb-0 sm:flex-col sm:items-start sm:gap-0.5 sm:pt-0.5">
          {entry.start && entry.end && <span className="text-xs text-subtle">{entry.start.label} —</span>}
          <span className="text-xl leading-none text-accent sm:text-2xl">{(entry.end ?? entry.start).label}</span>
        </p>
      )}

      <div className="min-w-0">
        <h4 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">{heading}</h4>
        {subtitle && <p className="mt-1 text-[0.9375rem] font-medium text-accent/90">{subtitle}</p>}
        {entry.field && <p className="mt-3 text-[0.9375rem] text-muted">{entry.field}</p>}
        {(entry.city || entry.score) && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-subtle">
            {entry.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-accent/80" aria-hidden="true" />
                {entry.city}
              </span>
            )}
            {entry.score && <span>{entry.score}</span>}
          </div>
        )}
        {entry.details && <p className="mt-3 text-sm leading-relaxed text-muted">{entry.details}</p>}
      </div>
    </Card>
  )
}

function CredentialCard({ title, subtitle, date, url, linkLabel }) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line-soft bg-accent/[0.06] text-accent transition-[border-color,background-color,transform] duration-200 group-hover/card:-rotate-6 group-hover/card:border-line-strong group-hover/card:bg-accent/10">
        <Award className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium tracking-tight text-fg transition-colors duration-200 group-hover/card:text-accent">{title}</h4>
        {(subtitle || date) && (
          <p className="mt-1 text-sm text-muted">
            {subtitle}
            {subtitle && date && <span className="mx-1.5 text-subtle">·</span>}
            {date && <span className="font-mono text-xs text-subtle">{date.label}</span>}
          </p>
        )}
      </div>
      {url && (
        <ArrowUpRight
          className="size-4 shrink-0 text-subtle transition-[color,transform] duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-accent"
          aria-hidden="true"
        />
      )}
    </>
  )

  return (
    <Card as="li" staggered interactive={Boolean(url)} className="group/card">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkLabel}: ${title} (opens in a new tab)`}
          className="flex items-center gap-4 rounded-[inherit] p-5"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-4 p-5">{body}</div>
      )}
    </Card>
  )
}
