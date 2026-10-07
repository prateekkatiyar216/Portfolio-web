import { useEffect, useMemo } from 'react'
import CatCharacter from './CatCharacter.jsx'
import { buildPlaceholderCat } from './placeholderCat.js'

/**
 * Built-in low-poly cat with its own authored clips (see placeholderCat.js),
 * used until public/models/cat.glb exists or if it fails to load. It runs
 * through the same controller as a GLB, so swapping models changes nothing else.
 */
export default function CatFallback(props) {
  const cat = useMemo(buildPlaceholderCat, [])
  useEffect(() => () => cat.dispose(), [cat])
  return <CatCharacter model={cat} fit={false} {...props} />
}
