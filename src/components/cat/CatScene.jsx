import { Component, Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import CatModel from './CatModel.jsx'
import CatFallback from './CatFallback.jsx'
import { CAT } from './catConfig.js'

/*
 * One small transparent canvas. frameloop="demand": frames are drawn while the
 * cat is walking / turning / changing pose, plus a throttled idle tick for
 * breathing — never a free-running 60fps loop while the visitor just reads.
 */
export default function CatScene({ hasModel, reduce, progress, wrapper, onReady }) {
  const { camera } = CAT
  // Last scroll time, written by Pacer, read by the character every frame (a ref: no renders).
  const signal = useRef({ at: -Infinity })
  const character = { motion: { progress, signal, wrapper }, reduce, onReady }

  return (
    <Canvas
      frameloop="demand"
      dpr={CAT.dpr}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 20 }}
      onCreated={(state) => state.camera.lookAt(...camera.target)}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.2} color={CAT.colors.keyLight} />
      <directionalLight position={[2, 4, 3]} intensity={2.4} color={CAT.colors.keyLight} />
      {/* Warm rim from above-behind, in the site accent: separates the dark fur from the dark page */}
      <directionalLight position={[-1.2, 2.5, -3]} intensity={5} color={CAT.colors.accent} />

      <Pacer progress={progress} signal={signal} idle={!reduce} />
      <Suspense fallback={null}>
        {hasModel ? (
          <ModelBoundary fallback={<CatFallback {...character} />}>
            <CatModel {...character} />
          </ModelBoundary>
        ) : (
          <CatFallback {...character} />
        )}
      </Suspense>
    </Canvas>
  )
}

/**
 * Wakes the canvas: on every scroll change (Motion's shared scroll value — no
 * extra window listener), and at a low rate while idle so a resting cat breathes.
 */
function Pacer({ progress, signal, idle }) {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(
    () =>
      progress.on('change', () => {
        signal.current.at = performance.now()
        invalidate()
      }),
    [progress, signal, invalidate],
  )

  useEffect(() => {
    if (!idle) return
    const root = document.documentElement
    const interval = 1000 / CAT.idleFps
    let raf = 0
    let last = 0
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      if (t - last < interval) return
      last = t
      // Same animation budget as the ambient loops: hold still while a foreground UI has focus.
      if (!root.hasAttribute('data-ui-focus')) invalidate()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [idle, invalidate])

  return null
}

/** A broken / unparsable GLB falls back to the built-in cat instead of taking the canvas down. */
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('[ScrollCat] cat.glb failed to load, using the placeholder cat.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
