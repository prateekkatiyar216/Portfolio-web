/**
 * Wraps the first mention of each term (e.g. skills from the Excel sheet)
 * in an accent <span>. Matching is whole-word and case-insensitive; longer
 * terms win ("React Native" before "React"). Terms under 3 chars are ignored
 * to avoid noise like "C".
 */
export function highlightTerms(text, terms, className = 'text-accent') {
  if (!text) return text
  const usable = [...new Set(terms)].filter((t) => t && t.length >= 3).sort((a, b) => b.length - a.length)
  if (!usable.length) return text

  const escaped = usable.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(?<![\\w+#])(${escaped.join('|')})(?![\\w+#])`, 'gi')
  const seen = new Set()
  const out = []
  let last = 0

  for (const match of text.matchAll(pattern)) {
    const key = match[0].toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (match.index > last) out.push(text.slice(last, match.index))
    out.push(
      <span key={match.index} className={className}>
        {match[0]}
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
