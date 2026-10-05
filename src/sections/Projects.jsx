import { ArrowUpRight, Download, Star } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import { StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import BrandIcon from '../components/BrandIcon.jsx'
import ButtonLink, { ButtonIcon } from '../components/Button.jsx'
import ProjectVisual, { FeaturedVisual } from '../components/ProjectVisual.jsx'

export default function Projects({ index, projects, featured }) {
  const rest = featured ? projects.filter((p) => p.id !== featured.id) : projects

  return (
    <Section
      id="projects"
      index={index}
      eyebrow="Projects"
      title={
        <>
          Things I&apos;ve <Accent>built</Accent>
        </>
      }
    >
      {featured && <FeaturedProject project={featured} />}

      {rest.length > 0 && (
        <StaggerGroup as="ul" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </StaggerGroup>
      )}
    </Section>
  )
}

function ProjectLinks({ project, size = 'sm' }) {
  if (!project.github && !project.demo) return null
  const isDownload = /\.apk(\?|$)/i.test(project.demo ?? '')
  return (
    <div className="flex flex-wrap gap-2.5">
      {project.demo && (
        <ButtonLink
          href={project.demo}
          size={size}
          variant={size === 'md' ? 'primary' : 'secondary'}
          aria-label={`${project.demoLabel}: ${project.name} (opens in a new tab)`}
        >
          {project.demoLabel}
          <ButtonIcon icon={isDownload ? Download : ArrowUpRight} direction={isDownload ? 'down' : 'up-right'} className="size-3.5" />
        </ButtonLink>
      )}
      {project.github && (
        <ButtonLink
          href={project.github}
          size={size}
          variant={size === 'md' ? 'secondary' : 'ghost'}
          aria-label={`Source code for ${project.name} on GitHub (opens in a new tab)`}
        >
          <BrandIcon id="github" className="size-3.5" />
          GitHub
        </ButtonLink>
      )}
    </div>
  )
}

function StackList({ stack, className }) {
  if (!stack.length) return null
  return (
    <ul className={className} aria-label="Tech stack">
      {stack.map((t) => (
        <li key={t}>
          <Badge>{t}</Badge>
        </li>
      ))}
    </ul>
  )
}

function FeaturedProject({ project }) {
  return (
    <div className="relative">
      {/* Warm halo behind the featured card */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_30%_50%,rgb(214_170_141/0.10),transparent_65%)]" />
      <Card
        as="article"
        interactive
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="group/card relative overflow-hidden rounded-2xl border-line"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <FeaturedVisual project={project} className="min-h-72 border-b border-line-soft lg:min-h-[27rem] lg:border-r lg:border-b-0" />

          <div className="flex flex-col p-6 sm:p-9 lg:p-11">
            <p className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-[0.16em] text-accent uppercase">
              <Star className="size-3.5 fill-accent/30" aria-hidden="true" />
              Featured project
              {project.category && <span className="text-subtle">· {project.category}</span>}
            </p>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-fg sm:text-4xl">{project.name}</h3>
            {project.description && <p className="mt-5 leading-relaxed text-muted sm:text-[1.0625rem]">{project.description}</p>}
            <StackList stack={project.stack} className="mt-7 flex flex-wrap gap-1.5" />
            <div className="mt-9 lg:mt-auto lg:pt-9">
              <ProjectLinks project={project} size="md" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <Card as="li" staggered interactive className="group/card flex h-full flex-col overflow-hidden">
      <ProjectVisual project={project} className="aspect-[16/9] border-b border-line-soft" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {project.category && <Badge className="mb-3 self-start">{project.category}</Badge>}
        <h3 className="text-lg font-semibold tracking-tight text-fg transition-colors duration-200 group-hover/card:text-accent">{project.name}</h3>
        {project.description && <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{project.description}</p>}
        <StackList stack={project.stack} className="mt-5 flex flex-wrap gap-1.5" />
        <div className="mt-auto pt-6">
          <ProjectLinks project={project} />
        </div>
      </div>
    </Card>
  )
}
