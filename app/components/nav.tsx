import Link from 'next/link'
import { ThemeToggle } from './theme/ThemeToggle'

const navItems = [
  { path: '/', name: 'Home' },
  { path: '/books', name: 'Editions' },
]

export function Navbar() {
  return (
    <header className="mb-8 tracking-tight">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Found in Translation</p>
          <p className="text-base font-medium text-ink transition group-hover:text-accent">
            Reading studio
          </p>
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <nav className="flex flex-wrap items-center gap-1" id="nav">
            {navItems.map(({ path, name }) => (
              <Link
                key={path}
                href={path}
                className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                {name}
              </Link>
            ))}
          </nav>
          <span className="mx-1 hidden h-4 w-px bg-border md:inline" aria-hidden />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
