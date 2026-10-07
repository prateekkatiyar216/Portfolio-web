import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion, useScroll } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { CAT } from './catConfig.js'

// three.js + R3F live in their own chunk, fetched only once the page is idle on a wide screen.
const CatScene = lazy(() => import('./CatScene.jsx'))

/*
 * A small cat in the right-hand gutter that walks along a path while the page
 * scrolls and lies down when scrolling stops (logic: CatCharacter.jsx).
 *
 * This wrapper only decides *whether* the cat exists (wide screen, WebGL,
 * page idle) and passes Motion's shared scrollYProgress down. The frame loop
 * positions the wrapper directly, so scrolling never re-renders React.
 */
export default function ScrollCat() {
  const wide = useMediaQuery(CAT.media)
  const reduce = useReducedMotion()
  const [armed, setArmed] = useState(null) // null until idle; then { hasModel }
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  const { scrollYProgress } = useScroll()
  const wrapper = useRef(null)

  useEffect(() => {
    if (!wide || armed) return
    let cancelled = false
    const arm = async () => {
      if (!supportsWebGL()) return
      const hasModel = await modelExists(CAT.model.url)
      if (!cancelled) setArmed({ hasModel })
    }
    // Enhancement only: wait for the page to load and the main thread to go quiet.
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(arm, { timeout: 2500 }) : setTimeout(arm, 600))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', idle)
    }
  }, [wide, armed])

  if (!wide || !armed) return null

  return (
    <div ref={wrapper} aria-hidden="true" className="scroll-cat" data-ready={ready || undefined}>
      <SceneBoundary>
        <Suspense fallback={null}>
          <CatScene
            hasModel={armed.hasModel}
            reduce={reduce}
            progress={scrollYProgress}
            wrapper={wrapper}
            onReady={markReady}
          />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}

/** If WebGL or the scene chunk fails for any reason, the cat quietly disappears. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function supportsWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext() // free the probe context straight away
    return Boolean(gl)
  } catch {
    return false
  }
}

/** A missing file usually comes back as the SPA's index.html (200) or a 404 — both mean "no model". */
async function modelExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok && !(res.headers.get('content-type') ?? '').includes('text/html')
  } catch {
    return false
  }
}
