#!/usr/bin/env tsx
/**
 * Generates a markdown checklist of missing adapters based on current sources.
 */
import { prisma } from '../lib/db'
import fs from 'fs'
import path from 'path'

function safeDomain(url?: string|null) { if (!url) return undefined; try { return new URL(url).hostname.replace(/^www\./,'') } catch { return undefined } }

async function main() {
  const sources = await prisma.source.findMany({ include: { company: true }, orderBy: { parserName: 'asc' } })
  const missing = new Map<string, Set<string>>() // parser -> companies
  for (const s of sources) {
    const parser = s.parserName || safeDomain(s.url)
    if (!parser) continue
    const adapterPath = path.join(process.cwd(), 'lib','scraping','adapters', `${parser}.ts`)
    if (!fs.existsSync(adapterPath)) {
      if (!missing.has(parser)) missing.set(parser, new Set())
      missing.get(parser)!.add(s.company.name)
    }
  }
  const items = Array.from(missing.entries()).sort((a,b)=> a[0].localeCompare(b[0]))
  const lines = ['# Missing Scraper Adapters','',`Total: ${items.length}`,'']
  for (const [parser, companies] of items) {
    lines.push(`- [ ] ${parser}  — ${Array.from(companies).join(', ')}`)
  }
  const outPath = path.join(process.cwd(),'MISSING_ADAPTERS.md')
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log(`Wrote ${outPath}`)
}
main().catch(e=>{ console.error(e); process.exit(1) })
