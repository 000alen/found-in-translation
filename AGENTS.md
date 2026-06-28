# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js (App Router) portfolio + blog starter using Tailwind v4 (alpha), MDX (`next-mdx-remote`), and dynamic OG image generation. There is no database or external service.

- Package manager is pnpm (`pnpm-lock.yaml`). Dependencies are refreshed automatically via the startup update script (`pnpm install`).
- Dev server: `pnpm dev` (Next.js dev mode on `http://localhost:3000`). This is the command to use during development. `pnpm build` / `pnpm start` are for production.
- Type check: `pnpm exec tsc --noEmit` (uses `tsconfig.json` with `noEmit`). There is no separate lint script and no automated test suite in this repo.
- `pnpm install` reports "Ignored build scripts" for `@vercel/speed-insights` and `core-js`. This is expected and does not affect dev; do not run the interactive `pnpm approve-builds`.
- Blog posts live in `app/blog/posts/*.mdx`; the slug is the filename without `.mdx` (e.g. `vim.mdx` → `/blog/vim`). Working routes include `/`, `/blog`, `/rss`, `/sitemap.xml`, `/robots.txt`, and the dynamic OG route `/og?title=...`.
- Known pre-existing issue (NOT an environment problem): the individual blog post page returns HTTP 500 during SSR with `ReferenceError: self is not defined`. This comes from `app/components/translation.tsx`, which statically imports the browser-only `@recogito/recogito-js` at module scope; Next.js still evaluates `"use client"` modules on the server during SSR. The current sample post (`vim.mdx`) uses `<Translation>`, so `/blog/vim` is affected. Fixing it requires a code change (e.g. a dynamic `ssr: false` import), which is out of scope for environment setup.
