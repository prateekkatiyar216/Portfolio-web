import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight, Download, Star } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import { EASE, StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import BrandIcon from '../components/BrandIcon.jsx'
import ButtonLink, { ButtonIcon } from '../components/Button.jsx'
import ProjectVisual, { FeaturedVisual } from '../components/ProjectVisual.jsx'
import { useFinePointer } from '../hooks/useMediaQuery.js'

/*
 * Motion personality: interactive. The featured project responds to scroll
 * (parallax at two depths) and to the pointer (a local warm light and a small
 * shift of its visual). Regular cards keep to a crisp hover.
 */
const CARD_HOVER = { y: -4, transition: { duration: 0.25, ease: EASE } }

export default function Projects({ index, projects, featured }) {
  const rest = featured ? projects.filter((p) => p.id !== featured.id) : projects

  return (
    <Section
      id="projects"
      index={index}
      eyebrow="Projects"
      watermark="Projects"
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
          <ButtonIcon icon={ArrowUpRight} direction="up-right" className="size-3 opacity-60" />
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
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const fine = useFinePointer()
  const interactive = fine && !reduce

  // Scroll parallax: content and backdrop travel at different rates.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scrollShift = useTransform(scrollYProgress, [0, 1], [16, -16])
  const backdropShift = useTransform(scrollYProgress, [0, 1], [-10, 10])

  // Pointer: a local warm light + a few px of drift on the visual.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const light = useSpring(0, { stiffness: 120, damping: 24 })
  const driftX = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 120, damping: 20 })
  const driftY = useSpring(useTransform(py, [0, 1], [-6, 6]), { stiffness: 120, damping: 20 })
  const contentY = useTransform([scrollShift, driftY], ([s, d]) => s + d)
  const glowX = useTransform(px, (v) => v * 100)
  const glowY = useTransform(py, (v) => v * 100)
  const glow = useMotionTemplate`radial-gradient(32rem circle at ${glowX}% ${glowY}%, rgb(214 170 141 / 0.09), transparent 60%)`

  const onMove = (e) => {
    if (!interactive || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
    light.set(1)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
    light.set(0)
  }

  return (
    <div ref={ref} className="relative">
      {/* Warm halo behind the featured card */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_30%_50%,rgb(214_170_141/0.10),transparent_65%)]" />
      <Card
        as="article"
        interactive
        lift={{ y: -3, transition: { duration: 0.3, ease: EASE } }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group/card relative overflow-hidden rounded-2xl border-line"
      >
        <div className="absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
        {interactive && (
          <motion.div aria-hidden="true" style={{ backgroundImage: glow, opacity: light }} className="pointer-events-none absolute inset-0 z-10" />
        )}

        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <FeaturedVisual
            project={project}
            className="min-h-72 border-b border-line-soft lg:min-h-[27rem] lg:border-r lg:border-b-0"
            contentStyle={reduce ? undefined : { x: interactive ? driftX : 0, y: interactive ? contentY : scrollShift }}
            backdropStyle={reduce ? undefined : { y: backdropShift }}
          />

          <div className="flex flex-col p-6 sm:p-9 lg:p-11">
            <p className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-[0.16em] text-accent uppercase">
              <Star className="size-3.5 fill-accent/30" aria-hidden="true" />
              Featured project
              {project.category && <span className="text-subtle">· {project.category}</span>}
            </p>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-fg transition-colors duration-300 group-hover/card:text-accent sm:text-[2.5rem]">
              {project.name}
            </h3>
            {project.description && <p className="mt-5 leading-relaxed text-muted sm:text-[1.0625rem]">{project.description}</p>}
            {project.stack.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 font-mono text-[0.7rem] tracking-[0.16em] text-subtle uppercase">Stack</p>
                <StackList stack={project.stack} className="flex flex-wrap gap-1.5" />
              </div>
            )}
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
    <Card as="li" staggered interactive lift={CARD_HOVER} className="group/card flex h-full flex-col overflow-hidden">
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
