import { siGithub, siLeetcode, siHackerrank, siTryhackme, siCodeforces, siCodechef, siGeeksforgeeks, siKaggle, siX } from 'simple-icons'
import { Globe } from 'lucide-react'

// LinkedIn was removed from simple-icons (trademark policy) and from Lucide,
// so its glyph is inlined here.
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

const PATHS = {
  github: siGithub.path,
  linkedin: LINKEDIN_PATH,
  leetcode: siLeetcode.path,
  hackerrank: siHackerrank.path,
  tryhackme: siTryhackme.path,
  codeforces: siCodeforces?.path,
  codechef: siCodechef?.path,
  gfg: siGeeksforgeeks?.path,
  kaggle: siKaggle?.path,
  twitter: siX?.path,
}

/** Monochrome brand glyph for a link id from the data layer; falls back to a globe. */
export default function BrandIcon({ id, className = 'size-4' }) {
  const path = PATHS[id]
  if (!path) return <Globe className={className} aria-hidden="true" />
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  )
}
