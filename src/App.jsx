import { MotionConfig } from 'motion/react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Experience from './sections/Experience.jsx'
import Projects from './sections/Projects.jsx'
import Skills from './sections/Skills.jsx'
import Education from './sections/Education.jsx'
import Contact from './sections/Contact.jsx'
import { visibleSections } from './config/navigation.js'

export default function App({ data }) {
  const sections = visibleSections(data)
  // Section numbers ("01", "02"…) follow whichever sections are actually shown.
  const indexOf = (id) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')
  const has = (id) => sections.some((s) => s.id === id)
  const current = data.experience.find((e) => e.current) ?? null

  return (
    // reducedMotion="user": transform animations are skipped when the OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <Navbar profile={data.profile} sections={sections} resumeUrl={data.resumeUrl} resumeFileName={data.resumeFileName} />

      <main id="main">
        <Hero
          profile={data.profile}
          links={data.links}
          current={current}
          education={data.education[0]}
          skills={data.skills}
          resumeUrl={data.resumeUrl}
          resumeFileName={data.resumeFileName}
          hasProjects={has('projects')}
        />
        {has('about') && (
          <About
            index={indexOf('about')}
            profile={data.profile}
            skills={data.skills}
            projects={data.projects}
            experience={data.experience}
            education={data.education}
            certifications={data.certifications}
          />
        )}
        {has('experience') && <Experience index={indexOf('experience')} experience={data.experience} />}
        {has('projects') && <Projects index={indexOf('projects')} projects={data.projects} featured={data.featuredProject} />}
        {has('skills') && <Skills index={indexOf('skills')} skills={data.skills} />}
        {has('education') && (
          <Education
            index={indexOf('education')}
            education={data.education}
            certifications={data.certifications}
            achievements={data.achievements}
          />
        )}
        <Contact index={indexOf('contact')} profile={data.profile} links={data.links} />
      </main>

      <Footer profile={data.profile} links={data.links} />
    </MotionConfig>
  )
}
