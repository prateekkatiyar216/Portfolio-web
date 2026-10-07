import { useGLTF } from '@react-three/drei'
import CatCharacter from './CatCharacter.jsx'
import { CAT } from './catConfig.js'

/**
 * Loads public/models/cat.glb (scene + animation clips) and hands it to the
 * character controller, which auto-fits it (CAT.model.length, feet on y = 0)
 * and maps its clips to walk / stand / lie / rest by name (CAT.clips).
 */
export default function CatModel(props) {
  const gltf = useGLTF(CAT.model.url)
  return <CatCharacter model={gltf} {...props} />
}
