/** Join truthy class names. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** "May 2025 — Jul 2025", "2022 — 2026", "2021" */
export function formatRange(start, end) {
  if (start && end) return `${start.label} — ${end.label}`
  return start?.label ?? end?.label ?? null
}

/**
 * Human duration between two parsed dates (inclusive of both months),
 * e.g. "3 mos", "1 yr 2 mos". Returns null when either month is unknown.
 */
export function formatDuration(start, end, now = new Date()) {
  if (!start?.month || !start.year) return null
  const endYear = end?.isPresent ? now.getFullYear() : end?.year
  const endMonth = end?.isPresent ? now.getMonth() + 1 : end?.month
  if (!endYear || !endMonth) return null

  const months = (endYear - start.year) * 12 + (endMonth - start.month) + 1
  if (months < 1) return null
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}

/** Strip protocol / trailing slash for display: "github.com/user". */
export function prettyUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

/** Deterministic 0..1 value from a string (used for generated visuals). */
export function hashUnit(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}
