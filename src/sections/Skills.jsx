import Section, { Accent } from '../components/Section.jsx'
import { StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import { categoryIcon } from '../utils/icons.js'
import { cn } from '../utils/format.js'

/** Skills grouped exactly as categorised in the Excel "Skills" sheet. */
export default function Skills({ index, skills }) {
  return (
    <Section
      id="skills"
      index={index}
      eyebrow="Skills"
      title={
        <>
          Tools &amp; <Accent>technologies</Accent>
        </>
      }
    >
      <StaggerGroup as="ul" className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.groups.map((group) => (
          <SkillGroup key={group.name} group={group} />
        ))}
      </StaggerGroup>
    </Section>
  )
}

function SkillGroup({ group }) {
  const Icon = categoryIcon(group.name)
  const wide = group.skills.length >= 8

  return (
    <Card as="li" staggered interactive className={cn('group/card relative overflow-hidden p-5 sm:p-6', wide && 'sm:col-span-2')}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-accent/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover/card:opacity-60"
      />
      <div className="relative mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-line-soft bg-accent/[0.06] text-muted transition-colors duration-300 group-hover/card:border-line-strong group-hover/card:text-accent">
          <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="font-medium tracking-tight text-fg">{group.name}</h3>
        <span className="ml-auto font-mono text-xs text-subtle" aria-label={`${group.skills.length} skills`}>
          {String(group.skills.length).padStart(2, '0')}
        </span>
      </div>
      <ul className="relative flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-lg border border-line-soft bg-bg-elevated/70 px-2.5 py-1 text-sm text-fg/80 transition-[border-color,color,background-color] duration-200 hover:border-accent/60 hover:bg-accent/[0.08] hover:text-accent"
          >
            {skill}
          </li>
        ))}
      </ul>
    </Card>
  )
}
