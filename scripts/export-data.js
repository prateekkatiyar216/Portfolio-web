#!/usr/bin/env node
/**
 * Inspect / validate the Excel data without starting the site.
 *
 *   npm run data          -> writes the normalized data to portfolio-data.json
 *   npm run data:check    -> prints a summary + warnings, exits 1 on warnings
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadPortfolio, ROOT } from './loadPortfolio.js'

const portfolio = loadPortfolio()
const check = process.argv.includes('--check')
const { warnings } = portfolio.meta

console.log(`Source: ${portfolio.meta.source ?? '(none)'}`)
console.table({
  links: portfolio.links.length,
  experience: portfolio.experience.length,
  projects: portfolio.projects.length,
  'skill groups': portfolio.skills.groups.length,
  skills: portfolio.skills.all.length,
  education: portfolio.education.length,
  certifications: portfolio.certifications.length,
  achievements: portfolio.achievements.length,
})
console.log(`Featured project: ${portfolio.featuredProject?.name ?? '(none)'}`)
console.log(`Resume PDF: ${portfolio.resumeUrl ?? 'not found (add public/resume.pdf)'}`)
for (const w of warnings) console.warn(`⚠ ${w}`)

if (check) {
  process.exit(warnings.length ? 1 : 0)
} else {
  const out = path.join(ROOT, 'portfolio-data.json')
  fs.writeFileSync(out, JSON.stringify(portfolio, null, 2))
  console.log(`\nWrote ${path.relative(ROOT, out)}`)
}
