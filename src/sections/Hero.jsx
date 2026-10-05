import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Download, Mail, MapPin } from 'lucide-react'
import ButtonLink, { ButtonIcon } from '../components/Button.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import { EASE } from '../components/Reveal.jsx'
import { highlightTerms } from '../utils/highlight.jsx'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } }
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }
// Each word of the name rises out of a mask.
const word = { hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.95, ease: EASE } } }

/** First sentence of a paragraph — the hero gets the short version, About gets the rest. */
function firstSentence(text) {
  if (!text) return null
  const match = text.match(/^.+?[.!?](\s|$)/)
  return (match ? match[0] : text).trim()
}

export default function Hero({ profile, links, current, education, skills, resumeUrl, resumeFileName, hasProjects }) {
  const intro = profile.tagline ?? firstSentence(profile.summary)
  const titleParts = profile.title ? profile.title.split(/\s*\/\s*/).filter(Boolean) : []

  return (
    <section id="top" aria-label="Introduction" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
      <HeroBackground />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
        <motion.div variants={container} initial="hidden" animate="show">
          {current && (
            <motion.p
              variants={item}
              className="mb-9 inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-line bg-card/60 py-1.5 pr-4 pl-3 text-xs leading-snug text-muted backdrop-blur-sm sm:rounded-full sm:text-[0.8rem]"
            >
              <span className="size-1.5 shrink-0 animate-pulse-dot rounded-full bg-accent" aria-hidden="true" />
              <span>
                Currently <span className="text-fg">{current.role}</span>
                {current.organization && <> at {current.organization}</>}
              </span>
            </motion.p>
          )}

          <motion.p variants={item} className="font-mono text-sm tracking-wide text-accent">
            Hi, I&apos;m
          </motion.p>

          <h1 className="mt-4 text-[3rem] leading-[0.92] font-semibold tracking-[-0.045em] min-[400px]:text-[3.6rem] sm:text-[5.2rem] lg:text-[6.25rem]">
            <span className="sr-only">{profile.name}</span>
            <motion.span variants={container} aria-hidden="true" className="flex flex-wrap gap-x-[0.24em]">
              {profile.firstName && (
                <span className="inline-block overflow-hidden pb-[0.08em]">
                  <motion.span variants={word} className="inline-block">
                    {profile.firstName}
                  </motion.span>
                </span>
              )}
              {profile.lastName && (
                <span className="inline-block overflow-hidden pr-[0.08em] pb-[0.08em]">
                  <motion.span variants={word} className="accent-word inline-block text-[1.06em] tracking-[-0.02em]">
                    {profile.lastName}
                  </motion.span>
                </span>
              )}
            </motion.span>
          </h1>

          {titleParts.length > 0 && (
            <motion.p variants={item} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-medium tracking-tight text-fg sm:text-[1.375rem]">
              {/* Separators trail their word, so a wrapped line never starts with "/" */}
              {titleParts.map((part, i) => (
                <span key={part} className="flex items-center gap-3">
                  {part}
                  {i < titleParts.length - 1 && (
                    <span className="font-light text-accent/70" aria-hidden="true">
                      /
                    </span>
                  )}
                </span>
              ))}
            </motion.p>
          )}

          {intro && (
            <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-[1.0625rem]">
              {highlightTerms(intro, skills.all)}
            </motion.p>
          )}

          <motion.div variants={item} className="mt-10 flex flex-col gap-3 min-[440px]:flex-row">
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

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
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
        </motion.div>

        <ProfileCard profile={profile} current={current} education={education} />
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to About"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.7rem] tracking-[0.2em] text-subtle uppercase transition-colors hover:text-accent md:flex"
      >
        Scroll
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDown className="size-3.5" aria-hidden="true" />
        </motion.span>
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

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_65%_55%_at_50%_30%,black,transparent)]" />
      <motion.div style={{ y: glowY, opacity: glowOpacity }} className="absolute inset-0">
        <div className="absolute top-[-14rem] left-1/2 h-[34rem] w-[min(64rem,140vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(214_170_141/0.22),transparent)]" />
        <div className="absolute top-[22%] right-[4%] size-[22rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(214_170_141/0.10),transparent)]" />
        <div
          className="absolute bottom-[8%] left-[2%] size-[18rem] animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(201_149_120/0.08),transparent)]"
          style={{ animationDelay: '-13s' }}
        />
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-bg" />
    </div>
  )
}

/** A code-styled card built entirely from Excel data, with the current role's stack floating around it. Desktop only. */
function ProfileCard({ profile, current, education }) {
  const degree = education?.qualification?.match(/\(([^)]+)\)/)?.[1] ?? education?.qualification
  const entries = [
    ['name', profile.name],
    ['title', profile.title],
    current && ['current', [current.role, current.organization].filter(Boolean).join(' @ ')],
    education && ['education', [degree, education.end?.label].filter(Boolean).join(', ')],
    ['location', profile.location],
  ].filter((e) => e && e[1])
  const chips = (current?.tags ?? []).slice(0, 3)
  const chipPositions = ['-top-5 right-8', 'top-1/2 -left-10', '-bottom-5 right-16']

  if (entries.length < 2) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: EASE, delay: 0.55 }}
      className="relative hidden lg:block"
      aria-hidden="true"
    >
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="relative">
        <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-accent/35 via-accent/[0.04] to-accent/20" />
        <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-accent/[0.06] blur-2xl" />
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
          <div className="flex items-center gap-1.5 border-b border-line-soft px-4 py-3">
            <span className="size-2.5 rounded-full bg-accent/25" />
            <span className="size-2.5 rounded-full bg-accent/15" />
            <span className="size-2.5 rounded-full bg-accent/[0.08]" />
            <span className="ml-3 font-mono text-[0.7rem] text-subtle">profile.js</span>
          </div>
          <pre className="overflow-hidden px-5 py-5 font-mono text-[0.8rem] leading-7">
            <code>
              <span className="text-accent-hover">const</span> <span className="text-accent">developer</span> <span className="text-subtle">=</span>{' '}
              <span className="text-muted">{'{'}</span>
              {'\n'}
              {entries.map(([key, value]) => (
                <span key={key} className="block pl-5">
                  <span className="text-muted">{key}</span>
                  <span className="text-subtle">: </span>
                  <span className="whitespace-normal text-accent-soft [overflow-wrap:anywhere]">&quot;{value}&quot;</span>
                  <span className="text-subtle">,</span>
                </span>
              ))}
              <span className="text-muted">{'}'}</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                className="ml-1 inline-block h-4 w-[7px] translate-y-[3px] bg-accent"
              />
            </code>
          </pre>
        </div>
      </motion.div>

      {chips.map((chip, i) => (
        <motion.span
          key={chip}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, i % 2 ? 6 : -6, 0] }}
          transition={{
            opacity: { delay: 1.1 + i * 0.15, duration: 0.5 },
            scale: { delay: 1.1 + i * 0.15, duration: 0.5, ease: EASE },
            y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 },
          }}
          className={`absolute ${chipPositions[i]} rounded-full border border-line bg-bg-elevated/90 px-3 py-1 font-mono text-[0.72rem] text-accent shadow-[0_10px_30px_-12px_rgb(0_0_0/0.8)] backdrop-blur`}
        >
          {chip}
        </motion.span>
      ))}
    </motion.div>
  )
}
