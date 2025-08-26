#!/usr/bin/env tsx
/**
 * Ingest companies from a CSV export (e.g. Notion database export).
 * Expected headers (case-insensitive, flexible order):
 *   name, website (or url), city, region (or state), country
 * Extra columns ignored.
 *
 * Usage:
 *   tsx scripts/ingestCompaniesFromCSV.ts path/to/companies.csv [--dry] [--quiet]
 */
import fs from 'fs'
import path from 'path'
import { PrismaClient, SourceKind } from '@prisma/client'

const prisma = new PrismaClient()

interface Row { name: string; website: string; city?: string; region?: string; country?: string }

function parseCSV(csv: string): Row[] {
  const lines = csv.split(/\r?\n/).filter(l=>l.trim().length>0)
  if (lines.length === 0) return []
  const headerParts = splitCSVLine(lines[0]).map(h=> h.trim().toLowerCase())
  const idx = (names: string[]) => headerParts.findIndex(h=> names.includes(h))
  const nameIdx = idx(['name','company','title'])
  const siteIdx = idx(['website','url','site'])
  if (nameIdx === -1 || siteIdx === -1) throw new Error('CSV must include name and website/url columns')
  const cityIdx = idx(['city','town'])
  const regionIdx = idx(['region','state','prov','province'])
  const countryIdx = idx(['country','nation'])
  const rows: Row[] = []
  for (let i=1;i<lines.length;i++) {
    const parts = splitCSVLine(lines[i])
    if (!parts[nameIdx] || !parts[siteIdx]) continue
    const name = parts[nameIdx].trim()
    let website = normalizeWebsite(parts[siteIdx].trim())
    if (!/^https?:/i.test(website)) website = 'https://' + website.replace(/^\/*/,'')
    rows.push({
      name,
      website,
      city: cityIdx !== -1 ? parts[cityIdx]?.trim() || undefined : undefined,
      region: regionIdx !== -1 ? parts[regionIdx]?.trim() || undefined : undefined,
      country: countryIdx !== -1 ? parts[countryIdx]?.trim() || undefined : 'US'
    })
  }
  return rows
}

function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i=0;i<line.length;i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue }
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && ch === ',') { out.push(cur); cur=''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

function normalizeWebsite(url: string) {
  return url.replace(/\s+/g,'').replace(/\/$/,'')
}

function host(url: string): string | undefined { try { return new URL(url).hostname.replace(/^www\./,'') } catch { return undefined } }

async function upsertRows(rows: Row[], { dry, quiet }: { dry: boolean; quiet: boolean }) {
  let created = 0, updated = 0, sourcesCreated = 0, stubs = 0
  for (const r of rows) {
    const h = host(r.website)
    if (!h) continue
    const existing = await prisma.company.findFirst({ where: { website: { contains: h } } })
    let company
    if (existing) {
      if (!dry) company = await prisma.company.update({ where: { id: existing.id }, data: { name: r.name, city: r.city || existing.city, region: r.region || existing.region, country: r.country || existing.country } })
      updated++
    } else {
      if (!dry) company = await prisma.company.create({ data: { name: r.name, website: r.website, city: r.city || 'Unknown', region: r.region || 'NA', country: r.country || 'US' } })
      created++
    }
    const companyId = (company?.id) || existing?.id
    if (!companyId) continue
    const parserName = h
    const source = await prisma.source.findFirst({ where: { companyId, parserName } })
    if (!source && !dry) {
      await prisma.source.create({ data: { companyId, url: r.website, kind: SourceKind.HTML, parserName, enabled: true } })
      sourcesCreated++
      // adapter stub
      const adapterPath = path.join(process.cwd(),'lib','scraping','adapters', `${parserName}.ts`)
      if (!fs.existsSync(adapterPath)) {
        fs.writeFileSync(adapterPath, adapterStubTemplate(parserName),'utf8')
        stubs++
        if (!quiet) console.log(`🆕 adapter stub ${parserName}.ts`)
      }
    }
  }
  return { created, updated, sourcesCreated, stubs }
}

function adapterStubTemplate(host: string): string {
  return `// Auto-generated adapter stub for ${host}\nimport type { NormalizedEvent } from '../../normalization/normalize'\n\nexport async function scrape${toPascal(host)}(): Promise<NormalizedEvent[]> {\n  // TODO: implement scraping for ${host}\n  return []\n}\n`
}
function toPascal(host: string): string { return host.replace(/[^a-zA-Z0-9]+/g,' ').split(' ').filter(Boolean).map(s=>s[0].toUpperCase()+s.slice(1)).join('') }

async function main() {
  const args = process.argv.slice(2)
  const quiet = args.includes('--quiet')
  const dry = args.includes('--dry')
  const file = args.find(a=> !a.startsWith('--'))
  if (!file) { console.error('Usage: tsx scripts/ingestCompaniesFromCSV.ts <file.csv> [--dry] [--quiet]'); process.exit(1) }
  const abs = path.resolve(file)
  if (!quiet) console.log(`📄 Reading CSV: ${abs}`)
  const csv = fs.readFileSync(abs,'utf8')
  const rows = parseCSV(csv)
  if (!quiet) console.log(`Parsed ${rows.length} rows`)
  if (rows.length === 0) return
  const result = await upsertRows(rows, { dry, quiet })
  console.log(`✅ Done. Created companies: ${result.created}, updated: ${result.updated}, sources: ${result.sourcesCreated}, stubs: ${result.stubs}${dry ? ' (dry run)' : ''}`)
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=> prisma.$disconnect())
