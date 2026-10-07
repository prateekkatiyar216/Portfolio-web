import {
  AnimationClip,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  QuaternionKeyframeTrack,
  SphereGeometry,
  TorusGeometry,
  VectorKeyframeTrack,
} from 'three'
import { CAT } from './catConfig.js'

/*
 * Built-in low-poly cat, used until public/models/cat.glb exists (or if it
 * fails to load). It is built like a tiny rigged model: named joint groups
 * plus authored keyframe clips (Walk, StandUp, LieDown, Rest), so it goes
 * through exactly the same AnimationMixer path as a real GLB.
 *
 * Faces +z, feet on y = 0, standing in its bind pose.
 * Joints: body › neck › head, body › leg{FL,FR,BL,BR} › knee{…}, body › tail › tail2 › tail3
 */

const LEGS = ['FL', 'FR', 'BL', 'BR']
const UPPER = 0.16
const LOWER = 0.14
const BODY_Y = 0.405

/** Joint rotations (Euler XYZ) and body height for the two key poses. */
const STAND = {
  body: [0, 0, 0],
  bodyY: BODY_Y,
  neck: [0, 0, 0],
  head: [0, 0, 0],
  legFL: [0, 0, 0], kneeFL: [0, 0, 0],
  legFR: [0, 0, 0], kneeFR: [0, 0, 0],
  legBL: [0, 0, 0], kneeBL: [0, 0, 0],
  legBR: [0, 0, 0], kneeBR: [0, 0, 0],
  tail: [-0.55, 0, 0], tail2: [0.45, 0, 0], tail3: [0.5, 0, 0],
}
// The loaf: front paws forward, thighs forward with hind paws tucked under, tail curled round the near (+x) side.
const LIE = {
  body: [0, 0, 0],
  bodyY: 0.2,
  neck: [0.22, 0, 0],
  head: [-0.1, 0, 0.12],
  legFL: [-1.25, 0, 0], kneeFL: [0, 0, 0],
  legFR: [-1.25, 0, 0], kneeFR: [0, 0, 0],
  legBL: [-1.2, 0, 0.25], kneeBL: [2.3, 0, 0],
  legBR: [-1.2, 0, -0.25], kneeBR: [2.3, 0, 0],
  tail: [-2.15, 0, 0], tail2: [0.55, 0, -0.9], tail3: [0.1, 0, -0.9],
}
const JOINTS = Object.keys(STAND).filter((k) => k !== 'bodyY')

export function buildPlaceholderCat() {
  const geo = {
    sphere: new SphereGeometry(1, 16, 12),
    small: new SphereGeometry(1, 8, 6),
    upper: new CapsuleGeometry(0.052, UPPER, 3, 8),
    lower: new CapsuleGeometry(0.043, LOWER, 3, 8),
    ear: new ConeGeometry(0.075, 0.15, 4),
    tail: new CapsuleGeometry(0.034, 0.17, 3, 8),
    collar: new TorusGeometry(0.15, 0.018, 6, 28),
    tag: new CylinderGeometry(0.032, 0.032, 0.012, 10),
  }
  const mat = {
    fur: new MeshStandardMaterial({ color: CAT.colors.fur, roughness: 0.82, flatShading: true }),
    light: new MeshStandardMaterial({ color: CAT.colors.furLight, roughness: 0.82, flatShading: true }),
    accent: new MeshStandardMaterial({ color: CAT.colors.accent, roughness: 0.45, metalness: 0.3 }),
    tag: new MeshStandardMaterial({ color: CAT.colors.accent, roughness: 0.35, metalness: 0.5, emissive: CAT.colors.accent, emissiveIntensity: 0.15 }),
    eye: new MeshBasicMaterial({ color: CAT.colors.eyes }),
    nose: new MeshStandardMaterial({ color: CAT.colors.nose, roughness: 0.6 }),
  }

  const mesh = (g, m, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) => {
    const o = new Mesh(g, m)
    o.position.set(...pos)
    o.scale.set(...scale)
    o.rotation.set(...rot)
    return o
  }
  const joint = (name, pos, ...children) => {
    const g = new Group()
    g.name = name
    g.position.set(...pos)
    g.add(...children)
    return g
  }

  // Head
  const head = joint(
    'head',
    [0, 0.11, 0.1],
    mesh(geo.sphere, mat.fur, [0, 0, 0], [0.19, 0.17, 0.18]),
    mesh(geo.sphere, mat.light, [0, -0.05, 0.15], [0.08, 0.06, 0.075]),
    mesh(geo.small, mat.nose, [0, -0.025, 0.222], [0.017, 0.014, 0.014]),
    ...[1, -1].flatMap((s) => [
      mesh(geo.ear, mat.fur, [0.095 * s, 0.15, -0.02], [1, 1, 1], [0, 0, -0.28 * s]),
      mesh(geo.small, mat.eye, [0.072 * s, 0.025, 0.158], [0.021, 0.021, 0.012]),
    ]),
  )
  const neck = joint(
    'neck',
    [0, 0.08, 0.36],
    head,
    // Collar + tag: the one accent-coloured detail
    mesh(geo.collar, mat.accent, [0, 0.04, 0.02], [1, 1, 1], [-0.75, 0, 0]),
    mesh(geo.tag, mat.tag, [0, -0.07, 0.13], [1, 1, 1], [Math.PI / 2 - 0.75, 0, 0]),
  )

  const legs = LEGS.map((id) => {
    const front = id[0] === 'F'
    const side = id[1] === 'L' ? 1 : -1
    const knee = joint(
      `knee${id}`,
      [0, -UPPER, 0],
      mesh(geo.lower, mat.fur, [0, -LOWER / 2, 0]),
      mesh(geo.sphere, mat.fur, [0, -LOWER, 0.02], [0.052, 0.033, 0.07]),
    )
    return joint(`leg${id}`, [0.115 * side, -0.08, front ? 0.27 : -0.27], mesh(geo.upper, mat.fur, [0, -UPPER / 2, 0]), knee)
  })

  const tail3 = joint('tail3', [0, 0.17, 0], mesh(geo.tail, mat.fur, [0, 0.085, 0]), mesh(geo.small, mat.light, [0, 0.19, 0], [0.036, 0.036, 0.036]))
  const tail2 = joint('tail2', [0, 0.17, 0], mesh(geo.tail, mat.fur, [0, 0.085, 0]), tail3)
  const tail = joint('tail', [0, 0.06, -0.42], mesh(geo.tail, mat.fur, [0, 0.085, 0]), tail2)

  const body = joint(
    'body',
    [0, BODY_Y, 0],
    mesh(geo.sphere, mat.fur, [0, 0, 0], [0.22, 0.2, 0.44]),
    mesh(geo.sphere, mat.fur, [0, 0.02, 0.22], [0.2, 0.2, 0.22]),
    mesh(geo.sphere, mat.fur, [0, 0.01, -0.22], [0.215, 0.2, 0.23]),
    neck,
    tail,
    ...legs,
  )
  const scene = joint('cat', [0, 0, 0], body)
  applyPose(scene, STAND)

  const dispose = () => {
    Object.values(geo).forEach((g) => g.dispose())
    Object.values(mat).forEach((m) => m.dispose())
  }
  return { scene, animations: buildClips(), dispose }
}

function applyPose(scene, pose) {
  for (const name of JOINTS) scene.getObjectByName(name)?.rotation.set(...pose[name])
  scene.getObjectByName('body').position.y = pose.bodyY
}

/* ---------- clips ---------- */

const ease = (t) => t * t * (3 - 2 * t)
const window01 = (t, a, b) => ease(MathUtils.clamp((t - a) / (b - a), 0, 1))

/**
 * Samples `fn(t) → pose` into one quaternion track per joint plus a body
 * position track. Every clip animates every joint, so blends never fall back
 * to the bind pose for a joint one clip forgot.
 */
function sampleClip(name, duration, frames, fn, extra) {
  const times = Array.from({ length: frames + 1 }, (_, i) => (i / frames) * duration)
  const poses = times.map((t) => fn(t / duration))
  const q = new Quaternion()
  const e = new Euler()
  const tracks = JOINTS.map((j) => {
    const values = poses.flatMap((p) => q.setFromEuler(e.set(...p[j])).toArray())
    return new QuaternionKeyframeTrack(`${j}.quaternion`, times, values)
  })
  tracks.push(new VectorKeyframeTrack('body.position', times, poses.flatMap((p) => [0, p.bodyY, 0])))
  tracks.push(extra?.(times, poses) ?? new VectorKeyframeTrack('body.scale', [0, duration], [1, 1, 1, 1, 1, 1]))
  return new AnimationClip(name, duration, tracks)
}

const mixPose = (a, b, w) => {
  const out = { bodyY: MathUtils.lerp(a.bodyY, b.bodyY, typeof w === 'function' ? w('bodyY') : w) }
  for (const j of JOINTS) {
    const k = typeof w === 'function' ? w(j) : w
    out[j] = a[j].map((v, i) => MathUtils.lerp(v, b[j][i], k))
  }
  return out
}
const isFront = (j) => /F[LR]$|neck|head/.test(j)
const isHind = (j) => /B[LR]$|tail/.test(j)

function buildClips() {
  // Walk: lateral-sequence gait (BL → FL → BR → FR), 60% stance / 40% swing.
  const PHASE = { BL: 0, FL: 0.25, BR: 0.5, FR: 0.75 }
  const walk = sampleClip('Walk', 0.8, 32, (t) => {
    const p = structuredClone(STAND)
    const cyc = t * Math.PI * 2
    for (const id of LEGS) {
      const s = (t + PHASE[id]) % 1
      const amp = id[0] === 'F' ? 0.42 : 0.38
      let angle
      let bend = 0
      if (s < 0.6) {
        angle = MathUtils.lerp(-amp, amp, s / 0.6) // planted: sweeps back under the body
      } else {
        const u = (s - 0.6) / 0.4
        angle = MathUtils.lerp(amp, -amp, ease(u)) // lifted: swings forward
        bend = Math.sin(u * Math.PI) * (id[0] === 'F' ? 0.95 : 0.8)
      }
      p[`leg${id}`] = [angle, 0, 0]
      p[`knee${id}`] = [bend, 0, 0]
    }
    p.bodyY = BODY_Y + 0.012 * Math.cos(cyc * 2) - 0.006
    p.body = [0, 0, 0.03 * Math.sin(cyc)]
    p.neck = [0.04 * Math.sin(cyc * 2), 0.04 * Math.sin(cyc), 0]
    p.tail = [-0.55 + 0.05 * Math.sin(cyc), 0.08 * Math.sin(cyc), 0]
    p.tail2 = [0.45, 0, 0.18 * Math.sin(cyc + 1)]
    p.tail3 = [0.5, 0, 0.22 * Math.sin(cyc + 1.6)]
    return p
  })

  // Lie down: hindquarters go first (body pitches nose-up), front follows.
  const lie = sampleClip('LieDown', 0.7, 21, (t) => {
    const back = window01(t, 0, 0.6)
    const front = window01(t, 0.3, 1)
    const p = mixPose(STAND, LIE, (j) => (j === 'bodyY' ? ease(t) : isHind(j) ? back : isFront(j) ? front : ease(t)))
    p.body = [-0.16 * Math.sin(Math.PI * t), 0, 0]
    return p
  })

  // Stand up: front first (nose-up push), then the hind legs.
  const stand = sampleClip('StandUp', 0.45, 14, (t) => {
    const front = window01(t, 0, 0.6)
    const back = window01(t, 0.3, 1)
    const p = mixPose(LIE, STAND, (j) => (j === 'bodyY' ? ease(t) : isFront(j) ? front : isHind(j) ? back : ease(t)))
    p.body = [-0.14 * Math.sin(Math.PI * t), 0, 0]
    return p
  })

  // Rest: the loaf, breathing, with a slow tail-tip sway.
  const rest = sampleClip(
    'Rest',
    4.2,
    24,
    (t) => {
      const p = structuredClone(LIE)
      p.tail3 = [0.1, 0, -0.9 + 0.12 * Math.sin(t * Math.PI * 2)]
      p.head = [-0.1 + 0.02 * Math.sin(t * Math.PI * 2), 0, 0.12]
      return p
    },
    (times) =>
      new VectorKeyframeTrack(
        'body.scale',
        times,
        times.flatMap((time) => {
          const b = (1 - Math.cos((time / 4.2) * Math.PI * 2)) / 2
          return [1 + 0.006 * b, 1 + 0.018 * b, 1 + 0.004 * b]
        }),
      ),
  )

  return [walk, stand, lie, rest]
}
