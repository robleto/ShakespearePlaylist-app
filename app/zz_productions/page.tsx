import { getUpcomingProductionsGroupedByCompany, searchProductions } from '../../lib/services/productions'
import { PLAY_TITLES } from '../../lib/normalization/plays'
import { formatDateRange } from '../../lib/utils/date'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { Breadcrumbs } from '../../components/breadcrumbs'
import { prisma } from '../../lib/db'

interface SearchParams { company?: string }

export const dynamic = 'force-dynamic'

export default async function ProductionsByCompanyPage({ searchParams }: { searchParams: SearchParams }) {
  const companyFilter = searchParams.company
  if (companyFilter) {
    const productions = await searchProductions({ companyId: companyFilter, status: 'PUBLISHED' }, 500)
    const company = await prisma.company.findUnique({ where: { id: companyFilter } })
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{label:'Productions',href:'/productions'},{label:company?.name||'Company'}]} />
            <h1 className="text-4xl font-bold mb-6">Productions at {company?.name}</h1>
            <ul className="space-y-4">
              {productions.productions.map(p => (
                <li key={p.id} className="border rounded p-4 bg-white flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.titleRaw}</div>
                    <div className="text-xs text-gray-500">{PLAY_TITLES[p.canonicalPlay as keyof typeof PLAY_TITLES]}</div>
                  </div>
                  <div className="text-sm text-gray-600">{formatDateRange(p.startDate, p.endDate)}</div>
                </li>
              ))}
            </ul>
        </main>
        <Footer />
      </div>
    )
  }
  const groups = await getUpcomingProductionsGroupedByCompany()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{label:'Productions'}]} />
        <h1 className="text-4xl font-bold mb-6">Productions by Company</h1>
        {groups.length === 0 && <p className="text-gray-600">No upcoming productions yet.</p>}
        <div className="space-y-10">
          {groups.map(g => (
            <section key={g.company.id} className="border rounded-lg p-5 bg-white shadow-sm">
              <h2 className="text-2xl font-semibold mb-2"><a href={`/companies/${g.company.id}`} className="hover:underline">{g.company.name}</a></h2>
              <p className="text-sm text-gray-500 mb-4">{g.company.city}, {g.company.region}</p>
              <ul className="space-y-3">
                {g.productions.map(p => (
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
      </main>
      <Footer />
    </div>
  )
}
