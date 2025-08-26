import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

function safeDomain(url?: string|null) { if (!url) return undefined; try { return new URL(url).hostname.replace(/^www\./,'') } catch { return undefined } }

export const revalidate = 300

export async function GET() {
  const companies = await prisma.company.findMany({
    include: { sources: true, _count: { select: { productions: { where: { status: 'PUBLISHED' } } } } },
    orderBy: { name: 'asc' }
  })
  const data = companies.map(c => {
    const domain = safeDomain(c.website)
    const missingAdapters: string[] = []
    for (const s of c.sources) {
      const parser = s.parserName || safeDomain(s.url)
      if (!parser) continue
      const adapterPath = path.join(process.cwd(),'lib','scraping','adapters', `${parser}.ts`)
      if (!fs.existsSync(adapterPath)) missingAdapters.push(parser)
    }
    const needsScraper = c.sources.filter(s=> s.enabled).length === 0 || missingAdapters.length > 0
    return {
      id: c.id,
      name: c.name,
      slug: (c as any).slug || null,
      website: c.website,
      region: c.region,
      city: c.city,
      domain,
      productions: c._count.productions,
      sources: c.sources.map(s=> ({ id: s.id, url: s.url, kind: s.kind, enabled: s.enabled, lastStatus: s.lastStatus, parserName: s.parserName })),
      missingAdapters,
      needsScraper
    }
  })
  return NextResponse.json({ generatedAt: new Date().toISOString(), companies: data })
}
