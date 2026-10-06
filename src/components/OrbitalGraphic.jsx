import { motion } from 'motion/react'
import { cn } from '../utils/format.js'

/*
 * Abstract orbital system for the hero: two thin tilted ellipses with a few
 * warm nodes sitting on them. The only motion is one slow CSS rotation of the
 * whole system — a single compositor-only transform. (Nodes used to travel
 * along an `offset-path`, but offset-distance animates on the main thread and
 * forced a style recalculation every frame.)
 * Everything lives in a fixed 720px box; scale it with CSS, not by resizing.
 */
const SIZE = 720
const C = SIZE / 2

const ORBITS = [
  { rx: 330, ry: 112, tilt: -14, nodes: [0, 48], lead: 0 },
  // Secondary orbit is desktop-only — mobile gets a single, quieter ellipse.
  { rx: 248, ry: 170, tilt: 32, duration: 130, nodes: [22], dashed: true, className: 'max-lg:hidden' },
]

function ellipsePath(rx, ry) {
  return `M ${C - rx} ${C} A ${rx} ${ry} 0 1 1 ${C + rx} ${C} A ${rx} ${ry} 0 1 1 ${C - rx} ${C} Z`
}

export default function OrbitalGraphic({ className, style }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ width: SIZE, height: SIZE, ...style }}
      className={cn(
        'pointer-events-none absolute will-change-transform [mask-image:radial-gradient(closest-side,black_40%,transparent_100%)]',
        className,
      )}
    >
      {/* The whole system turns once every 5 minutes (CSS, compositor-only) */}
      <div className="absolute inset-0 animate-turn">
        {ORBITS.map((o) => (
          <Orbit key={o.rx} {...o} />
        ))}
        <span className="absolute top-1/2 left-1/2 size-1 -translate-1/2 rounded-full bg-accent/30" />
      </div>
    </motion.div>
  )
}

function Orbit({ rx, ry, tilt, nodes, lead, dashed, className }) {
  const d = ellipsePath(rx, ry)
  return (
    <div className={cn('absolute inset-0', className)} style={{ transform: `rotate(${tilt}deg)` }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full overflow-visible">
        <path
          d={d}
          fill="none"
          stroke="rgb(214 170 141 / 0.12)"
          strokeWidth="1"
          strokeDasharray={dashed ? '2 6' : undefined}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {nodes.map((offset) => {
        // Point on the ellipse at this fraction of a turn (computed once, at render).
        const t = (offset / 100) * Math.PI * 2 + Math.PI
        return (
          <span
            key={offset}
            className={cn('orbit-node', offset === lead && 'orbit-node-lead')}
            style={{ left: C + rx * Math.cos(t), top: C + ry * Math.sin(t) }}
          />
        )
      })}
    </div>
  )
}
