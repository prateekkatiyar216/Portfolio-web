import { SHEETS, COLUMNS, PERSONAL_FIELDS, LINK_PLATFORMS } from './schema.js'

/**
 * Step 2 of the data pipeline: raw sheet rows -> clean portfolio model.
 *
 * Pure function — no file system, no DOM. Every field is optional; missing
 * sheets, empty cells, bad URLs and malformed dates degrade to `null` / `[]`
 * and are reported in `meta.warnings` instead of throwing.
 *
 * @param {Record<string, object[]>} sheets  output of parseExcel()
 * @param {object} [assets]
 * @param {string|null} [assets.resumeUrl]            e.g. "/resume.pdf" if present
 * @param {Record<string,string>} [assets.projectImages]  slug -> public path
 */
export function normalizePortfolioData(sheets = {}, assets = {}) {
  const warnings = []
  const sheet = (key) => {
    const rows = findSheet(sheets, SHEETS[key])
    if (rows === null) warnings.push(`Sheet not found: "${SHEETS[key][0]}" (section hidden)`)
    return rows ?? []
  }

  const personalRows = sheet('personal')
  const skillRows = sheet('skills')
  const projectRows = sheet('projects')

  const { profile, links } = normalizePersonal(personalRows)
  const skills = normalizeSkills(skillRows, findSheet(sheets, SHEETS.softSkills) ?? [])
  const experience = normalizeExperience(sheet('experience'), skills.all)
  const projects = normalizeProjects(projectRows, assets.projectImages ?? {})
  const education = normalizeEducation(sheet('education'))
  const certifications = normalizeCertifications(findSheet(sheets, SHEETS.certifications) ?? [])
  const achievements = normalizeAchievements(findSheet(sheets, SHEETS.achievements) ?? [])

  // No GitHub profile row? Derive it from project repo URLs when they all
  // share one owner — it's the same account, not an invented link.
  if (!links.some((l) => l.id === 'github')) {
    const owners = new Set(
      projects
        .map((p) => p.github && p.github.match(/^https:\/\/github\.com\/([^/]+)/i)?.[1])
        .filter(Boolean)
        .map((o) => o.toLowerCase()),
    )
    if (owners.size === 1) {
      const owner = projects.find((p) => p.github).github.match(/^https:\/\/github\.com\/([^/]+)/i)[1]
      links.unshift({ id: 'github', label: 'GitHub', url: `https://github.com/${owner}`, kind: 'code', handle: owner })
    }
  }

  if (!profile.name) warnings.push('Personal Info: "Full Name" is missing')

  return {
    profile,
    links,
    experience,
    projects,
    featuredProject: projects.find((p) => p.featured) ?? null,
    skills,
    education,
    certifications,
    achievements,
    resumeUrl: assets.resumeUrl ?? null,
    // Name the visitor's downloaded file after the person, not the source file.
    resumeFileName: assets.resumeUrl ? `${(profile.name ?? 'Resume').replace(/[^\w-]+/g, '_')}_Resume.pdf` : null,
    meta: { warnings },
  }
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function normalizePersonal(rows) {
  const cols = COLUMNS.personal
  const entries = rows
    .map((row) => ({ key: text(pick(row, cols.field)), value: pick(row, cols.value) }))
    .filter((e) => e.key && e.value !== null)

  const get = (aliases) => {
    const hit = entries.find((e) => aliases.some((a) => norm(a) === norm(e.key)))
    return hit ? text(hit.value) : null
  }

  const name = get(PERSONAL_FIELDS.name)
  const nameParts = name ? name.split(/\s+/) : []
  const email = cleanEmail(get(PERSONAL_FIELDS.email))
  const phone = get(PERSONAL_FIELDS.phone)

  const profile = {
    name,
    firstName: nameParts[0] ?? null,
    lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
    initials: nameParts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || null,
    title: get(PERSONAL_FIELDS.title),
    location: get(PERSONAL_FIELDS.location),
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null,
    email,
    summary: get(PERSONAL_FIELDS.summary),
    tagline: get(PERSONAL_FIELDS.tagline),
  }

  const consumed = new Set(Object.values(PERSONAL_FIELDS).flat().map(norm))
  const links = []
  for (const { key, value } of entries) {
    if (consumed.has(norm(key))) continue
    const url = safeUrl(value)
    if (!url) continue
    const platform = LINK_PLATFORMS.find((p) => p.aliases.some((a) => norm(a) === norm(key)))
    links.push({
      id: platform?.id ?? 'website',
      label: platform?.label ?? text(key),
      url,
      kind: platform?.kind ?? 'social',
      handle: handleFromUrl(url),
    })
  }

  return { profile, links }
}

function normalizeSkills(rows, softRows) {
  const cols = COLUMNS.skills
  const groups = []
  const byName = new Map()

  for (const row of rows) {
    const skill = text(pick(row, cols.skill))
    if (!skill) continue
    const category = text(pick(row, cols.category)) ?? 'Other'
    let group = byName.get(category)
    if (!group) {
      group = { name: category, skills: [] }
      byName.set(category, group)
      groups.push(group)
    }
    if (!group.skills.includes(skill)) group.skills.push(skill)
  }

  const all = [...new Set(groups.flatMap((g) => g.skills))]
  const soft = [...new Set(softRows.map((r) => text(pick(r, COLUMNS.softSkills.skill))).filter(Boolean))]

  return { groups, all, soft }
}

function normalizeExperience(rows, knownSkills) {
  const cols = COLUMNS.experience
  const positions = []
  const byKey = new Map()

  // The sheet stores one bullet per row; consecutive rows that share
  // role + organization + dates are merged into one position.
  for (const row of rows) {
    const role = text(pick(row, cols.role))
    const organization = text(pick(row, cols.organization))
    if (!role && !organization) continue

    const start = parseDate(pick(row, cols.start))
    const end = parseDate(pick(row, cols.end))
    const key = [role, organization, start?.label, end?.label].map(norm).join('|')

    let position = byKey.get(key)
    if (!position) {
      position = {
        id: slugify(`${organization ?? ''}-${role ?? ''}-${start?.label ?? positions.length}`),
        role,
        organization,
        location: null,
        start,
        end,
        current: Boolean(end?.isPresent),
        mentor: null,
        highlights: [],
        tags: [],
      }
      byKey.set(key, position)
      positions.push(position)
    }

    position.location ??= text(pick(row, cols.location))
    position.mentor ??= text(pick(row, cols.mentor))
    const highlight = text(pick(row, cols.highlight))
    if (highlight && !position.highlights.includes(highlight)) position.highlights.push(highlight)
    for (const t of splitList(pick(row, cols.tech))) if (!position.tags.includes(t)) position.tags.push(t)
  }

  // If no explicit tech column, tag each position with skills (from the
  // Skills sheet) that are mentioned by name in its bullet points.
  // Longest names are matched (and blanked out) first, so "React Native"
  // doesn't also count as a mention of "React".
  const bySpecificity = [...knownSkills].sort((a, b) => b.length - a.length)
  for (const p of positions) {
    if (p.tags.length) continue
    let body = p.highlights.join(' ')
    const found = new Set()
    for (const skill of bySpecificity) {
      const pattern = mentionPattern(skill)
      if (pattern.test(body)) {
        found.add(skill)
        body = body.replace(new RegExp(pattern.source, 'gi'), '$1 ')
      }
    }
    p.tags = knownSkills.filter((s) => found.has(s))
  }

  return positions.sort((a, b) => (sortKey(b.end) || sortKey(b.start)) - (sortKey(a.end) || sortKey(a.start)) || sortKey(b.start) - sortKey(a.start))
}

function normalizeProjects(rows, projectImages) {
  const cols = COLUMNS.projects
  const projects = rows
    .map((row, index) => {
      const name = text(pick(row, cols.name))
      if (!name) return null
      const slug = slugify(name)
      const demo = safeUrl(pick(row, cols.demo))
      const imageCell = text(pick(row, cols.image))
      return {
        id: slug || `project-${index + 1}`,
        slug,
        name,
        description: text(pick(row, cols.description)),
        stack: splitList(pick(row, cols.stack)),
        github: safeUrl(pick(row, cols.github)),
        demo,
        demoLabel: demo ? demoLabel(demo) : null,
        image: imageCell ? (safeUrl(imageCell) ?? `/${imageCell.replace(/^\/+/, '')}`) : (projectImages[slug] ?? null),
        category: text(pick(row, cols.category)),
        featured: truthy(pick(row, cols.featured)),
      }
    })
    .filter(Boolean)

  // No "Featured" column marked? Treat the first project as the headline
  // one — the order in the sheet is the author's own priority order.
  if (projects.length && !projects.some((p) => p.featured)) projects[0].featured = true
  return projects
}

function normalizeEducation(rows) {
  const cols = COLUMNS.education
  return rows
    .map((row, index) => {
      const institution = text(pick(row, cols.institution))
      const qualification = text(pick(row, cols.qualification))
      if (!institution && !qualification) return null
      return {
        id: slugify(`${institution ?? ''}-${index}`),
        institution,
        city: text(pick(row, cols.city)),
        qualification,
        field: text(pick(row, cols.field)),
        start: parseDate(pick(row, cols.start)),
        end: parseDate(pick(row, cols.end)),
        score: text(pick(row, cols.score)),
        details: text(pick(row, cols.details)),
      }
    })
    .filter(Boolean)
    .sort((a, b) => sortKey(b.end) - sortKey(a.end))
}

function normalizeCertifications(rows) {
  const cols = COLUMNS.certifications
  return rows
    .map((row, index) => {
      const name = text(pick(row, cols.name))
      if (!name) return null
      return {
        id: slugify(`${name}-${index}`),
        name,
        issuer: text(pick(row, cols.issuer)),
        date: parseDate(pick(row, cols.date)),
        url: safeUrl(pick(row, cols.url)),
      }
    })
    .filter(Boolean)
    .sort((a, b) => sortKey(b.date) - sortKey(a.date))
}

function normalizeAchievements(rows) {
  const cols = COLUMNS.achievements
  return rows
    .map((row, index) => {
      const title = text(pick(row, cols.title))
      if (!title) return null
      return {
        id: slugify(`${title}-${index}`),
        title,
        description: text(pick(row, cols.description)),
        date: parseDate(pick(row, cols.date)),
        url: safeUrl(pick(row, cols.url)),
      }
    })
    .filter(Boolean)
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Lowercase, strip everything but letters/digits: "Stream / Subjects" -> "streamsubjects". */
export function norm(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findSheet(sheets, aliases) {
  const wanted = aliases.map(norm)
  const name = Object.keys(sheets).find((n) => wanted.includes(norm(n)))
  return name === undefined ? null : sheets[name]
}

/** First non-empty value among the aliased headers of a row. */
function pick(row, aliases) {
  if (!aliases) return null
  for (const alias of aliases) {
    const key = Object.keys(row).find((k) => norm(k) === norm(alias))
    if (key !== undefined && row[key] !== null && row[key] !== '') return row[key]
  }
  return null
}

function text(value) {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const s = String(value).replace(/\s+/g, ' ').trim()
  return s || null
}

function splitList(value, separator = /\s*[|,;•]\s*/) {
  const s = text(value)
  return s ? [...new Set(s.split(separator).map((x) => x.trim()).filter(Boolean))] : []
}

function truthy(value) {
  return ['yes', 'y', 'true', '1', 'x', 'featured', '✓', '✔'].includes(String(value ?? '').trim().toLowerCase())
}

function safeUrl(value) {
  const s = text(value)
  if (!s) return null
  if (/^https?:\/\/[^\s]+\.[^\s]+/i.test(s)) return s
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(s)) return `https://${s}`
  return null
}

function cleanEmail(value) {
  const s = text(value)?.replace(/^mailto:/i, '')
  return s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null
}

function handleFromUrl(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    return last && !['in', 'u', 'p', 'profile'].includes(last) ? decodeURIComponent(last) : null
  } catch {
    return null
  }
}

function demoLabel(url) {
  if (/\.apk(\?|$)/i.test(url)) return 'Download APK'
  if (/play\.google\.com/i.test(url)) return 'Google Play'
  if (/apps\.apple\.com/i.test(url)) return 'App Store'
  return 'Live Demo'
}

export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Whole-word, case-insensitive matcher that also works for "C++", "C", "CI/CD". */
function mentionPattern(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^\\w+#/])${escaped}(?=$|[^\\w+#/])`, 'i')
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Accepts Date objects, years (2022 / "2022"), "May 2026", "May-26",
 * "05/2026", "2026-05", "Present". Unparseable values keep their raw text
 * as the label with sortKey 0, so they still render.
 *
 * @returns {{label: string, year: number|null, month: number|null, isPresent: boolean, sortKey: number} | null}
 */
export function parseDate(value) {
  if (value === null || value === undefined || value === '') return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return makeDate(value.getUTCFullYear(), value.getUTCMonth() + 1)
  }

  const raw = text(value)
  if (!raw) return null

  if (/^(present|current|now|ongoing|till date|today)$/i.test(raw)) {
    return { label: 'Present', year: null, month: null, isPresent: true, sortKey: 999999 }
  }

  let m
  if ((m = raw.match(/^(\d{4})(?:\.0+)?$/))) return makeDate(+m[1], null)
  if ((m = raw.match(/^([a-z]{3,})\.?[\s,-]*'?(\d{2}|\d{4})$/i))) {
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1
    const year = m[2].length === 2 ? 2000 + +m[2] : +m[2]
    if (month) return makeDate(year, month)
  }
  if ((m = raw.match(/^(\d{1,2})[/.-](\d{4})$/))) return makeDate(+m[2], +m[1])
  if ((m = raw.match(/^(\d{4})[/.-](\d{1,2})(?:[/.-]\d{1,2})?$/))) return makeDate(+m[1], +m[2])

  return { label: raw, year: null, month: null, isPresent: false, sortKey: 0 }
}

function makeDate(year, month) {
  const validMonth = month >= 1 && month <= 12 ? month : null
  return {
    label: validMonth ? `${MONTH_LABELS[validMonth - 1]} ${year}` : String(year),
    year,
    month: validMonth,
    isPresent: false,
    sortKey: year * 100 + (validMonth ?? 0),
  }
}

function sortKey(date) {
  return date?.sortKey ?? 0
}
