import { getUpcomingProductionsGroupedByCompany, searchProductions } from '@/lib/services/productions'
import { PLAY_TITLES, PLAY_OPTIONS } from '@/lib/normalization/plays'
import { formatDateRange } from '@/lib/utils/date'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { prisma } from '@/lib/db'

interface SearchParams { company?: string; play?: string }

export const dynamic = 'force-dynamic'

export default async function ProductionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { company: companyFilter, play: playFilter } = searchParams

  // If either filter is present, produce a flat list (optionally scoped to company)
  if (companyFilter || playFilter) {
    const productions = await searchProductions({ companyId: companyFilter, play: playFilter, status: 'PUBLISHED' }, 500)
    const company = companyFilter ? await prisma.company.findUnique({ where: { id: companyFilter } }) : null
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{label:'Productions',href:'/productions'}, ...(company ? [{label:company.name}] : []), ...(playFilter ? [{label: PLAY_TITLES[playFilter as keyof typeof PLAY_TITLES] || playFilter}] : [])]} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Productions {company ? `at ${company.name}` : ''}{playFilter && !company ? ` – ${PLAY_TITLES[playFilter as keyof typeof PLAY_TITLES] || playFilter}` : ''}</h1>
          <FilterBar currentPlay={playFilter} currentCompany={companyFilter} />
        </div>
        {productions.productions.length === 0 && <p className="text-gray-600">No matching productions.</p>}
        <ul className="space-y-4">
          {productions.productions.map((p: typeof productions.productions[number]) => (
            <li key={p.id} className="border rounded p-4 bg-white flex justify-between items-center">
              <div>
                <div className="font-medium">{p.titleRaw}</div>
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
  const groups = await getUpcomingProductionsGroupedByCompany()
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{label:'Productions'}]} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Productions by Company</h1>
        <FilterBar currentPlay={undefined} currentCompany={undefined} />
      </div>
      {groups.length === 0 && <p className="text-gray-600">No upcoming productions yet.</p>}
      <div className="space-y-10">
  {groups.map((g: typeof groups[number]) => (
          <section key={g.company.id} className="border rounded-lg p-5 bg-white shadow-sm">
            <h2 className="text-2xl font-semibold mb-2"><a href={`/companies/${g.company.id}`} className="hover:underline">{g.company.name}</a></h2>
            <p className="text-sm text-gray-500 mb-4">{g.company.city}, {g.company.region} · <a href={`/productions?company=${g.company.id}`} className="text-blue-600 hover:underline">All productions →</a></p>
            <ul className="space-y-3">
              {g.productions.map((p: typeof g.productions[number]) => (
                <li key={p.id} className="flex justify-between items-center border-b last:border-b-0 pb-2">
                  <div>
                    <div className="font-medium">{p.titleRaw}</div>
                    <div className="text-xs text-gray-500">{PLAY_TITLES[p.canonicalPlay as keyof typeof PLAY_TITLES]}</div>
                  </div>
                  <div className="text-sm text-gray-600">{formatDateRange(p.startDate, p.endDate)}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function FilterBar({ currentPlay, currentCompany }: { currentPlay?: string; currentCompany?: string }) {
  // Build URL preserving other filter
  const base = '/productions'
  const makeUrl = (play?: string) => {
    const params = new URLSearchParams()
    if (play) params.set('play', play)
    if (currentCompany) params.set('company', currentCompany)
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }
  return (
    <form action="/productions" method="get" className="flex items-center gap-2 text-sm">
      <label htmlFor="play" className="text-gray-600">Play:</label>
      <select
        id="play"
        name="play"
        defaultValue={currentPlay || ''}
        className="border rounded px-2 py-1 text-sm"
        onChange={e=>{ if (typeof window !== 'undefined') window.location.href = makeUrl(e.currentTarget.value || undefined) }}
      >
        <option value="">All</option>
  {PLAY_OPTIONS.map((p: typeof PLAY_OPTIONS[number]) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {currentPlay && (
        <a href={makeUrl(undefined)} className="text-blue-600 hover:underline">Reset</a>
      )}
    </form>
  )
}
