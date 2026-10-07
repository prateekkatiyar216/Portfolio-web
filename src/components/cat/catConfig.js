/*
 * Scroll cat — every tunable number lives here; the components only read it.
 *
 * Behaviour: the cat lies in the right-hand gutter. When the page scrolls it
 * gets up and walks along a path (down the screen as you scroll down, turning
 * round and walking back up as you scroll up), then lies down again shortly
 * after scrolling stops. Scroll decides *where* it should be; the cat decides
 * how fast it walks there, so a flick of the wheel never makes it teleport.
 *
 * Placement: the gutter right of the max-w-6xl column, *behind* page content
 * (z-index below the sections). Below `media` there's no gutter, so the 3D cat
 * isn't loaded and the footer shows a static silhouette (CatSilhouette).
 *
 * Model: drop a rigged, animated GLB at public/models/cat.glb and it replaces
 * the built-in placeholder (which carries its own authored clips). Clips are
 * matched by name (see `clips`); in dev the console lists what was found.
 */

const deg = (d) => (d * Math.PI) / 180

export const CAT_STATES = {
  RESTING: 'resting',
  STANDING: 'standing',
  WALKING: 'walking',
  LYING_DOWN: 'lying_down',
}

export const CAT = {
  /** Where the 3D cat is allowed to exist (needs a real side gutter). */
  media: '(min-width: 1280px)',

  model: {
    url: '/models/cat.glb',
    /** Longest horizontal side of the model after auto-fit, in world units. */
    length: 1.25,
    /** Turn a replacement model so it faces +z (the glTF convention) — e.g. Math.PI / 2. */
    rotationY: 0,
  },

  /*
   * Clip names. `null` = auto-detect with the pattern. Set an exact clip name
   * to override (e.g. walk: 'Armature|Walk_Cycle').
   */
  clips: {
    walk: null,
    stand: null,
    lie: null,
    rest: null,
    idle: null,
  },
  clipPatterns: {
    walk: /walk|trot/i,
    stand: /stand.?up|get.?up|rise|^stand$/i,
    lie: /lie.?down|lay.?down|lying.?down|^lie$|^lay$|to.?lie|to.?lay|sit.?down/i,
    rest: /rest|sleep|lying|lie.?idle|lay.?idle|loaf/i,
    idle: /idle|breath/i,
  },

  /** Pixel ratio cap — the canvas is ~150px wide, 1.5× is plenty. */
  dpr: [1, 1.5],
  /** Wrapper height as a fraction of its width (see .scroll-cat in index.css). */
  aspect: 0.8,
  /** Pitched down a little, so "down the screen" reads as walking towards you. */
  camera: { position: [0, 1.55, 3.3], fov: 26, target: [0, 0.32, 0] },

  /*
   * The path, as a function of page progress p (0 → 1):
   *   vertical   from y.from to y.to (vh) — always the same direction as the scroll
   *   lateral    a gentle S: sin(p · waves · 2π) across the free gutter, plus a
   *              little sway inside the canvas (worldX, in world units)
   */
  path: { y: { from: 34, to: 84 }, waves: 2.5, worldX: 0.15 },

  scroll: {
    /** No scroll event for this long = the visitor has stopped scrolling. */
    idleMs: 180,
  },

  walk: {
    /** Screen distance per walk cycle, as a fraction of the canvas width. Tune to stop foot-sliding. */
    stride: 0.2,
    /** Cruising speed and catch-up cap, in canvas widths per second (also capped by maxTimeScale × stride). */
    speed: 0.35,
    maxSpeed: 0.75,
    accel: 1.6, // canvas widths / s²
    /** Never play the walk slower / faster than this (turning on the spot uses the minimum). */
    minTimeScale: 0.45,
    maxTimeScale: 3,
    /** Distance (px) the target must get ahead before a resting cat bothers to get up. */
    startDistance: 8,
    /** Within this distance (px) the cat counts as arrived. */
    arriveDistance: 1.5,
    /** Turn speed (rad/s), and how far off-heading it may be before it starts moving. */
    turnSpeed: 4.2,
    turnBeforeMove: deg(55),
  },

  /*
   * Heading on the ground plane: down the screen = towards the viewer (+z).
   * `pageBias` angles it towards the page side so the walk is seen 3/4, not head-on.
   */
  heading: { pageBias: 0.55, lateralGain: 2.5, rest: deg(-58) },

  /** Crossfade times (s) between clips. */
  fade: { stand: 0.15, walk: 0.25, lie: 0.25, rest: 0.4, standNoClip: 0.35 },

  /** Idle frames per second while resting (breathing). Walking renders at full rate. */
  idleFps: 30,

  /** prefers-reduced-motion: the cat rests here, fully still. */
  reducedMotionProgress: 0.1,

  shadow: { opacity: 0.45, size: [0.75, 1.35] },

  colors: {
    fur: '#433d39',
    furLight: '#7d7068',
    eyes: '#121010',
    nose: '#a8806b',
    accent: '#d6aa8d',
    keyLight: '#f5f1ed',
  },
}
