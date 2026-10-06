import { useCallback, useEffect, useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { EASE } from './Reveal.jsx'
import { useFinePointer, useMediaQuery } from '../hooks/useMediaQuery.js'
import { cn } from '../utils/format.js'

/*
 * The hero's `profile.js` card, built entirely from Excel data, with the
 * current role's stack as chips tethered to its edges.
 *
 * Desktop + mouse: the card leans ≤2° toward the pointer, a soft reflection
 * follows it, and nearby chips drift a few px toward it. All of this is
 * driven by Motion values from a single rAF-throttled listener on the hero —
 * no React renders while the pointer moves.
 * Touch / small screens / reduced motion: a still card with the chips as a row.
 * Idle loops (chip float, caret, scan light) are CSS, so they cost no JS per frame.
 */

const TILT_SPRING = { stiffness: 140, damping: 22, mass: 0.7 }
const CHIP_SPRING = { stiffness: 160, damping: 18, mass: 0.5 }
const MAX_TILT = 2 // deg
const CHIP_PULL = 6 // px, at zero distance
const CHIP_RANGE = 220 // px, pointer influence radius

// Where each chip docks on the card (desktop). `edge` decides the tether direction.
const DOCKS = [
  { edge: 'top', className: 'right-10' },
  { edge: 'bottom', className: 'left-12' },
  { edge: 'bottom', className: 'right-14' },
]
// Each chip floats on its own rhythm (CSS loops) so they never move in unison.
// Amplitudes stay at 2–4px: enough to feel suspended, not enough to draw the eye.
const FLOATS = [
  { y: 3, x: 1.5, dy: 6.2, dx: 9.1, phase: 0.4 },
  { y: 3, x: 2, dy: 7.4, dx: 8.3, phase: 1.7 },
  { y: 4, x: 1.5, dy: 5.6, dx: 10.4, phase: 3.1 },
]

export default function ProfileCard({ profile, current, education, zoneRef, delay = 0 }) {
  const reduce = useReducedMotion()
  const fine = useFinePointer()
  const desktop = useMediaQuery('(min-width: 1024px)')
  const interactive = fine && desktop && !reduce

  const cardRef = useRef(null)
  const chips = useRef([])

  // Pointer position relative to the card: -1…1 per axis (clamped), and % for the reflection.
  const nx = useMotionValue(0)
  const ny = useMotionValue(0)
  const rotateX = useSpring(useTransform(ny, [-1, 1], [MAX_TILT, -MAX_TILT]), TILT_SPRING)
  const rotateY = useSpring(useTransform(nx, [-1, 1], [-MAX_TILT, MAX_TILT]), TILT_SPRING)
  const lift = useSpring(useTransform(ny, [-1, 1], [-3, 1]), TILT_SPRING)

  const gx = useMotionValue(50)
  const gy = useMotionValue(0)
  const glare = useSpring(0, { stiffness: 80, damping: 20 })
  const reflection = useMotionTemplate`radial-gradient(26rem circle at ${gx}% ${gy}%, rgb(245 241 237 / 0.06), transparent 55%)`

  const register = useCallback((i, api) => {
    chips.current[i] = api
  }, [])

  useEffect(() => {
    const zone = zoneRef?.current
    if (!interactive || !zone) return

    let frame = 0
    let last = null
    const update = () => {
      frame = 0
      const card = cardRef.current
      if (!card || !last) return
      const r = card.getBoundingClientRect()
      const { clientX: x, clientY: y } = last
      const clamp = (v) => Math.max(-1, Math.min(1, v))
      nx.set(clamp((x - (r.left + r.width / 2)) / r.width))
      ny.set(clamp((y - (r.top + r.height / 2)) / r.height))
      gx.set(((x - r.left) / r.width) * 100)
      gy.set(((y - r.top) / r.height) * 100)
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
      glare.set(inside ? 1 : 0.35)
      chips.current.forEach((chip) => chip?.track(x, y))
    }
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      last = e
      if (!frame) frame = requestAnimationFrame(update)
    }
    const leave = () => {
      nx.set(0)
      ny.set(0)
      glare.set(0)
      chips.current.forEach((chip) => chip?.reset())
    }

    zone.addEventListener('pointermove', move, { passive: true })
    zone.addEventListener('pointerleave', leave)
    return () => {
      zone.removeEventListener('pointermove', move)
      zone.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(frame)
      leave()
    }
  }, [interactive, zoneRef, nx, ny, gx, gy, glare])

  const degree = education?.qualification?.match(/\(([^)]+)\)/)?.[1] ?? education?.qualification
  const entries = [
    ['name', profile.name],
    ['title', profile.title],
    current && ['current', [current.role, current.organization].filter(Boolean).join(' @ ')],
    education && ['education', [degree, education.end?.label].filter(Boolean).join(', ')],
    ['location', profile.location],
  ].filter((e) => e && e[1])
  const tags = (current?.tags ?? []).slice(0, DOCKS.length)

  if (entries.length < 2) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
      aria-hidden="true"
    >
      {/* No idle float on the card itself: the pointer tilt gives it life, the chips give it lightness */}
      <div className="relative">
        <motion.div
          ref={cardRef}
          style={interactive ? { rotateX, rotateY, y: lift, transformPerspective: 1100 } : undefined}
          className="relative will-change-transform"
        >
          <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-accent/35 via-accent/[0.04] to-accent/20" />
          <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-accent/[0.06] blur-2xl" />

          <div className="relative overflow-hidden rounded-2xl bg-card shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
            {/* Top-edge sheen + pointer reflection */}
            <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-fg/20 to-transparent" />
            {interactive && <motion.div style={{ backgroundImage: reflection, opacity: glare }} className="pointer-events-none absolute inset-0" />}
            {!reduce && <ScanLight delay={delay + 1.6} />}

            <div className="flex items-center gap-1.5 border-b border-line-soft px-4 py-3">
              <span className="size-2.5 rounded-full bg-accent/25" />
              <span className="size-2.5 rounded-full bg-accent/15" />
              <span className="size-2.5 rounded-full bg-accent/[0.08]" />
              <span className="ml-3 font-mono text-[0.7rem] text-subtle">profile.js</span>
            </div>

            <pre className="relative py-4 font-mono text-[0.75rem] leading-7 sm:text-[0.8rem]">
              <code className="block">
                <CodeLine n={1}>
                  <span className="text-accent-hover">const</span> <span className="text-accent">developer</span>{' '}
                  <span className="text-subtle">=</span> <span className="text-muted">{'{'}</span>
                </CodeLine>
                {entries.map(([key, value], i) => (
                  <CodeLine key={key} n={i + 2} indent>
                    <span className="text-muted">{key}</span>
                    <span className="text-subtle">: </span>
                    <span className="text-accent-soft [overflow-wrap:anywhere]">&quot;{value}&quot;</span>
                    <span className="text-subtle">,</span>
                  </CodeLine>
                ))}
                <CodeLine n={entries.length + 2}>
                  <span className="text-muted">{'}'}</span>
                  <Caret />
                </CodeLine>
              </code>
            </pre>
          </div>
        </motion.div>

        {/* Desktop: chips docked to the card's edges (inside the float, so tethers stay attached) */}
        <div className="hidden lg:block">
          {tags.map((tag, i) => (
            <DockedChip
              key={tag}
              index={i}
              label={tag}
              dock={DOCKS[i]}
              float={FLOATS[i]}
              animated={desktop && !reduce}
              register={interactive ? register : null}
              delay={delay + 0.6 + i * 0.14}
            />
          ))}
        </div>
      </div>

      {/* Mobile / tablet: the same chips as a quiet row under the card */}
      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2 lg:hidden">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full border border-line bg-bg-elevated/80 px-3 py-1 font-mono text-[0.72rem] text-accent">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

/** One code row: line number gutter + content; warms up on hover like an editor's current line. */
function CodeLine({ n, indent, children }) {
  return (
    <span className="group/line relative grid grid-cols-[2.75rem_minmax(0,1fr)] pr-5 transition-colors duration-200 hover:bg-accent/[0.045]">
      <span className="absolute inset-y-0 left-0 w-px bg-accent opacity-0 transition-opacity duration-200 group-hover/line:opacity-70" />
      <span className="pr-4 text-right text-subtle/45 tabular-nums transition-colors duration-200 select-none group-hover/line:text-accent/70">
        {n}
      </span>
      {/* Indented lines get a hanging indent, so a wrapped value continues under the value like an editor's soft-wrap */}
      <span className={cn('whitespace-normal', indent && 'pl-[calc(1.25rem+2ch)] -indent-[2ch]')}>{children}</span>
    </span>
  )
}

/** Block caret with a hard blink, like a real editor (not a soft pulse). */
function Caret() {
  return <span className="ml-1 inline-block h-4 w-[7px] translate-y-[3px] animate-caret bg-accent" />
}

/** A faint band of light that sweeps down the card once every 11s. Rests off-card between sweeps. */
function ScanLight({ delay }) {
  return (
    <div
      style={{ transform: 'translateY(-30%)', animationDelay: `${delay}s` }}
      className="pointer-events-none absolute inset-x-0 top-0 h-full animate-scan bg-[linear-gradient(to_bottom,transparent_0%,rgb(214_170_141/0.03)_14%,rgb(214_170_141/0.06)_19%,transparent_22%)]"
    />
  )
}

/**
 * Tech chip docked to a card edge by a hairline tether. The anchor (with the
 * tether) never moves; the chip itself floats and leans toward the pointer.
 */
function DockedChip({ index, label, dock, float, animated, register, delay }) {
  const anchor = useRef(null)
  const ox = useSpring(0, CHIP_SPRING)
  const oy = useSpring(0, CHIP_SPRING)

  useEffect(() => {
    if (!register) return
    register(index, {
      track(px, py) {
        const r = anchor.current?.getBoundingClientRect()
        if (!r) return
        // Measure from the chip end of the anchor, not the tether end.
        const cx = r.left + r.width / 2
        const cy = dock.edge === 'top' ? r.top + 14 : r.bottom - 14
        const dx = px - cx
        const dy = py - cy
        const dist = Math.hypot(dx, dy) || 1
        const pull = Math.max(0, 1 - dist / CHIP_RANGE) * CHIP_PULL
        ox.set((dx / dist) * pull)
        oy.set((dy / dist) * pull)
      },
      reset() {
        ox.set(0)
        oy.set(0)
      },
    })
    return () => register(index, null)
  }, [register, index, dock.edge, ox, oy])

  const top = dock.edge === 'top'
  return (
    <div
      ref={anchor}
      className={cn(
        'absolute flex items-center',
        top ? 'bottom-[calc(100%-3px)] flex-col' : 'top-[calc(100%-3px)] flex-col-reverse',
        dock.className,
      )}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay }}
        style={{ x: ox, y: oy }}
        className="relative z-10"
      >
        <span
          className={cn('block', animated && 'animate-float-x')}
          style={{ '--float-x': `${float.x}px`, '--float-dx': `${float.dx}s`, animationDelay: `-${float.phase * 1.6}s` }}
        >
          <span
            className={cn(
              'block rounded-full border border-line bg-bg-elevated/90 px-3 py-1 font-mono text-[0.72rem] whitespace-nowrap text-accent shadow-[0_10px_30px_-12px_rgb(0_0_0/0.8)] backdrop-blur',
              animated && 'animate-float-y',
            )}
            style={{ '--float-y': `${float.y}px`, '--float-dy': `${float.dy}s`, animationDelay: `-${float.phase}s` }}
          >
            {label}
          </span>
        </span>
      </motion.span>

      {/* Tether: fades out toward the chip, lands on the card edge as a node */}
      <motion.span
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: delay + 0.15 }}
        className={cn(
          'h-6 w-px from-transparent to-accent/40',
          top ? 'origin-bottom bg-linear-to-b' : 'origin-top bg-linear-to-t',
        )}
      />
      <span className="size-[5px] rounded-full bg-accent/60 ring-3 ring-accent/10" />
    </div>
  )
}
