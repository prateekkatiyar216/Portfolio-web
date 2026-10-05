import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseExcel } from '../src/data/parseExcel.js'
import { normalizePortfolioData, slugify } from '../src/data/normalizeData.js'

/**
 * Build-time entry point of the data pipeline (Node only):
 *
 *   public/data/*.xlsx  --parseExcel()-->  rows  --normalizePortfolioData()-->  portfolio
 *
 * Also detects optional static assets so the UI can light them up
 * automatically when they are added:
 *   public/resume.pdf (or any public/*resume*.pdf) -> "Download Resume" button
 *   public/projects/<project-slug>.(webp|png|jpg|jpeg|avif) -> project image
 */

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PUBLIC_DIR = path.join(ROOT, 'public')
export const DATA_DIR = path.join(PUBLIC_DIR, 'data')
export const PROJECT_IMAGES_DIR = path.join(PUBLIC_DIR, 'projects')

const IMAGE_EXT = ['.webp', '.avif', '.png', '.jpg', '.jpeg']

/** A PDF in the public/ root whose name contains "resume" (e.g. resume.pdf, Resume_tech.pdf). */
export function isResumeFile(file) {
  return path.dirname(path.resolve(file)) === PUBLIC_DIR && /resume.*\.pdf$/i.test(path.basename(file))
}

/** The resume to link: `resume.pdf` if present, otherwise the first matching PDF alphabetically. */
export function findResume() {
  if (!fs.existsSync(PUBLIC_DIR)) return null
  const pdfs = fs.readdirSync(PUBLIC_DIR).filter((f) => isResumeFile(path.join(PUBLIC_DIR, f))).sort()
  const file = pdfs.find((f) => f.toLowerCase() === 'resume.pdf') ?? pdfs[0]
  return file ? `/${encodeURIComponent(file)}` : null
}

/** The workbook to read: the first .xlsx in public/data (ignoring Excel lock files). */
export function findWorkbook() {
  if (!fs.existsSync(DATA_DIR)) return null
  const preferred = path.join(DATA_DIR, 'Prateek_Katiyar_Resume_Data.xlsx')
  if (fs.existsSync(preferred)) return preferred
  const file = fs.readdirSync(DATA_DIR).find((f) => /\.xlsx$/i.test(f) && !f.startsWith('~$'))
  return file ? path.join(DATA_DIR, file) : null
}

function detectProjectImages() {
  if (!fs.existsSync(PROJECT_IMAGES_DIR)) return {}
  const images = {}
  for (const file of fs.readdirSync(PROJECT_IMAGES_DIR)) {
    const ext = path.extname(file).toLowerCase()
    if (!IMAGE_EXT.includes(ext)) continue
    const slug = slugify(path.basename(file, ext))
    // Prefer modern formats when several exist for the same project.
    if (!images[slug] || IMAGE_EXT.indexOf(ext) < IMAGE_EXT.indexOf(path.extname(images[slug]))) {
      images[slug] = `/projects/${file}`
    }
  }
  return images
}

export function loadPortfolio() {
  const workbook = findWorkbook()
  let sheets = {}
  const warnings = []

  if (!workbook) {
    warnings.push('No .xlsx file found in public/data — rendering an empty portfolio')
  } else {
    sheets = parseExcel(fs.readFileSync(workbook))
  }

  const portfolio = normalizePortfolioData(sheets, {
    resumeUrl: findResume(),
    projectImages: detectProjectImages(),
  })

  portfolio.meta.warnings.unshift(...warnings)
  portfolio.meta.source = workbook ? path.relative(ROOT, workbook).replace(/\\/g, '/') : null
  return portfolio
}
