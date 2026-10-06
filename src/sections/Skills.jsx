import Section, { Accent } from '../components/Section.jsx'
import { EASE, StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import { categoryIcon } from '../utils/icons.js'
import { cn } from '../utils/format.js'

/*
 * Skills grouped exactly as categorised in the Excel "Skills" sheet.
 * Each group is a quiet card with a light token list rather than a wall of
 * pills. Motion personality: fast — quick stagger, crisp 200ms hovers.
 */
const HOVER = { y: -3, transition: { duration: 0.2, ease: EASE } }

export default function Skills({ index, skills }) {
  return (
    <Section
      id="skills"
      index={index}
      eyebrow="Skills"
      decor={<NetworkGraphic variant="b" className="bottom-6 left-[2%] hidden w-[15rem] md:block lg:w-[18rem]" />}
      title={
        <>
          Tools &amp; <Accent>technologies</Accent>
        </>
      }
    >
      <StaggerGroup as="ul" fast className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    <Card
      as="li"
      staggered="fast"
      interactive
      lift={HOVER}
      className={cn('group/card relative overflow-hidden p-5 sm:p-6', wide && 'sm:col-span-2')}
    >
      {/* Warm wash from the icon corner on hover (gradient, not a blur layer) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgb(214_170_141/0.09),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />
      <div className="relative mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-line-soft bg-accent/[0.05] text-muted transition-[color,border-color,background-color,transform] duration-200 ease-out group-hover/card:-rotate-6 group-hover/card:scale-105 group-hover/card:border-line-strong group-hover/card:bg-accent/10 group-hover/card:text-accent">
          <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="font-medium tracking-tight text-fg">{group.name}</h3>
        <span className="ml-auto font-mono text-xs text-subtle transition-colors duration-200 group-hover/card:text-accent/80" aria-label={`${group.skills.length} skills`}>
          {String(group.skills.length).padStart(2, '0')}
        </span>
      </div>
      <ul className="relative flex flex-wrap gap-x-4 gap-y-2 border-t border-line-soft pt-4">
        {group.skills.map((skill) => (
          <li key={skill} className="group/skill flex items-center gap-2 text-[0.9375rem] text-fg/75 transition-colors duration-150 hover:text-accent">
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-accent/40 transition-[background-color,transform] duration-150 group-hover/skill:scale-150 group-hover/skill:bg-accent"
            />
            {skill}
          </li>
        ))}
      </ul>
    </Card>
  )
}
