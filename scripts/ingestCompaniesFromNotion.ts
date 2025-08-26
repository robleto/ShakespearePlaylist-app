#!/usr/bin/env tsx
import { PrismaClient, SourceKind } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parseCompaniesFromNotionHTML } from '../lib/ingestion/notionCompanies'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const quiet = process.env.QUIET === '1' || args.includes('--quiet')
  if (quiet) process.env.QUIET = '1'
  const notionUrl = args.find(a => !a.startsWith('-') && a !== '--quiet') || process.env.NOTION_COMPANIES_URL
  if (!notionUrl) {
    console.error('Usage: tsx scripts/ingestCompaniesFromNotion.ts <public-notion-url-or-path-to-html>')
    process.exit(1)
  }

  let html: string
  if (/^https?:/i.test(notionUrl)) {
  if (!quiet) console.log(`🔎 Fetching Notion page: ${notionUrl}`)
    const res = await fetch(notionUrl, { headers: { 'User-Agent': 'ShakesFindBot/1.0 (+https://shakesfind.com)' } })
    if (!res.ok) throw new Error(`Failed to fetch Notion page: ${res.status}`)
    html = await res.text()
  } else {
    const abs = path.resolve(notionUrl)
  if (!quiet) console.log(`📄 Reading local HTML file: ${abs}`)
    html = fs.readFileSync(abs, 'utf8')
  }

  const parsed = parseCompaniesFromNotionHTML(html)
  if (!quiet) console.log(`📊 Parsed ${parsed.length} companies from Notion content.`)

  let created = 0, updated = 0, sourcesCreated = 0, stubsCreated = 0
  for (const c of parsed) {
    // Upsert company by website host or name fallback
    const host = tryHost(c.website)
    const existing = await prisma.company.findFirst({ where: { website: { contains: host || c.website } } })
    let company
    if (existing) {
      company = await prisma.company.update({ where: { id: existing.id }, data: { name: c.name } })
      updated++
    } else {
      company = await prisma.company.create({ data: {
        name: c.name,
        website: c.website,
        city: c.city || 'Unknown',
        region: c.region || 'NA',
        country: c.country || 'US'
      }})
      created++
    }

    // Ensure Source exists
    const parserName = host || new URL(c.website).hostname
    const source = await prisma.source.findFirst({ where: { companyId: company.id, parserName } })
    if (!source) {
      await prisma.source.create({ data: {
        companyId: company.id,
        url: c.website,
        kind: SourceKind.HTML,
        parserName,
        enabled: true
      }})
      sourcesCreated++
    }

    // Create adapter stub if absent
    const adapterPath = path.join(process.cwd(), 'lib', 'scraping', 'adapters', `${parserName}.ts`)
    if (!fs.existsSync(adapterPath)) {
      fs.writeFileSync(adapterPath, adapterStubTemplate(parserName), 'utf8')
      stubsCreated++
    if (!quiet) console.log(`🆕 Created adapter stub: ${adapterPath}`)
    }
  }
  if (!quiet) console.log(`✅ Ingestion complete. Companies created: ${created}, updated: ${updated}, sources: ${sourcesCreated}, stubs: ${stubsCreated}`)
  console.log(`✅ Ingestion complete. Companies created: ${created}, updated: ${updated}, sources: ${sourcesCreated}, stubs: ${stubsCreated}`)
}

function adapterStubTemplate(host: string): string {
  return `// Auto-generated adapter stub for ${host}\nimport type { NormalizedEvent } from '../../normalization/normalize'\n\nexport async function scrape${toPascal(host)}(): Promise<NormalizedEvent[]> {\n  // TODO: implement scraping for ${host}\n  return []\n}\n`
}

function toPascal(host: string): string { return host.replace(/[^a-zA-Z0-9]+/g,' ').split(' ').filter(Boolean).map(p=>p[0].toUpperCase()+p.slice(1)).join('') }
function tryHost(url: string): string | undefined { try {return new URL(url).hostname.replace(/^www\./,'')} catch {return} }

main().finally(()=>prisma.$disconnect())
