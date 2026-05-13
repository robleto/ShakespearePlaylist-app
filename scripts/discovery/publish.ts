#!/usr/bin/env tsx
/**
 * Reads the curated source at data/productions.source.json, validates,
 * sorts, and writes public/productions.json. The published file is the
 * static asset the frontend reads at request time.
 *
 *   pnpm discovery:publish        # write the file
 *   pnpm discovery:publish --check # validate only, exit 1 on error
 *
 * Boundary: the rest of the discovery pipeline (4c — scrapers + review
 * queue) writes into data/productions.source.json. The frontend never
 * reads from data/ — only from public/. Changes to one side don't
 * cascade to the other.
 */

import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { PLAYS } from '@/lib/plays'

const SOURCE = path.join(process.cwd(), 'data', 'productions.source.json')
const TARGET = path.join(process.cwd(), 'public', 'productions.json')

const VALID_PLAY_IDS = new Set(PLAYS.map((p) => p.id))
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const ProductionSchema = z
  .object({
    playId: z.string().refine((id) => VALID_PLAY_IDS.has(id), { message: 'unknown playId' }),
    productionCompany: z.string().min(1),
    venue: z.string().min(1),
    city: z.string().min(1),
    startDate: z.string().regex(ISO_DATE, 'must be YYYY-MM-DD'),
    endDate: z.string().regex(ISO_DATE, 'must be YYYY-MM-DD'),
    url: z.string().url(),
    lastVerified: z.string().regex(ISO_DATE, 'must be YYYY-MM-DD'),
    note: z.string().optional(),
  })
  .refine((p) => p.endDate >= p.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  })

const SourceSchema = z.object({
  _meta: z.unknown().optional(),
  productions: z.array(ProductionSchema),
})

function main(): void {
  const check = process.argv.includes('--check')

  let raw: string
  try {
    raw = fs.readFileSync(SOURCE, 'utf-8')
  } catch (e) {
    console.error(`✗ Could not read ${SOURCE}`)
    console.error(`  ${(e as Error).message}`)
    process.exit(1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    console.error(`✗ ${SOURCE} is not valid JSON`)
    console.error(`  ${(e as Error).message}`)
    process.exit(1)
  }

  const result = SourceSchema.safeParse(parsed)
  if (!result.success) {
    console.error(`✗ ${SOURCE} failed validation`)
    for (const issue of result.error.issues) {
      const where = issue.path.length ? issue.path.join('.') : '(root)'
      console.error(`  • ${where}: ${issue.message}`)
    }
    process.exit(1)
  }

  // Sort: by playId, then startDate. Stable, deterministic output.
  const productions = [...result.data.productions].sort((a, b) => {
    if (a.playId !== b.playId) return a.playId.localeCompare(b.playId)
    return a.startDate.localeCompare(b.startDate)
  })

  const lastPublished = new Date().toISOString()
  const output = JSON.stringify({ productions, lastPublished }, null, 2) + '\n'

  // Per-play tally for the summary
  const byPlay = new Map<string, number>()
  for (const p of productions) {
    byPlay.set(p.playId, (byPlay.get(p.playId) ?? 0) + 1)
  }

  console.log(`✓ Validated ${productions.length} production(s) across ${byPlay.size} play(s)`)
  const tally = Array.from(byPlay.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const [playId, count] of tally) {
    console.log(`  · ${playId}: ${count}`)
  }

  if (check) {
    console.log('\n(check only — public/productions.json not written)')
    return
  }

  fs.writeFileSync(TARGET, output, 'utf-8')
  console.log(`\n→ wrote ${path.relative(process.cwd(), TARGET)} (lastPublished: ${lastPublished})`)
}

main()
