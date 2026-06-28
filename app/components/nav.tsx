import Link from 'next/link'

const navItems = [
  { path: '/', name: 'Home' },
  { path: '/books', name: 'Editions' },
  { path: '/blog', name: 'Blog' },
]

export function Navbar() {
  return (
    <header className="mb-10 tracking-tight">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="group">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Found in Translation</p>
          <p className="text-lg font-medium text-ink transition group-hover:text-accent dark:text-paper">
            Poetry reading studio
          </p>
        </Link>
        <nav className="flex flex-wrap items-center gap-1" id="nav">
          {navItems.map(({ path, name }) => (
            <Link
              key={path}
              href={path}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-paper-elevated hover:text-ink dark:hover:bg-ink-elevated dark:hover:text-paper"
            >
              {name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
