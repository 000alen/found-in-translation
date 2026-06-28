# Found in Translation

A polished reading studio for bilingual poetry editions — side-by-side translations with linked lines, alignment tools, and Google Docs-style comments.

## Features

- **Parallel reader** — original and translation in balanced columns with synced scrolling
- **Visual alignment links** — SVG curves connect corresponding lines on hover
- **Alignment studio** — create, save, and delete line-to-line links
- **Threaded comments** — select text in comment mode and discuss in a margin panel
- **Read mode** — distraction-free reading with keyboard shortcuts
- **Optional database** — Neon Postgres via Drizzle when `DATABASE_URL` is set; seed data works out of the box

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to **Editions** → **Shakespeare's Sonnets** → **Sonnet XVIII**.

## Environment variables

```bash
# Optional — enables Postgres persistence for alignments
DATABASE_URL=postgresql://...

# Optional — enables Liveblocks real-time comments
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
LIVEBLOCKS_SECRET_KEY=sk_...

# Optional — used for sitemap/metadata
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Without `DATABASE_URL`, the app serves seeded content from `lib/data/seed.ts`. Comments are stored in the browser via `localStorage` unless Liveblocks is configured.

## Database setup

```bash
pnpm db:push
pnpm db:seed
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `R` | Toggle read mode |
| `A` | Align mode |
| `C` | Comment mode |
| `L` | Toggle link visibility |
| `?` | Show shortcuts |
| `Esc` | Cancel current action |

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Drizzle ORM + Neon Postgres (optional)
- Framer Motion
- Liveblocks (optional)
