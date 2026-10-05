import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, Menu, X } from 'lucide-react'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrolled } from '../hooks/useScrolled.js'
import { EASE, SPRING } from './Reveal.jsx'
import { cn } from '../utils/format.js'

export default function Navbar({ profile, sections, resumeUrl, resumeFileName }) {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled()
  const active = useActiveSection(sections.map((s) => s.id))

  // Close the mobile menu on Escape, and lock page scroll while it's open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  // Close if the viewport grows to desktop width.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => e.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          'border-b transition-[background-color,border-color] duration-300',
          scrolled || open ? 'glass border-line-soft' : 'border-transparent bg-transparent',
        )}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-2.5 rounded-lg" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-xl border border-line bg-card font-mono text-xs font-semibold tracking-tight text-accent transition-colors duration-200 group-hover:border-line-strong">
              {profile.initials ?? '•'}
            </span>
            <span className="text-[0.95rem] font-medium tracking-tight text-fg">{profile.firstName ?? 'Portfolio'}</span>
          </a>

          <ul className="hidden items-center gap-0.5 md:flex">
            {sections.map((s) => {
              const isActive = active === s.id
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-3.5 py-2 text-sm transition-colors duration-200',
                      isActive ? 'text-accent' : 'text-muted hover:text-accent',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-accent/[0.08]"
                        transition={SPRING}
                      >
                        <span className="absolute -bottom-px left-1/2 h-px w-5 -translate-x-1/2 bg-accent" />
                      </motion.span>
                    )}
                    {s.label}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            {resumeUrl && (
              <motion.a
                href={resumeUrl}
                download={resumeFileName}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                className="hidden h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-bg transition-colors duration-200 hover:bg-accent-hover sm:inline-flex"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Resume
              </motion.a>
            )}
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-16 bottom-0 bg-bg/97 backdrop-blur-xl md:hidden"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-0 size-72 rounded-full bg-accent/10 blur-[90px]" />
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } } }}
              className="relative flex flex-col px-5 pt-4"
            >
              {sections.map((s, i) => (
                <motion.li
                  key={s.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { ease: EASE, duration: 0.4 } } }}
                  className="border-b border-line-soft"
                >
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={cn(
                      'flex items-baseline gap-4 py-4 text-[1.65rem] font-medium tracking-tight transition-colors',
                      active === s.id ? 'text-accent' : 'text-fg/85 hover:text-accent',
                    )}
                  >
                    <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </a>
                </motion.li>
              ))}
              {resumeUrl && (
                <motion.li variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="pt-6">
                  <a
                    href={resumeUrl}
                    download={resumeFileName}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent font-medium text-bg transition-colors hover:bg-accent-hover"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download Resume
                  </a>
                </motion.li>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
