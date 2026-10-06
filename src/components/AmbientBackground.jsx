import { useEffect, useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useFinePointer } from '../hooks/useMediaQuery.js'

/*
 * One fixed environment behind the whole page, so sections read as rooms of
 * the same space rather than stacked slabs. Layers, back to front:
 *
 *   atmosphere → grid (+ major lines) → radial field → light field → cursor light → grain
 *
 * Each section has a "scene": where the two warm lights sit and how strong the
 * grid / structure is. When a section crosses the middle of the viewport its
 * scene becomes the spring target, so the background drifts over a few
 * seconds — slow enough to be felt rather than seen.
 *
 * No React state is involved: IntersectionObserver and pointer events write
 * straight into Motion values, which update transforms / opacity off-render.
 */

// a / b: light positions in viewport % · warmth: light strength · grid / major / rings: 0–1 layer strength
const SCENES = {
  top: { a: [50, 4], b: [84, 36], warmth: 0.75, grid: 0.75, major: 0, rings: 0 },
  about: { a: [14, 30], b: [86, 74], warmth: 0.7, grid: 0.4, major: 0, rings: 0 },
  experience: { a: [86, 20], b: [12, 82], warmth: 0.6, grid: 0.6, major: 1, rings: 0 },
  projects: { a: [50, 10], b: [92, 88], warmth: 0.65, grid: 1, major: 0.35, rings: 0 },
  skills: { a: [72, 48], b: [12, 16], warmth: 0.6, grid: 0.4, major: 0, rings: 1 },
  education: { a: [22, 36], b: [82, 80], warmth: 0.6, grid: 0.55, major: 0.5, rings: 0 },
  contact: { a: [50, 96], b: [50, 18], warmth: 1, grid: 0.45, major: 0, rings: 0 },
}
const SCENE_SPRING = { stiffness: 14, damping: 12, mass: 1 } // overdamped: no wobble, ~3s settle
const CURSOR_SPRING = { stiffness: 120, damping: 25, mass: 0.5 } // smooth, no jitter
const GRID = 64

export default function AmbientBackground() {
  const reduce = useReducedMotion()
  // Touch devices get the lighter profile: no scroll-linked grid movement (smooth scrolling first).
  const fine = useFinePointer()
  const start = SCENES.top

  const ax = useSpring(start.a[0], SCENE_SPRING)
  const ay = useSpring(start.a[1], SCENE_SPRING)
  const bx = useSpring(start.b[0], SCENE_SPRING)
  const by = useSpring(start.b[1], SCENE_SPRING)
  const warmth = useSpring(start.warmth, SCENE_SPRING)
  const grid = useSpring(start.grid, SCENE_SPRING)
  const major = useSpring(start.major, SCENE_SPRING)
  const rings = useSpring(start.rings, SCENE_SPRING)

  const lightA = useMotionTemplate`translate3d(calc(${ax}vw - 50%), calc(${ay}vh - 50%), 0)`
  const lightB = useMotionTemplate`translate3d(calc(${bx}vw - 50%), calc(${by}vh - 50%), 0)`
  const warmthB = useTransform(warmth, (w) => w * 0.7)

  // Grid scrolls at a fraction of page speed (wrapped to one cell) — depth without a tall layer.
  const { scrollY } = useScroll()
  const gridY = useTransform(scrollY, (v) => -((v * 0.18) % (GRID * 2)))

  useEffect(() => {
    const apply = (id) => {
      const s = SCENES[id]
      if (!s) return
      // Reduced motion: lights stay put; only strengths cross-fade.
      if (!reduce) {
        ax.set(s.a[0])
        ay.set(s.a[1])
        bx.set(s.b[0])
        by.set(s.b[1])
      }
      warmth.set(s.warmth)
      grid.set(s.grid)
      major.set(s.major)
      rings.set(s.rings)
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && apply(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    document.querySelectorAll('main section[id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [reduce, ax, ay, bx, by, warmth, grid, major, rings])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden [contain:strict]">
      {/* Atmosphere: faint warm haze from above, darker corners */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-10%,rgb(214_170_141/0.05),transparent_60%),radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.4))]" />

      {/* Architectural grid + major lines every second cell */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_85%_70%_at_50%_42%,black_15%,transparent_100%)]">
        <motion.div style={{ y: reduce || !fine ? 0 : gridY }} className={`absolute inset-x-0 -top-32 -bottom-32 ${fine ? 'will-change-transform' : ''}`}>
          <motion.div style={{ opacity: grid }} className="absolute inset-0 bg-grid" />
          <motion.div style={{ opacity: major }} className="absolute inset-0 bg-grid-major" />
        </motion.div>
      </div>

      {/* Radial field — concentric rings, strongest around Skills */}
      <motion.svg
        style={{ opacity: rings }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full [mask-image:radial-gradient(circle_at_68%_50%,black_10%,transparent_62%)]"
      >
        {[90, 170, 250, 330, 410].map((r, i) => (
          <circle
            key={r}
            cx="680"
            cy="500"
            r={r}
            fill="none"
            stroke="rgb(214 170 141 / 0.07)"
            strokeDasharray={i % 2 ? '2 7' : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </motion.svg>

      {/* Light field — two soft lights that relocate per section and breathe slowly */}
      <motion.div style={{ transform: lightA, opacity: warmth }} className="absolute top-0 left-0">
        <div className="size-[min(64rem,150vw)] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.08),rgb(214_170_141/0.03)_50%,transparent)]" />
      </motion.div>
      <motion.div style={{ transform: lightB, opacity: warmthB }} className="absolute top-0 left-0">
        <div
          className="size-[min(44rem,120vw)] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.05),transparent)]"
          style={{ animationDelay: '-13s' }}
        />
      </motion.div>

      <CursorLight disabled={reduce} />

      <div className="absolute inset-0 bg-grain" />
    </div>
  )
}

/**
 * Very soft warm light trailing the pointer — only inside opt-in zones
 * (elements with `data-cursor-light`, e.g. the hero), so the rest of the page
 * stays still. Desktop only; off for reduced motion.
 */
function CursorLight({ disabled }) {
  const fine = useFinePointer()
  const enabled = fine && !disabled

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, CURSOR_SPRING)
  const sy = useSpring(y, CURSOR_SPRING)
  const opacity = useSpring(0, { stiffness: 40, damping: 20 })
  const seen = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      const inZone = e.target instanceof Element && e.target.closest('[data-cursor-light]')
      if (!inZone) {
        opacity.set(0)
        return
      }
      x.set(e.clientX)
      y.set(e.clientY)
      // First sighting: appear where the cursor is instead of sweeping in from a corner.
      if (!seen.current) {
        sx.jump(e.clientX)
        sy.jump(e.clientY)
        seen.current = true
      }
      opacity.set(1)
    }
    const leave = () => opacity.set(0)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      opacity.jump(0)
      seen.current = false
    }
  }, [enabled, x, y, sx, sy, opacity])

  if (!enabled) return null
  return (
    <motion.div
      style={{ x: sx, y: sy, opacity }}
      className="absolute top-[-26rem] left-[-26rem] size-[52rem] rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.07),rgb(214_170_141/0.025)_45%,transparent)] will-change-transform"
    />
  )
}
