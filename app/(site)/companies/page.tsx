import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export const revalidate = 3600

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: [{ region: 'asc' }, { name: 'asc' }],
    include: {
      sources: true,
      _count: { select: { productions: { where: { status: 'PUBLISHED' } } } }
    }
  })

  const grouped = companies.reduce<Record<string, typeof companies>>((acc: Record<string, typeof companies>, c: (typeof companies)[number]) => {
    acc[c.region] = acc[c.region] || []
    acc[c.region].push(c)
    return acc
  }, {})
  const regions = Object.keys(grouped).sort()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Companies</h1>
      <p className="text-muted-foreground mb-8">Browse theatre companies. Click a company to view its productions and plays.</p>
      <div className="space-y-10">
        {regions.map(region => (
          <section key={region}>
            <h2 className="text-xl font-semibold mb-4">{region}</h2>
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[region].map((c: (typeof companies)[number]) => {
                const missingAdapters = c.sources.filter(s=>{
                  const parser = s.parserName || (s.url ? safeDomain(s.url) : null)
                  if (!parser) return false
                  const adapterPath = path.join(process.cwd(),'lib','scraping','adapters', `${parser}.ts`)
                  return !fs.existsSync(adapterPath)
                })
                const needsScraper = c.sources.filter(s=> s.enabled).length === 0 || missingAdapters.length > 0
                return (
                <li key={c.id} className="border rounded p-4 hover:shadow transition bg-white">
                  <a href={`/companies/${(c as any).slug || c.id}`} className="font-medium text-blue-700 hover:underline">{c.name}</a>{' '}
                  {needsScraper && <span className="inline-block ml-2 text-[10px] uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">Needs Scraper</span>}
                  <div className="text-sm text-gray-500 mt-1">{c.city}, {c.region}</div>
                  {c.website && (
                    <div className="text-xs mt-1">
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website ↗</a>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">{c._count.productions} production{c._count.productions === 1 ? '' : 's'}</div>
                  <div className="mt-2 text-xs">
                    <a href={`/productions?company=${encodeURIComponent(c.id)}`} className="text-blue-600 hover:underline">View productions</a>
                  </div>
                </li>
              )})}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function safeDomain(url?: string|null) { if (!url) return undefined; try { return new URL(url).hostname.replace(/^www\./,'') } catch { return undefined } }
