import BrandIcon from './BrandIcon.jsx'
import { cn } from '../utils/format.js'

/** Row of icon-only profile links (44px touch targets). */
export default function SocialLinks({ links, className, iconClassName = 'size-[18px]' }) {
  if (!links?.length) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-1', className)}>
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (opens in a new tab)`}
            title={link.label}
            className="btn-lift grid size-11 place-items-center rounded-full text-muted hover:bg-accent/[0.08] hover:text-accent"
          >
            <BrandIcon id={link.id} className={cn('icon-glow', iconClassName)} />
          </a>
        </li>
      ))}
    </ul>
  )
}
