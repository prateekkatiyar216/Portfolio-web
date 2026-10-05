import { projectIcon } from '../utils/icons.js'
import { cn, hashUnit } from '../utils/format.js'

/**
 * Image area of a project card. Uses the project's image when one exists
 * (Excel "Image" column or public/projects/<slug>.png); otherwise draws a
 * deterministic visual from the project's own name and stack.
 * Hover effects key off the parent's `group/card`.
 */
export default function ProjectVisual({ project, className }) {
  if (project.image) {
    return (
      <div className={cn('relative overflow-hidden bg-bg-elevated', className)}>
        <img
          src={project.image}
          alt={`Screenshot of ${project.name}`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover/card:opacity-30" />
      </div>
    )
  }

  const Icon = projectIcon(project)
  // Position of the warm glow varies per project so cards don't look cloned.
  const x = Math.round(15 + hashUnit(project.slug) * 70)
  const y = Math.round(hashUnit(project.slug + 'y') * 30)

  return (
    <div
      aria-hidden="true"
      className={cn('relative isolate overflow-hidden bg-bg-elevated', className)}
      style={{ backgroundImage: `radial-gradient(110% 90% at ${x}% ${y}%, rgb(214 170 141 / 0.16), transparent 60%)` }}
    >
      <div className="absolute inset-0 bg-dots [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <span className="absolute top-3.5 left-4 font-mono text-[0.7rem] text-subtle">~/{project.slug}</span>

      <div className="absolute inset-0 grid place-items-center transition-transform duration-700 ease-out group-hover/card:scale-105">
        <div className="relative">
          <div className="absolute -inset-12 rounded-full border border-accent/[0.07] transition-transform duration-700 group-hover/card:scale-110" />
          <div className="absolute -inset-6 rounded-full border border-accent/10" />
          <div className="relative grid size-14 place-items-center rounded-2xl border border-line bg-card shadow-[0_14px_40px_-14px_var(--primary-glow)] transition-[border-color] duration-300 group-hover/card:border-line-strong">
            <Icon className="size-6 text-accent" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Larger visual for the featured project: its stack rendered as a flow of
 * stages inside a minimal app window.
 */
export function FeaturedVisual({ project, className }) {
  if (project.image) return <ProjectVisual project={project} className={className} />
  const Icon = projectIcon(project)

  return (
    <div aria-hidden="true" className={cn('relative isolate overflow-hidden bg-bg-elevated', className)}>
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]" />
      <div className="absolute -top-28 left-1/2 size-80 -translate-x-1/2 rounded-full bg-accent/20 blur-[90px]" />

      <div className="relative flex h-full flex-col p-5 sm:p-7">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent/20" />
          <span className="size-2.5 rounded-full bg-accent/12" />
          <span className="size-2.5 rounded-full bg-accent/[0.07]" />
          <span className="ml-3 font-mono text-[0.7rem] text-subtle">~/projects/{project.slug}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <ol className="mx-auto w-full max-w-xs transition-transform duration-700 ease-out group-hover/card:-translate-y-1">
            {project.stack.map((item, i) => (
              <li key={item}>
                {i > 0 && (
                  <div className="relative mx-auto h-6 w-px overflow-hidden bg-line">
                    <span className="absolute inset-x-0 top-0 h-2 animate-flow-y bg-accent" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-line-soft bg-card/95 px-3.5 py-2.5">
                  <span className="font-mono text-[0.7rem] text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-mono text-sm text-fg/90">{item}</span>
                  {i === project.stack.length - 1 && <Icon className="ml-auto size-4 text-accent" strokeWidth={1.75} />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
