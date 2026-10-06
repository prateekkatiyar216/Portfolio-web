import { motion } from 'motion/react'
import { cn } from '../utils/format.js'

/*
 * Abstract orbital system for the hero: two thin tilted ellipses with a few
 * warm nodes travelling along them. Nodes ride the exact same path via CSS
 * `offset-path`, so the drawing and the motion can never drift apart.
 * Everything lives in a fixed 720px box; scale it with CSS, not by resizing.
 */
const SIZE = 720
const C = SIZE / 2

const ORBITS = [
  { rx: 330, ry: 112, tilt: -14, duration: 90, nodes: [0, 48], lead: 0 },
  // Secondary orbit is desktop-only — mobile gets a single, quieter ellipse.
  { rx: 248, ry: 170, tilt: 32, duration: 130, nodes: [22], dashed: true, reverse: true, className: 'max-lg:hidden' },
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
        'pointer-events-none absolute [mask-image:radial-gradient(closest-side,black_40%,transparent_100%)]',
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

function Orbit({ rx, ry, tilt, duration, nodes, lead, dashed, reverse, className }) {
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
      {nodes.map((offset) => (
        <span
          key={offset}
          className={cn('orbit-node animate-orbit', offset === lead && 'orbit-node-lead')}
          style={{
            offsetPath: `path('${d}')`,
            '--o': `${offset}%`,
            animationDuration: `${duration}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
        />
      ))}
    </div>
  )
}
