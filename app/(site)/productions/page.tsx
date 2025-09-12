import { getAggregatedUpcomingProductions, getAggregatedUpcomingProductionsGroupedByCompany } from '@/lib/services/productions'
import { PLAY_TITLES } from '@/lib/normalization/plays'
import { formatDateRange } from '@/lib/utils/date'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductionsFilter } from '@/components/productions-filter'
import { prisma } from '@/lib/db'

interface SearchParams { company?: string; play?: string; hideStale?: string }

export const dynamic = 'force-dynamic'

export default async function ProductionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { company: companyFilter, play: playFilter, hideStale } = searchParams
  const effectiveHideStale = hideStale === '1' || hideStale === undefined // default on

  // If either filter is present, produce a flat list (optionally scoped to company)
  if (companyFilter || playFilter) {
  const aggregated = await getAggregatedUpcomingProductions({ companyId: companyFilter, play: playFilter, hideStale: effectiveHideStale })
    const company = companyFilter ? await prisma.company.findUnique({ where: { id: companyFilter } }) : null
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{label:'Productions',href:'/productions'}, ...(company ? [{label:company.name}] : []), ...(playFilter ? [{label: PLAY_TITLES[playFilter as keyof typeof PLAY_TITLES] || playFilter}] : [])]} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Productions {company ? `at ${company.name}` : ''}{playFilter && !company ? ` – ${PLAY_TITLES[playFilter as keyof typeof PLAY_TITLES] || playFilter}` : ''}</h1>
          <ProductionsFilter currentPlay={playFilter} currentCompany={companyFilter} />
        </div>
        {aggregated.length === 0 && <p className="text-gray-600">No matching productions.</p>}
        <ul className="space-y-4">
          {aggregated.map((p) => (
            <li key={`${p.companyId}-${p.canonicalPlay}`} className="border rounded p-4 bg-white flex justify-between items-center">
              <div>
                <div className="font-medium">{p.title || PLAY_TITLES[p.canonicalPlay as keyof typeof PLAY_TITLES]}</div>
                <div className="text-xs text-gray-500">{PLAY_TITLES[p.canonicalPlay as keyof typeof PLAY_TITLES]}</div>
                <div className="text-xs text-gray-400 mt-1">{p.company.name}</div>
              </div>
              <div className="text-sm text-gray-600">{formatDateRange(p.startDate, p.endDate)}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // No filters: grouped view
  const groups = await getAggregatedUpcomingProductionsGroupedByCompany({ hideStale: effectiveHideStale })
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{label:'Productions'}]} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Productions by Company</h1>
  <ProductionsFilter currentPlay={undefined} currentCompany={undefined} hideStale={effectiveHideStale} />
      </div>
      {groups.length === 0 && <p className="text-gray-600">No upcoming productions yet.</p>}
      <div className="space-y-10">
  {groups.map((g: typeof groups[number]) => (
          <section key={g.company.id} className="border rounded-lg p-5 bg-white shadow-sm">
            <h2 className="text-2xl font-semibold mb-2"><a href={`/companies/${(g.company as any).slug || g.company.id}`} className="hover:underline">{g.company.name}</a></h2>
            <p className="text-sm text-gray-500 mb-4">{g.company.city}, {g.company.region} · <a href={`/productions?company=${g.company.id}`} className="text-blue-600 hover:underline">All productions →</a></p>
            <ul className="space-y-3">
              {g.rows.map(r => (
                <li key={`${g.company.id}-${r.canonicalPlay}`} className="flex justify-between items-center border-b last:border-b-0 pb-2">
                  <div>
                    <div className="font-medium">{PLAY_TITLES[r.canonicalPlay as keyof typeof PLAY_TITLES]}</div>
                    {r.title && r.title !== PLAY_TITLES[r.canonicalPlay as keyof typeof PLAY_TITLES] && (
                      <div className="text-[10px] text-gray-400 mt-0.5">orig: {r.title}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{formatDateRange(r.startDate, r.endDate)}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
