import SocialLinks from './SocialLinks.jsx'

export default function Footer({ profile, links }) {
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-line-soft">
      <div aria-hidden="true" className="absolute inset-x-0 -top-px mx-auto h-px max-w-xl bg-linear-to-r from-transparent via-accent/50 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between sm:px-8">
        <p className="text-center text-sm text-subtle sm:text-left">
          © {year} <span className="text-fg/80">{profile.name}</span>
          <span className="mx-2 text-accent/50" aria-hidden="true">
            ·
          </span>
          Built with React &amp; Motion
        </p>
        <SocialLinks links={links} iconClassName="size-4" />
      </div>
    </footer>
  )
}
