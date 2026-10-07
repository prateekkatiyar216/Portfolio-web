import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AnimationMixer, Box3, CanvasTexture, LoopOnce, LoopRepeat, MathUtils, Quaternion, Vector3 } from 'three'
import { CAT, CAT_STATES } from './catConfig.js'

const { RESTING, STANDING, WALKING, LYING_DOWN } = CAT_STATES
const UP = new Vector3(0, 1, 0)
const ROLES = ['walk', 'stand', 'lie', 'rest', 'idle']

/**
 * Plays any `{ scene, animations }` (a GLB, or the built-in placeholder) as a
 * small character that walks the scroll path and lies down when scrolling stops.
 *
 *   RESTING ──scroll──▶ STANDING ──▶ WALKING ──stopped & arrived──▶ LYING_DOWN ──▶ RESTING
 *      ▲                    ▲                                            │
 *      └────────────────────┴──────────── scroll again ◀─────────────────┘
 *
 * Everything runs in useFrame on refs: no React state, no extra scroll
 * listeners. Scroll only sets the *target* position on the path; the cat
 * walks there at its own (capped) speed, and the walk clip's playback rate
 * follows the distance actually covered, so the feet carry the body.
 */
export default function CatCharacter({ model, fit = true, motion, reduce, onReady }) {
  const { scene, animations } = model
  const { progress, signal, wrapper } = motion
  const turner = useRef(null)
  const invalidate = useThree((s) => s.invalidate)

  const clips = useMemo(() => resolveClips(animations), [animations])
  const mixer = useMemo(() => new AnimationMixer(scene), [scene])
  const actions = useMemo(
    () => Object.fromEntries(Object.entries(clips).map(([role, clip]) => [role, mixer.clipAction(clip)])),
    [clips, mixer],
  )
  const canWalk = Boolean(actions.walk) && !reduce

  const placement = useMemo(() => {
    if (!fit) return { scale: 1, offset: [0, 0, 0], rotationY: 0 }
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    return {
      scale: CAT.model.length / Math.max(size.x, size.z, 1e-6),
      offset: [-center.x, -box.min.y, -center.z],
      rotationY: CAT.model.rotationY,
    }
  }, [scene, fit])

  const shadow = useMemo(makeShadowTexture, [])
  useEffect(() => () => shadow.dispose(), [shadow])

  const sim = useRef(null)

  // Mount: lie down where the page currently is, already resting.
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info(
        '[ScrollCat] clips in model:', animations.map((c) => c.name),
        '→ using', Object.fromEntries(ROLES.map((r) => [r, clips[r]?.name ?? null])),
      )
    }
    if (!actions.walk) console.warn('[ScrollCat] model has no walk clip — the cat will rest in place instead of sliding.')

    const s = {
      state: RESTING,
      since: performance.now(),
      p: reduce ? CAT.reducedMotionProgress : progress.get(),
      v: 0,
      current: null,
      arrivedAt: null,
      wander: 0,
      targetQ: new Quaternion().setFromAxisAngle(UP, CAT.heading.rest),
    }
    sim.current = s
    turner.current.quaternion.copy(s.targetQ)
    if (wrapper.current) wrapper.current.dataset.state = RESTING

    if (actions.rest && !reduce) play(s, actions.rest, 0, true)
    else if (actions.lie) {
      play(s, actions.lie, 0, false)
      actions.lie.time = actions.lie.getClip().duration
    } else if (actions.idle) play(s, actions.idle, 0, true)
    mixer.update(0)

    // Free gutter width beside the canvas (CSS `right` of .scroll-cat), re-read on resize only.
    const measure = () => {
      const el = wrapper.current
      s.wander = el ? Math.max(0, parseFloat(getComputedStyle(el).right) - 8) : 0
      invalidate()
    }
    measure()
    window.addEventListener('resize', measure)
    onReady()
    return () => {
      window.removeEventListener('resize', measure)
      mixer.stopAllAction()
    }
  }, [actions, animations, clips, mixer, progress, reduce, wrapper, invalidate, onReady])

  useFrame((state, delta) => {
    const s = sim.current
    const g = turner.current
    if (!s || !g) return
    // Clamp: after an idle gap (demand frameloop, hidden tab) delta can be seconds,
    // which would finish crossfades in one frame and make the pose pop.
    const dt = Math.min(delta, 1 / 20)
    const now = performance.now()
    const W = state.size.width
    const pxPerUnit = W / state.viewport.width
    const lateralPx = s.wander + CAT.path.worldX * pxPerUnit

    const scrolling = now - signal.current.at < CAT.scroll.idleMs
    const target = canWalk ? progress.get() : s.p
    const slope = pathSlope(s.p, lateralPx) // screen px per unit of progress
    const gap = (target - s.p) * slope.len // signed px still to walk
    const far = Math.abs(gap)
    const dir = Math.sign(gap) || 1
    const elapsed = (now - s.since) / 1000
    const W_ = CAT.walk

    // ---- state machine (actions change only on transitions) ----
    const enter = (next) => {
      s.state = next
      s.since = now
      if (wrapper.current) wrapper.current.dataset.state = next // transitions only — handy in devtools
      if (next === STANDING) {
        if (actions.stand) play(s, actions.stand, CAT.fade.stand, false)
      } else if (next === WALKING) {
        actions.walk.timeScale = W_.minTimeScale
        play(s, actions.walk, actions.stand ? CAT.fade.walk : CAT.fade.standNoClip, true)
      } else if (next === LYING_DOWN) {
        s.v = 0
        if (actions.lie) play(s, actions.lie, CAT.fade.lie, false)
        else if (actions.idle) play(s, actions.idle, CAT.fade.lie, true)
      } else if (next === RESTING) {
        if (actions.rest) play(s, actions.rest, CAT.fade.rest, true)
      }
    }
    if (canWalk) {
      if (s.state === RESTING && far > W_.startDistance) enter(STANDING)
      else if (s.state === STANDING) {
        // Start walking a little before the stand-up clip ends; the crossfade covers the overlap.
        const standTime = actions.stand ? actions.stand.getClip().duration * 0.75 : 0
        if (elapsed >= standTime) enter(WALKING)
      } else if (s.state === WALKING) {
        const arrived = far <= W_.arriveDistance && Math.abs(s.v) < 4
        s.arrivedAt = arrived ? (s.arrivedAt ?? now) : null
        // Lie down only once the visitor has stopped *and* the cat has got there.
        if (arrived && !scrolling && now - s.arrivedAt > 150) enter(LYING_DOWN)
      } else if (s.state === LYING_DOWN) {
        if (far > W_.startDistance) enter(STANDING)
        else if (elapsed >= (actions.lie ? actions.lie.getClip().duration : 0.3)) enter(RESTING)
      }
    }

    // ---- heading: face the direction of travel, or turn to the resting angle ----
    const moving = s.state === STANDING || s.state === WALKING
    const angle = moving ? travelHeading(slope, dir) : CAT.heading.rest
    s.targetQ.setFromAxisAngle(UP, angle)
    const off = g.quaternion.angleTo(s.targetQ)
    const turnRate = W_.turnSpeed * (moving ? 1 : 0.6)
    if (!reduce) g.quaternion.rotateTowards(s.targetQ, turnRate * dt)
    else g.quaternion.copy(s.targetQ)

    // ---- walking: accelerate / brake towards the target, never overshoot ----
    if (s.state === WALKING) {
      const walk = actions.walk
      const strideSpeed = (W_.stride * W) / walk.getClip().duration // px/s at timeScale 1
      const accel = W_.accel * W
      // Far behind → hurry, but never faster than the legs can play (that would read as sliding).
      const top = Math.min(W_.maxSpeed * W, W_.maxTimeScale * strideSpeed)
      const cruise = Math.min(top, Math.max(W_.speed * W, far * 1.5))
      const brake = Math.sqrt(2 * accel * Math.max(0, far - W_.arriveDistance))
      const wanted = off > W_.turnBeforeMove ? 0 : dir * Math.min(cruise, brake) // turn round first, then go
      s.v += MathUtils.clamp(wanted - s.v, -accel * dt, accel * dt)
      const before = s.p
      s.p = MathUtils.clamp(s.p + (s.v * dt) / slope.len, 0, 1)
      if ((target - before) * (target - s.p) < 0) {
        s.p = target
        s.v = 0
      }
      // Feet match ground speed: one cycle per `stride` of travel; turning on the spot = slow steps.
      const rate = off > W_.turnBeforeMove ? W_.minTimeScale : Math.abs(s.v) / strideSpeed
      walk.timeScale = MathUtils.damp(walk.timeScale, Math.min(rate, W_.maxTimeScale), 12, dt)
    } else if (s.state === LYING_DOWN && !actions.lie && !actions.idle && actions.walk) {
      // No lie-down clip and no idle: let the walk come to a halt rather than invent a pose.
      actions.walk.timeScale = MathUtils.damp(actions.walk.timeScale, 0, 8, dt)
    }

    // ---- place: DOM wrapper carries the vertical travel, the scene a little sideways sway ----
    const lat = Math.sin(s.p * CAT.path.waves * Math.PI * 2)
    g.position.x = lat * CAT.path.worldX
    if (wrapper.current) {
      const y = (MathUtils.lerp(CAT.path.y.from, CAT.path.y.to, s.p) / 100) * window.innerHeight - state.size.height / 2
      wrapper.current.style.transform = `translate3d(${(lat * s.wander).toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }

    mixer.update(reduce ? 0 : dt)

    // Keep rendering while anything moves; resting breathing is paced by the idle ticker.
    if (!reduce && (s.state !== RESTING || off > 0.01)) invalidate()
  })

  return (
    <group ref={turner}>
      <group rotation-y={placement.rotationY} scale={placement.scale}>
        <primitive object={scene} position={placement.offset} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position-y={0.003} scale={[...CAT.shadow.size, 1]} renderOrder={-1}>
        <planeGeometry />
        <meshBasicMaterial map={shadow} color="#000000" transparent opacity={CAT.shadow.opacity} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Crossfade from whatever is playing to `action` — a no-op if it is already the current clip. */
function play(s, action, fade, loop) {
  if (s.current === action) return
  action.reset()
  action.setLoop(loop ? LoopRepeat : LoopOnce, Infinity)
  action.clampWhenFinished = !loop
  if (fade > 0) action.fadeIn(fade)
  else action.setEffectiveWeight(1)
  action.play()
  if (s.current) {
    if (fade > 0) s.current.fadeOut(fade)
    else s.current.stop()
  }
  s.current = action
}

/** Map clips to roles: explicit names from CAT.clips win, otherwise the first unused name match. */
function resolveClips(animations) {
  const used = new Set()
  const out = {}
  for (const role of ROLES) {
    const name = CAT.clips[role]
    const clip = name
      ? animations.find((c) => c.name === name)
      : animations.find((c) => !used.has(c) && CAT.clipPatterns[role].test(c.name))
    if (clip) {
      used.add(clip)
      out[role] = clip
    }
  }
  return out
}

/** Screen-space derivative of the path at progress p: vertical px/p and lateral px/p. */
function pathSlope(p, lateralPx) {
  const w = CAT.path.waves * Math.PI * 2
  const dy = ((CAT.path.y.to - CAT.path.y.from) / 100) * window.innerHeight
  const dx = Math.cos(p * w) * w * lateralPx
  return { dx, dy, len: Math.hypot(dx, dy) }
}

/**
 * Ground-plane heading (rotation about y, 0 = facing the viewer) for travel in
 * direction `dir`. Down the screen reads as towards the viewer, up as away;
 * the lateral S turns the cat side to side, and `pageBias` keeps it 3/4 on.
 */
function travelHeading(slope, dir) {
  const { lateralGain, pageBias } = CAT.heading
  const hz = dir
  const hx = MathUtils.clamp(((dir * slope.dx) / Math.abs(slope.dy)) * lateralGain, -1.2, 1.2) - pageBias
  return Math.atan2(hx, hz)
}

/** Soft elliptical contact shadow — one tiny texture instead of a depth pass per frame. */
function makeShadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}
