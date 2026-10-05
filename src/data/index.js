/**
 * The app's single data entry point.
 *
 * `virtual:portfolio` is produced at build/dev time by
 * scripts/vite-plugin-portfolio.js from public/data/*.xlsx
 * (parseExcel -> normalizePortfolioData). See README "How the Excel data works".
 */
import portfolio from 'virtual:portfolio'

export default portfolio
