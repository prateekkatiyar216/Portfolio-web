import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Download, Mail, MapPin } from 'lucide-react'
import ButtonLink, { ButtonIcon } from '../components/Button.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import OrbitalGraphic from '../components/OrbitalGraphic.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import { EASE } from '../components/Reveal.jsx'
import { highlightTerms } from '../utils/highlight.jsx'

/*
 * Entrance timeline (seconds). One beat per idea — who, what, direction,
 * where to go next — then the card arrives as the "proof".
 * Reduced motion: <MotionConfig reducedMotion="user"> drops the transforms,
 * so every step degrades to a plain fade on the same schedule.
 */
const T = { badge: 0.15, greeting: 0.32, name: 0.42, title: 0.95, intro: 1.1, cta: 1.25, meta: 1.4, card: 1.15, scroll: 2.4 }

/** Fade + short rise, used by every hero line except the name. */
function rise(delay, y = 16) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  }
}

/** First sentence of a paragraph — the hero gets the short version, About gets the rest. */
function firstSentence(text) {
  if (!text) return null
  const match = text.match(/^.+?[.!?](\s|$)/)
  return (match ? match[0] : text).trim()
}

export default function Hero({ profile, links, current, education, skills, resumeUrl, resumeFileName, hasProjects }) {
  const sectionRef = useRef(null)
  const reduce = useReducedMotion()
  const intro = profile.tagline ?? firstSentence(profile.summary)
  const titleParts = profile.title ? profile.title.split(/\s*\/\s*/).filter(Boolean) : []

  // Name words rise out of a mask and come into focus — the one "cinematic" moment.
  const nameWord = (i) => ({
    initial: { y: '108%', opacity: 0, filter: reduce ? 'none' : 'blur(10px)' },
    animate: { y: '0%', opacity: 1, filter: reduce ? 'none' : 'blur(0px)' },
    transition: { duration: 1.1, ease: EASE, delay: T.name + i * 0.14 },
  })

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      data-cursor-light
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16"
    >
      <HeroBackground />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 pt-14 pb-20 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          {current && (
            <motion.p
              {...rise(T.badge, 10)}
              className="mb-8 inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-line bg-card/50 py-1.5 pr-4 pl-3 text-xs leading-snug text-muted backdrop-blur-sm sm:rounded-full sm:text-[0.8rem]"
            >
              <span className="size-1.5 shrink-0 animate-pulse-dot rounded-full bg-accent" aria-hidden="true" />
              <span>
                Currently <span className="text-fg">{current.role}</span>
                {current.organization && <> at {current.organization}</>}
              </span>
            </motion.p>
          )}

          <motion.p {...rise(T.greeting, 10)} className="flex items-center gap-3 font-mono text-sm tracking-wide text-accent">
            <span className="h-px w-6 bg-accent/50" aria-hidden="true" />
            Hi, I&apos;m
          </motion.p>

          <h1 className="mt-4 text-[3.1rem] leading-[0.92] font-semibold tracking-[-0.045em] min-[400px]:text-[3.6rem] sm:text-[5.2rem] lg:text-[6.25rem]">
            <span className="sr-only">{profile.name}</span>
            <span aria-hidden="true" className="flex flex-wrap gap-x-[0.24em]">
              {profile.firstName && (
                <span className="inline-block overflow-hidden pb-[0.08em]">
                  <motion.span {...nameWord(0)} className="inline-block">
                    {profile.firstName}
                  </motion.span>
                </span>
              )}
              {profile.lastName && (
                <span className="inline-block overflow-hidden pr-[0.08em] pb-[0.08em]">
                  <motion.span {...nameWord(1)} className="accent-word inline-block text-[1.06em] tracking-[-0.02em]">
                    {profile.lastName}
                  </motion.span>
                </span>
              )}
            </span>
          </h1>

          {titleParts.length > 0 && (
            <motion.p
              {...rise(T.title)}
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-medium tracking-tight text-fg/90 sm:text-[1.375rem]"
            >
              {/* Separators trail their word, so a wrapped line never starts with "/" */}
              {titleParts.map((part, i) => (
                <span key={part} className="flex items-center gap-3">
                  {part}
                  {i < titleParts.length - 1 && (
                    <span className="font-light text-accent/60" aria-hidden="true">
                      /
                    </span>
                  )}
                </span>
              ))}
            </motion.p>
          )}

          {intro && (
            <motion.p {...rise(T.intro)} className="mt-5 max-w-[34rem] text-base leading-relaxed text-muted sm:text-[1.0625rem]">
              {highlightTerms(intro, skills.all)}
            </motion.p>
          )}

          <motion.div {...rise(T.cta)} className="mt-9 flex flex-col gap-3 min-[440px]:flex-row">
            {resumeUrl && (
              <ButtonLink href={resumeUrl} download={resumeFileName}>
                <ButtonIcon icon={Download} direction="down" />
                Download Resume
              </ButtonLink>
            )}
            {hasProjects && (
              <ButtonLink href="#projects" variant={resumeUrl ? 'secondary' : 'primary'}>
                View My Work
                <ButtonIcon icon={ArrowRight} />
              </ButtonLink>
            )}
            {!resumeUrl && (
              <ButtonLink href="#contact" variant="secondary">
                <ButtonIcon icon={Mail} />
                Get in Touch
              </ButtonLink>
            )}
          </motion.div>

          <motion.div {...rise(T.meta, 8)} className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <SocialLinks links={links} className="-ml-3" />
            {profile.location && (
              <>
                <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
                <p className="flex items-center gap-1.5 text-sm text-subtle">
                  <MapPin className="size-3.5 text-accent/80" aria-hidden="true" />
                  {profile.location}
                </p>
              </>
            )}
          </motion.div>
        </div>

        <ProfileCard profile={profile} current={current} education={education} zoneRef={sectionRef} delay={T.card} />
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to About"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.scroll, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.7rem] tracking-[0.2em] text-subtle uppercase transition-colors hover:text-accent md:flex"
      >
        Scroll
        {/* Nudges three times after the entrance, then rests — a hint, not a loop */}
        <span className="animate-nudge [animation-delay:2.6s]">
          <ArrowDown className="size-3.5" aria-hidden="true" />
        </span>
      </motion.a>
    </section>
  )
}

function HeroBackground() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  // Glow drifts down slower than the page — a gentle depth cue.
  const glowY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 160])
  const glowOpacity = useTransform(scrollY, [0, 700], [1, 0.35])
  // Orbit sits "further away" than the glow: it trails the page less.
  const orbitY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 90])
  const orbitOpacity = useTransform(scrollY, [0, 600], [1, 0])

  return (
    // The grid comes from the page-wide <AmbientBackground>; the bottom is masked
    // (not painted over) so the hero dissolves into the next section without a seam.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      <motion.div style={{ y: glowY, opacity: glowOpacity }} className="absolute inset-0">
        {/* Signature light source — wanders on two unsynced CSS loops (31s / 23s), so it never visibly repeats */}
        <div className="absolute top-[-18rem] left-1/2 h-[42rem] w-[min(78rem,170vw)] -translate-x-1/2">
          <div className="size-full animate-wander-x">
            <div className="size-full animate-wander-y rounded-[50%] bg-[radial-gradient(closest-side,rgb(214_170_141/0.18),rgb(214_170_141/0.06)_50%,transparent)]" />
          </div>
        </div>
        {/* Secondary warmth behind the profile card (static — the ambient layer already drifts) */}
        <div className="absolute top-[22%] right-[4%] size-[22rem] rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.07),transparent)]" />
      </motion.div>

      {/* Behind the profile card on desktop; a single faint orbit behind the name on mobile */}
      <div className="absolute inset-0 opacity-45 lg:opacity-100">
        <OrbitalGraphic
          style={{ y: orbitY, opacity: orbitOpacity }}
          className="top-[2%] left-1/2 -translate-x-1/2 scale-[0.6] sm:scale-75 lg:top-1/2 lg:right-[-6rem] lg:left-auto lg:translate-x-0 lg:-translate-y-1/2 lg:scale-100 xl:right-[calc(50%-42.5rem)]"
        />
      </div>
    </div>
  )
}
