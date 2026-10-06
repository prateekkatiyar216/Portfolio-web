import { motion } from 'motion/react'
import { cn } from '../utils/format.js'

/*
 * A small, hand-placed technical network used as section decor. Positions
 * are fixed (no randomness), so it renders identically every time.
 * Fully static: SVG children cannot be GPU-composited, so animating them would
 * repaint the whole graphic every frame.
 */
const LAYOUTS = {
  a: {
    w: 260,
    h: 170,
    nodes: [[10, 26], [92, 14], [168, 30], [250, 16], [52, 92], [132, 82], [214, 104], [140, 160]],
    edges: [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [4, 5], [5, 6], [2, 6], [5, 7]],
    hub: 5,
  },
  b: {
    w: 240,
    h: 180,
    nodes: [[20, 150], [74, 96], [150, 120], [226, 70], [110, 30], [190, 166], [30, 50]],
    edges: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 3], [2, 5], [6, 1], [6, 4]],
    hub: 1,
  },
}

export default function NetworkGraphic({ variant = 'a', className }) {
  const { w, h, nodes, edges, hub } = LAYOUTS[variant]
  const [hx, hy] = nodes[hub]

  return (
    <motion.svg
      aria-hidden="true"
      viewBox={`-6 -6 ${w + 12} ${h + 12}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, ease: 'easeOut' }}
      className={cn('pointer-events-none absolute overflow-visible', className)}
    >
      <g stroke="rgb(214 170 141 / 0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <circle cx={hx} cy={hy} r="9" fill="none" stroke="rgb(214 170 141 / 0.08)" />
      <g fill="rgb(214 170 141 / 0.15)">
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === hub ? 3 : 2} />
        ))}
      </g>
    </motion.svg>
  )
}
