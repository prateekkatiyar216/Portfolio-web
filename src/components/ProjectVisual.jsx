import { motion, useReducedMotion } from 'motion/react'
import { projectIcon } from '../utils/icons.js'
import { cn, hashUnit } from '../utils/format.js'
import { EASE, TF_REST, calmVariants, tf } from './Reveal.jsx'

/**
 * Image area of a project card. Uses the project's image when one exists
 * (Excel "Image" column or public/projects/<slug>.png). Otherwise it draws an
 * abstract visual of *what kind* of thing the project is — inferred from its
 * real name / stack / category — never a fake screenshot. Shapes are seeded
 * from the slug, so each project looks distinct but renders the same every time.
 * Hover effects key off the parent's `group/card`.
 */
const KINDS = [
  ['chat', /rag|gen.?ai|llm|chat ?bot|gpt|langchain/i],
  ['mobile', /react native|expo|mobile|android|ios|flutter|kotlin|swift/i],
  ['chart', /machine learning|regression|predict|forecast|tensorflow|pytorch|scikit|pandas|data (science|analysis)|visuali/i],
  ['monitor', /security|login|auth|threat|hack|detect|intrusion|monitor|log/i],
]

export function projectKind(project) {
  const haystack = [project.category, project.name, ...(project.stack ?? [])].filter(Boolean).join(' ')
  return KINDS.find(([, re]) => re.test(haystack))?.[0] ?? 'code'
}

const VISUALS = { chat: ChatVisual, mobile: MobileVisual, chart: ChartVisual, monitor: MonitorVisual, code: CodeVisual }

export default function ProjectVisual({ project, className }) {
  if (project.image) {
    return (
      <div className={cn('relative overflow-hidden bg-bg-elevated', className)}>
        <img
          src={project.image}
          alt={`Screenshot of ${project.name}`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover/card:opacity-30" />
      </div>
    )
  }

  const Icon = projectIcon(project)
  const Visual = VISUALS[projectKind(project)]
  // Position of the warm glow varies per project so cards don't look cloned.
  const x = Math.round(15 + hashUnit(project.slug) * 70)
  const y = Math.round(hashUnit(project.slug + 'y') * 30)

  return (
    <div
      aria-hidden="true"
      className={cn('relative isolate overflow-hidden bg-bg-elevated', className)}
      style={{ backgroundImage: `radial-gradient(110% 90% at ${x}% ${y}%, rgb(214 170 141 / 0.14), transparent 60%)` }}
    >
      <div className="absolute inset-0 bg-dots opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <span className="absolute top-3.5 left-4 z-10 font-mono text-[0.7rem] text-subtle">~/{project.slug}</span>
      <Icon className="absolute top-3.5 right-4 z-10 size-3.5 text-accent/60" strokeWidth={1.75} />

      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover/card:scale-[1.03]">
        <Visual seed={project.slug} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Abstract visuals — no text content, only structure                  */
/* ------------------------------------------------------------------ */

const seeded = (seed, i) => hashUnit(`${seed}:${i}`)

/** Data points + a fitted trend line that draws itself in. */
function ChartVisual({ seed }) {
  const slope = 0.35 + seeded(seed, 'slope') * 0.3
  const points = Array.from({ length: 22 }, (_, i) => {
    const px = 30 + (i / 21) * 260
    const trend = 150 - (px - 30) * slope
    return [px + (seeded(seed, `x${i}`) - 0.5) * 10, trend + (seeded(seed, `y${i}`) - 0.5) * 46]
  })
  const bars = Array.from({ length: 9 }, (_, i) => 10 + seeded(seed, `b${i}`) * 26)

  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" className="absolute inset-x-6 top-10 bottom-4 h-[calc(100%-3.5rem)] w-[calc(100%-3rem)]">
      {[60, 100, 140].map((gy) => (
        <line key={gy} x1="24" x2="300" y1={gy} y2={gy} stroke="rgb(214 170 141 / 0.07)" strokeDasharray="2 4" />
      ))}
      <path d="M24 20 V160 H300" fill="none" stroke="rgb(214 170 141 / 0.25)" />
      {points.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.4" fill="rgb(214 170 141 / 0.55)" />
      ))}
      <motion.path
        d={`M30 150 L290 ${150 - 260 * slope}`}
        stroke="var(--primary)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
      />
      {/* residual histogram — top-left, where the rising trend leaves room */}
      <g transform="translate(40 22)">
        {bars.map((h, i) => (
          <rect key={i} x={i * 6} y={40 - h} width="4" height={h} rx="1" fill="rgb(214 170 141 / 0.18)" />
        ))}
      </g>
    </svg>
  )
}

/** A phone frame with an abstract list UI and tab bar. */
function MobileVisual({ seed }) {
  const rows = [0, 1, 2, 3].map((i) => 40 + seeded(seed, `r${i}`) * 45)
  return (
    <div className="absolute inset-0 flex items-center justify-center pt-6">
      {/* back card for depth */}
      <div className="absolute top-[30%] left-[calc(50%+0.75rem)] h-[46%] w-20 rotate-[8deg] rounded-xl border border-line-soft bg-card/80 p-2 pl-10">
        <div className="h-1 w-full rounded-full bg-accent/30" />
        <div className="mt-1.5 h-1 w-2/3 rounded-full bg-fg/10" />
        <div className="mt-1.5 h-1 w-3/4 rounded-full bg-fg/10" />
      </div>
      <div className="relative h-[82%] max-h-56 w-auto overflow-hidden rounded-[1.25rem] border border-line bg-card shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] [aspect-ratio:9/17]">
        <div className="mx-auto mt-1.5 h-1 w-8 rounded-full bg-accent/15" />
        <div className="mx-3 mt-3 h-2 w-1/2 rounded-full bg-accent/40" />
        <div className="mx-3 mt-1.5 h-1.5 w-3/4 rounded-full bg-fg/10" />
        <div className="mx-3 mt-3 h-12 rounded-lg border border-line-soft bg-[radial-gradient(circle_at_60%_45%,rgb(214_170_141/0.35)_0_3px,transparent_4px),linear-gradient(rgb(214_170_141/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(214_170_141/0.06)_1px,transparent_1px)] bg-[length:auto,10px_10px,10px_10px]" />
        <ul className="mt-2 space-y-1.5 px-3">
          {rows.map((w, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className={cn('size-2.5 shrink-0 rounded-[3px]', i === 0 ? 'bg-accent/60' : 'bg-accent/20')} />
              <span className="h-1.5 rounded-full bg-fg/12" style={{ width: `${w}%` }} />
            </li>
          ))}
        </ul>
        <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-line-soft bg-bg-elevated/80 py-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn('size-1.5 rounded-full', i === 0 ? 'bg-accent' : 'bg-accent/25')} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Event stream with one flagged row — a detector at work. */
function MonitorVisual({ seed }) {
  const flagged = 2 + Math.floor(seeded(seed, 'flag') * 3)
  const rows = Array.from({ length: 7 }, (_, i) => ({ w: 35 + seeded(seed, `w${i}`) * 45, flag: i === flagged }))
  return (
    <div className="absolute inset-x-5 top-10 bottom-4 overflow-hidden rounded-lg border border-line-soft bg-card/80">
      <div className="flex items-center gap-1.5 border-b border-line-soft px-3 py-1.5">
        <span className="size-1.5 rounded-full bg-accent/30" />
        <span className="h-1 w-10 rounded-full bg-fg/10" />
        <span className="ml-auto h-1 w-6 rounded-full bg-accent/30" />
      </div>
      <ul className="space-y-1 p-2">
        {rows.map(({ w, flag }, i) => (
          <li
            key={i}
            className={cn('flex items-center gap-2 rounded px-1.5 py-[3px]', flag && 'bg-accent/[0.09] ring-1 ring-accent/30 ring-inset')}
          >
            <span className={cn('size-1.5 shrink-0 rounded-full', flag ? 'bg-accent' : 'bg-fg/20')} />
            <span className="h-1 w-6 shrink-0 rounded-full bg-fg/10" />
            <span className={cn('h-1 rounded-full', flag ? 'bg-accent/60' : 'bg-fg/10')} style={{ width: `${w}%` }} />
            {flag && <span className="ml-auto h-1 w-5 shrink-0 rounded-full bg-accent" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Retrieved document chunks feeding a short conversation. */
function ChatVisual({ seed }) {
  return (
    <div className="absolute inset-x-5 top-10 bottom-4 flex items-center gap-3">
      <div className="flex w-[34%] flex-col gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn('rounded-md border p-1.5', i === 1 ? 'border-accent/40 bg-accent/[0.07]' : 'border-line-soft bg-card/70')}>
            <div className="h-1 rounded-full bg-fg/15" style={{ width: `${60 + seeded(seed, `c${i}`) * 35}%` }} />
            <div className="mt-1 h-1 w-2/3 rounded-full bg-fg/10" />
          </div>
        ))}
      </div>
      <div className="h-px flex-1 bg-linear-to-r from-accent/40 to-accent/5" />
      <div className="flex w-[46%] flex-col gap-2">
        <div className="ml-auto h-4 w-2/3 rounded-lg rounded-br-sm bg-accent/25" />
        <div className="space-y-1 rounded-lg rounded-bl-sm border border-line-soft bg-card p-2">
          <div className="h-1 w-full rounded-full bg-fg/15" />
          <div className="h-1 w-4/5 rounded-full bg-fg/15" />
          <div className="h-1 w-1/2 rounded-full bg-accent/40" />
        </div>
      </div>
    </div>
  )
}

/** Indented code structure. */
function CodeVisual({ seed }) {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    indent: [0, 1, 2, 2, 1, 2, 1, 0][i],
    w: 20 + seeded(seed, `l${i}`) * 45,
    accent: seeded(seed, `a${i}`) > 0.7,
  }))
  return (
    <div className="absolute inset-x-6 top-11 bottom-4 space-y-2">
      {lines.map(({ indent, w, accent }, i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: indent * 14 }}>
          <span className="w-3 text-right font-mono text-[0.55rem] text-subtle/50">{i + 1}</span>
          <span className={cn('h-1.5 rounded-full', accent ? 'bg-accent/50' : 'bg-fg/12')} style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

/**
 * Larger visual for the featured project: its stack rendered as a flow of
 * stages inside a minimal app window. `contentStyle` / `backdropStyle` take
 * Motion values from the parent for parallax at two depths.
 */
const STAGE = { hidden: { opacity: 0, transform: tf({ x: -10 }) }, show: { opacity: 1, transform: TF_REST, transition: { duration: 0.5, ease: EASE } } }
const STAGE_REDUCED = calmVariants(STAGE)

export function FeaturedVisual({ project, className, contentStyle, backdropStyle }) {
  const reduce = useReducedMotion()
  if (project.image) return <ProjectVisual project={project} className={className} />
  const Icon = projectIcon(project)

  return (
    <div aria-hidden="true" className={cn('relative isolate overflow-hidden bg-bg-elevated', className)}>
      <motion.div style={backdropStyle} className={cn('absolute -inset-8', backdropStyle && 'will-change-transform')}>
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]" />
        <div className="absolute -top-20 left-1/2 size-80 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.22),transparent)]" />
      </motion.div>

      <div className="relative flex h-full flex-col p-5 sm:p-7">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent/20" />
          <span className="size-2.5 rounded-full bg-accent/12" />
          <span className="size-2.5 rounded-full bg-accent/[0.07]" />
          <span className="ml-3 font-mono text-[0.7rem] text-subtle">~/projects/{project.slug}</span>
        </div>

        <motion.div style={contentStyle} className={cn('flex flex-1 flex-col justify-center py-6', contentStyle && 'will-change-transform')}>
          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } } }}
            className="mx-auto w-full max-w-xs transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
          >
            {project.stack.map((item, i) => (
              <motion.li key={item} variants={reduce ? STAGE_REDUCED : STAGE}>
                {i > 0 && (
                  <div className="relative mx-auto h-6 w-px overflow-hidden bg-line">
                    <span className="absolute inset-x-0 top-0 h-2 animate-flow-y bg-accent" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-line-soft bg-card/95 px-3.5 py-2.5 transition-colors duration-300 group-hover/card:border-line">
                  <span className="font-mono text-[0.7rem] text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-mono text-sm text-fg/90">{item}</span>
                  {i === project.stack.length - 1 && <Icon className="ml-auto size-4 text-accent" strokeWidth={1.75} />}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>

        <p className="flex items-center gap-2 font-mono text-[0.68rem] text-subtle">
          <span className="size-1.5 rounded-full bg-accent/70" />
          {project.stack.length} {project.stack.length === 1 ? 'technology' : 'technologies'}
        </p>
      </div>
    </div>
  )
}
