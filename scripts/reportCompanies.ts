#!/usr/bin/env tsx
/**
 * Report current companies and scraping source coverage.
 * Outputs a markdown table plus a CSV to stdout.
 */
import { prisma } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      sources: true,
      productions: { select: { id: true } }
    },
    orderBy: { name: 'asc' }
  })

  const rows: string[] = []
  const header = ['Company','Region','Website','Domain','Sources','Kinds','Enabled','Last Status','Productions','Adapters Missing']
  rows.push(header.join(','))

  const mdLines: string[] = []
  mdLines.push('| Company | Region | Website | Sources | Kinds | Enabled | Last Status | Productions | Missing Adapters |')
  mdLines.push('|---------|--------|---------|---------|-------|---------|-------------|-------------|------------------|')

  for (const c of companies) {
    const domain = safeDomain(c.website)
    const sourceCount = c.sources.length
    const kinds = c.sources.map(s=>s.kind).join('<br/>') || '—'
    const enabled = c.sources.map(s=> s.enabled ? '✅' : '❌').join('<br/>') || '—'
    const lastStatus = c.sources.map(s=> s.lastStatus || '—').join('<br/>') || '—'
    const sourcesList = c.sources.map(s=> s.parserName || safeDomain(s.url) || '—').join('<br/>') || '—'
    const prodCount = c.productions.length

    // Adapter existence
    const missingAdapters: string[] = []
    for (const s of c.sources) {
      const parser = s.parserName || safeDomain(s.url)
      if (!parser) continue
      const adapterPath = path.join(process.cwd(),'lib','scraping','adapters', `${parser}.ts`)
      if (!fs.existsSync(adapterPath)) missingAdapters.push(parser)
    }

    rows.push([
      quote(c.name),
      quote(c.region || ''),
      quote(c.website),
      quote(domain || ''),
      quote(c.sources.map(s=> s.url).join('|')),
      quote(c.sources.map(s=> s.kind).join('|')),
      quote(c.sources.map(s=> s.enabled).join('|')),
      quote(c.sources.map(s=> s.lastStatus || '').join('|')),
      String(prodCount),
      quote(missingAdapters.join('|') || '')
    ].join(','))

    mdLines.push(`| ${escapeMd(c.name)} | ${c.region || ''} | [site](${c.website}) | ${sourcesList || '—'} | ${kinds} | ${enabled} | ${lastStatus} | ${prodCount} | ${missingAdapters.length ? missingAdapters.join('<br/>') : '—'} |`)
  }

  console.log('\n# Companies Scraping Coverage\n')
  console.log(mdLines.join('\n'))
  console.log('\n\n# CSV Raw\n')
  console.log(rows.join('\n'))
}

function safeDomain(url?: string|null) {
  if (!url) return undefined
  try { return new URL(url).hostname.replace(/^www\./,'') } catch { return undefined }
}
function quote(v: string) {
  if (v.includes(',') || v.includes('"')) return '"'+v.replace(/"/g,'""')+'"'
  return v
}
function escapeMd(v: string) { return v.replace(/\|/g,'\\|') }

main().catch(e=>{ console.error(e); process.exit(1) })
