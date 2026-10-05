import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Copy, Mail, MapPin, Phone } from 'lucide-react'
import Section, { Accent } from '../components/Section.jsx'
import Reveal, { SPRING, StaggerGroup } from '../components/Reveal.jsx'
import Card from '../components/Card.jsx'
import ButtonLink, { ButtonIcon } from '../components/Button.jsx'
import BrandIcon from '../components/BrandIcon.jsx'

/**
 * Contact via mailto: (no backend). Profile links from the Excel file are
 * listed as cards with their handles.
 */
export default function Contact({ index, profile, links }) {
  return (
    <Section
      id="contact"
      index={index}
      eyebrow="Contact"
      className="overflow-hidden"
      title={
        <>
          Let&apos;s build something <Accent>together.</Accent>
        </>
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30rem] w-[min(60rem,120vw)] -translate-x-1/2 translate-y-1/3 rounded-[50%] bg-[radial-gradient(closest-side,rgb(214_170_141/0.13),transparent)]"
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <p className="max-w-lg text-lg leading-relaxed text-muted">
            Have a project, an opportunity, or just want to connect? My inbox is open.
          </p>

          {profile.email && (
            <div className="mt-9 flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-center">
              <ButtonLink href={`mailto:${profile.email}`}>
                <ButtonIcon icon={Mail} />
                Email Me
              </ButtonLink>
              <CopyEmail email={profile.email} />
            </div>
          )}

          <dl className="mt-10 space-y-4 text-[0.9375rem]">
            {profile.email && (
              <ContactRow icon={Mail} label="Email">
                <a href={`mailto:${profile.email}`} className="inline-block py-1 break-all text-fg/90 underline-offset-4 transition-colors hover:text-accent hover:underline">
                  {profile.email}
                </a>
              </ContactRow>
            )}
            {profile.phone && (
              <ContactRow icon={Phone} label="Phone">
                <a href={profile.phoneHref} className="inline-block py-1 text-fg/90 underline-offset-4 transition-colors hover:text-accent hover:underline">
                  {profile.phone}
                </a>
              </ContactRow>
            )}
            {profile.location && (
              <ContactRow icon={MapPin} label="Location">
                <span className="text-fg/90">{profile.location}</span>
              </ContactRow>
            )}
          </dl>
        </Reveal>

        {links.length > 0 && (
          <div>
            <h3 className="mb-5 font-mono text-xs tracking-[0.18em] text-subtle uppercase">Find me online</h3>
            <StaggerGroup as="ul" className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <Card key={link.url} as="li" staggered interactive className="group/card">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label}${link.handle ? ` — ${link.handle}` : ''} (opens in a new tab)`}
                    className="flex items-center gap-3.5 rounded-[inherit] p-4"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line-soft bg-bg-elevated text-muted transition-colors duration-300 group-hover/card:border-line-strong group-hover/card:text-accent">
                      <BrandIcon id={link.id} className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{link.label}</span>
                      {link.handle && <span className="block truncate font-mono text-xs text-subtle">{link.handle}</span>}
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-subtle transition-[color,transform] duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-accent"
                      aria-hidden="true"
                    />
                  </a>
                </Card>
              ))}
            </StaggerGroup>
          </div>
        )}
      </div>
    </Section>
  )
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be unavailable (insecure context / permissions) — the mailto button still works.
    }
  }

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-accent/35 px-6 text-[0.9375rem] font-medium text-accent transition-colors duration-200 hover:border-accent hover:bg-accent/10"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'done' : 'copy'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
      <span aria-live="polite">{copied ? 'Copied!' : 'Copy email'}</span>
    </motion.button>
  )
}
