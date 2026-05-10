# Shakespeare Playbook

A digital passport for tracking live Shakespeare productions. Thirty-nine plays, one page each. See the show, stamp the page. The completed book is the artifact.

## Status

**v1, in progress.** Single-user, single-device, localStorage-backed. No accounts, no sync, no analytics.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS for layout utilities; design tokens + component classes in `src/app/globals.css`
- `next/font/google` for EB Garamond, IBM Plex Sans, IBM Plex Mono
- Prisma schema is in the repo (`prisma/schema.prisma`) and shapes the v2 data model — currently dormant; v1 stores stamps in `localStorage`
- Anthropic SDK for the AI chat input (Step 3)

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm test         # vitest
```

`.env.example` lists the env vars used. The Anthropic key (`ANTHROPIC_API_KEY`) is read server-side only.

## Repo layout

```
src/
  app/                Next.js routes
    page.tsx          Cover
    play/[id]/        Master play page (one page per play)
  components/
    passport/         Passport-specific primitives (Page, Stamp, Plate, Spec…)
  hooks/              Client hooks (usePlaybook lands in Step 2)
  lib/
    plays.ts          Canonical 39-play data — source of truth
  types/              Play, Stamp, Production
prisma/
  schema.prisma       v2 schema, dormant in v1
public/
  plates/             SVG/PNG illustration plates per play (30 of 39)
scripts/              Discovery pipeline lands in Step 4
```

## Build sequence

The product is being built in four steps. Each must work end-to-end before the next.

1. **Static passport** — three routes, real data, no interactivity. ✅
2. **Manual stamping** — `usePlaybook` hook + stamp form on each play page.
3. **AI chat input** — paste a description of a show, extract structured stamp data via Anthropic, confirm, stamp.
4. **Discovery layer** — surface "currently playing" productions on unstamped pages. Editorial review pipeline writes `public/productions.json`; the frontend reads it as static.

## Design

Visual system from the design handoff (Shake.zip). Tokens, typography, and stamp behavior are defined in `src/app/globals.css` — ported from the handoff's `styles.css`. Plate artwork lives in `public/plates/`. The handoff bundle itself is gitignored (`.design-handoff/`); keep your local copy in sync with `Downloads/Shake.zip`.

Voice is institutional and registry-dry. "AWAITING INSPECTION", "ATTESTED · 02 VIEWINGS", "NO PRODUCTIONS ON RECORD" — never "you haven't seen this yet" or anything with an emoji.
