import path from 'node:path'
import { loadPortfolio, isResumeFile, DATA_DIR, PUBLIC_DIR, PROJECT_IMAGES_DIR } from './loadPortfolio.js'

const VIRTUAL_ID = 'virtual:portfolio'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Vite plugin that turns the Excel workbook into an importable module:
 *
 *   import portfolio from 'virtual:portfolio'
 *
 * - Parsing happens at build/dev time in Node, so the ~400 KB `xlsx`
 *   library never ships to visitors — only the normalized JSON does.
 * - In dev, saving the workbook (or adding a resume PDF or a project
 *   image) re-parses and reloads the page.
 * - SEO tags in index.html (`%PORTFOLIO_*%` placeholders) are filled from
 *   the same data.
 */
export default function portfolioPlugin() {
  let cached = null
  let lastGood = null

  const load = (logger) => {
    try {
      cached = loadPortfolio()
      lastGood = cached
      for (const w of cached.meta.warnings) logger?.warn(`[portfolio] ${w}`)
    } catch (err) {
      // Excel writes files in several steps; a half-saved workbook can fail
      // to parse. Keep serving the last good data instead of crashing dev.
      if (!lastGood) throw err
      logger?.warn(`[portfolio] Could not read workbook (${err.message}); keeping previous data`)
      cached = lastGood
    }
    return cached
  }

  return {
    name: 'portfolio-excel-data',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id !== RESOLVED_ID) return
      const data = cached ?? load(this.environment?.logger)
      return `export default ${JSON.stringify(data)}`
    },

    buildStart() {
      cached = null
    },

    // 'pre' so the placeholders are replaced before Vite's own %ENV% pass.
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const { profile } = cached ?? load()
        const title = [profile.name, profile.title].filter(Boolean).join(' — ') || 'Portfolio'
        const description = profile.summary ?? profile.title ?? ''
        return html
          .replaceAll('%PORTFOLIO_TITLE%', escapeHtml(title))
          .replaceAll('%PORTFOLIO_DESCRIPTION%', escapeHtml(description))
          .replaceAll('%PORTFOLIO_NAME%', escapeHtml(profile.name ?? ''))
      },
    },

    configureServer(server) {
      const watched = [DATA_DIR, PUBLIC_DIR, PROJECT_IMAGES_DIR]
      server.watcher.add(watched)

      const isRelevant = (file) => {
        const f = path.resolve(file)
        if (path.basename(f).startsWith('~$')) return false // Excel lock files
        return (
          (f.startsWith(DATA_DIR) && /\.xlsx$/i.test(f)) ||
          isResumeFile(f) ||
          f.startsWith(PROJECT_IMAGES_DIR)
        )
      }

      const refresh = (file) => {
        if (!isRelevant(file)) return
        load(server.config.logger)
        server.config.logger.info(`[portfolio] ${path.basename(file)} changed — reloading data`, { timestamp: true })
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('change', refresh)
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
