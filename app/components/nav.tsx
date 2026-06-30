import Link from 'next/link'
import { ThemeToggle } from './theme/ThemeToggle'

export function Navbar() {
  return (
    <header className="mb-5 border-b border-border/70 pb-4 tracking-tight">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-medium text-ink transition hover:text-accent">
          Found in Translation
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1" id="nav">
            <Link
              href="/books"
              className="rounded-full px-2.5 py-1 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              Library
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
