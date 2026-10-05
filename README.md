# Prateek Katiyar — Portfolio

A personal developer portfolio built with React, Vite and Tailwind CSS. **All content comes from one Excel workbook** — `public/data/Prateek_Katiyar_Resume_Data.xlsx`. Edit the spreadsheet, rebuild, and the site updates; no React component contains hard-coded resume data.

## 1. Overview

Single-page, dark-first portfolio with these sections, each rendered only when the workbook has data for it:

| Section | Source sheet |
| --- | --- |
| Hero, About, Contact | `Personal Info` (+ counts from the other sheets) |
| Experience timeline | `Experience` |
| Featured project + project grid | `Projects` |
| Skills (grouped by category) | `Skills`, `Soft Skills` |
| Education & certifications | `Education`, `Certifications` (and an optional `Achievements` sheet) |

## 2. Tech stack

- **React 19** + **Vite 8** (JavaScript, no TypeScript)
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — design tokens in `src/index.css`
- **Motion** (`motion/react`) — entrance, scroll-reveal, stagger, card/button hover, nav indicator, parallax, count-up
- **Lucide React** — UI icons; **simple-icons** — brand glyphs (tree-shaken, only used icons ship)
- **SheetJS (`xlsx`)** — reads the workbook **at build time only**; it is not shipped to visitors

## 3. Folder structure

```text
portfolio/
├── index.html                    # SEO/OG tags — %PORTFOLIO_*% filled from Excel at build
├── vite.config.js
├── public/
│   ├── data/
│   │   └── Prateek_Katiyar_Resume_Data.xlsx   ← the source of truth
│   ├── projects/                 # optional project images (<project-slug>.png/.jpg/.webp)
│   ├── favicon.svg
│   └── resume.pdf                # optional — add it and the Download Resume buttons appear
├── scripts/
│   ├── loadPortfolio.js          # Node: read workbook + detect resume/images → portfolio object
│   ├── vite-plugin-portfolio.js  # exposes `virtual:portfolio`, injects SEO, live-reloads on change
│   └── export-data.js            # `npm run data` / `npm run data:check`
└── src/
    ├── data/
    │   ├── schema.js             # sheet + column names and their accepted aliases
    │   ├── parseExcel.js         # workbook → raw rows (keeps hyperlinks)
    │   ├── normalizeData.js      # raw rows → clean portfolio model (pure, defensive)
    │   └── index.js              # the app's single data import
    ├── config/navigation.js      # section order + "show only if data exists" rules
    ├── components/               # Navbar, Footer, Section, Card, Button, Reveal (motion tokens), Badge, CountUp, …
    ├── sections/                 # Hero, About, Experience, Projects, Skills, Education, Contact
    ├── hooks/                    # useActiveSection, useScrolled
    ├── utils/                    # formatting, icon mapping, skill highlighting
    ├── App.jsx
    ├── main.jsx
    └── index.css                 # brand palette (:root) + Tailwind tokens, card/glow utilities
```

## 4. How the Excel data works

```text
public/data/*.xlsx
   │  parseExcel()               src/data/parseExcel.js
   ▼
raw rows per sheet
   │  normalizePortfolioData()   src/data/normalizeData.js
   ▼
portfolio object  ──►  `virtual:portfolio` module (Vite plugin)
   │
   ▼
<App data={portfolio}/>  →  <Projects projects={…}/>, <Experience experience={…}/>, …
```

- The workbook is parsed **in Node during `npm run dev` / `npm run build`**, so visitors download only the normalized data (a few KB), not the ~400 KB Excel parser.
- **Sheet and column names are matched loosely** (case, spaces and punctuation ignored) against aliases in `src/data/schema.js` — e.g. `Organization`, `Company` or `Employer` all work.
- **Defensive by design:** missing sheets, blank cells, invalid URLs and odd dates never crash the build. Missing data hides that UI element; problems are printed as `[portfolio]` warnings.
- **Dates** accept `May 2026`, `2026`, `05/2026`, `2026-05`, real Excel dates, and `Present` / `Current`.
- **Experience:** one row per bullet point. Rows with the same Role + Organization + Start + End become one timeline entry.
- **Experience tags** are skills from the `Skills` sheet that are mentioned in that job's bullets (or an explicit `Tech Stack` column, if you add one).
- **Featured project:** the project with `Featured = Yes`; if no row is marked, the first project in the sheet.
- **GitHub profile:** if `Personal Info` has no GitHub row, the profile link is derived from your project repository URLs (they all belong to `github.com/prateekkatiyar216`).

## 5. Updating your portfolio

1. Open `public/data/Prateek_Katiyar_Resume_Data.xlsx` and edit it. You can add rows, edit cells, or delete rows.
2. **While `npm run dev` is running, just save the file.** The page reloads with the new data automatically.
3. Otherwise run `npm run build` (or redeploy) — the data is regenerated on every build.

Useful checks:

```bash
npm run data:check   # summary of what was parsed + warnings (exit code 1 if any warning)
npm run data         # writes the normalized data to portfolio-data.json for inspection
```

**Optional columns** you can add to existing sheets (no code change needed):

| Sheet | Column | Effect |
| --- | --- | --- |
| Projects | `Featured` (Yes/No) | Choose the featured project |
| Projects | `Category` | Small label on the card |
| Projects | `Image` | Image path (relative to `public/`) or full URL |
| Experience | `Location` | Shown under the role |
| Experience | `Tech Stack` | `\|`-separated tags (replaces auto-tags) |
| Education | `Score` / `CGPA`, `Details` | Extra line on the education card |
| Personal Info | rows `GitHub`, `Codeforces`, `Kaggle`, `Website`, … | Extra profile links with icons |
| Personal Info | row `Tagline` | Replaces the hero intro (default: first sentence of the summary) |

A new sheet named `Achievements` (columns `Achievement`, `Description`, `Date`, `Link`) automatically adds an Achievements block.

To support a completely new column, add its header to `src/data/schema.js` and read it in `src/data/normalizeData.js`.

## 6. Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

## 7. Build

```bash
npm run build      # outputs static files to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

## 8. Deploy

The output is a static site, so any static host works. Build command `npm run build`, output directory `dist`.

- **Vercel / Netlify / Cloudflare Pages:** import the repository; the framework preset "Vite" fills in the settings above.
- **GitHub Pages:** if serving from `https://<user>.github.io/<repo>/`, set `base: '/<repo>/'` in `vite.config.js`, then publish `dist/` (e.g. with the `actions/deploy-pages` workflow).

Because data is generated at build time, **redeploy after editing the Excel file**.

## 9. Adding your resume PDF

Put your resume PDF in **`public/`** with "resume" in its file name (e.g. `resume.pdf` or `Resume_tech.pdf`; `resume.pdf` wins if several exist). Visitors download it as `<Your_Name>_Resume.pdf`. On the next build, or immediately in dev, "Download Resume" buttons appear in the hero, the navbar and the mobile menu. While the file is absent they stay hidden, and the hero shows "Get in Touch" instead.

## 10. Adding project images

Either:

- drop an image into **`public/projects/`** named after the project's slug, e.g. `rag-chatbot.webp`, `house-price-prediction.png`, `civic-report-system-mobile-app.jpg`. The slug is the project name lowercased with spaces → `-`. `.webp`, `.avif`, `.png`, `.jpg` and `.jpeg` all work. — **or**
- add an `Image` column to the `Projects` sheet with a path such as `projects/my-shot.png` or a full URL.

Projects without an image get a generated visual in the site's accent palette. 16:9 images around 1200×675 work best.

## Customising the design

**Colors** live in one place — the `:root` block at the top of `src/index.css`:

| Variable | Value | Used for |
| --- | --- | --- |
| `--primary` | `#D6AA8D` | Accent: highlights, active nav, tags, primary buttons |
| `--primary-hover` | `#C99578` | Primary button hover |
| `--background` / `--background-secondary` | `#0D0D0D` / `#151515` | Page / elevated surfaces |
| `--card` | `#1B1918` | All cards |
| `--foreground` / `--muted` | `#F5F1ED` / `#A9A09A` | Text |
| `--border-soft` / `--border` / `--border-hover` | primary at 12% / 18% / 40% | Card, divider, hover borders |
| `--primary-glow` | primary at 20% | Hover glow |

Tailwind utilities (`bg-card`, `text-accent`, `border-line-strong`, …) are mapped to these variables with `@theme inline`, so changing a variable re-themes the whole site. Components contain no raw hex values.

**Motion** timings live in `src/components/Reveal.jsx` (`EASE`, `DURATION`, `SPRING`, `hoverLift`, `stagger`). All cards use `src/components/Card.jsx`; all buttons use `src/components/Button.jsx`.

**Reduced motion:** the app is wrapped in `<MotionConfig reducedMotion="user">`, and CSS animations are disabled under `prefers-reduced-motion`, so those visitors get plain fades with no movement.

**Fonts:** Geist (UI), Geist Mono (labels/code), Instrument Serif italic (accent words in headings).
