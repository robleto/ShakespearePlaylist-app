import { notFound } from 'next/navigation'
import { PLAY_TITLES, CanonicalPlay } from '../../../lib/normalization/plays'
import { getUpcomingProductionsByPlay } from '../../../lib/services/productions'
import { formatDateRange } from '../../../lib/utils/date'
import { Header } from '../../../components/header'
import { Footer } from '../../../components/footer'
import { Breadcrumbs } from '../../../components/breadcrumbs'

export const dynamic = 'force-dynamic'

export default async function PlayDetailPage({ params }: { params: { play: string } }) {
  const playKey = params.play as keyof typeof CanonicalPlay
  if (!CanonicalPlay[playKey]) notFound()
  const productions = await getUpcomingProductionsByPlay(params.play)
  const title = PLAY_TITLES[params.play as keyof typeof PLAY_TITLES]
  const byCompany = productions.reduce<Record<string, typeof productions>>((acc,p)=>{(acc[p.companyId]=acc[p.companyId]||[]).push(p);return acc}, {})
  const companyIds = Object.keys(byCompany)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{label:'Plays',href:'/plays'},{label:title}]} />
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-8">Companies producing this play.</p>
        {productions.length === 0 && <p className="text-gray-600">No upcoming productions of this play.</p>}
        <div className="space-y-8">
          {companyIds.map(cid => {
            const list = byCompany[cid]
            const company = list[0].company
            return (
              <section key={cid}>
                <h2 className="text-xl font-semibold mb-2"><a href={`/companies/${company.id}`} className="hover:underline">{company.name}</a></h2>
                <div className="text-sm text-gray-500 mb-3">{company.city}, {company.region}</div>
                <ul className="divide-y">
                  {list.map(p => (
                    <li key={p.id} className="py-2 flex justify-between items-center">
                      <div className="font-medium">{p.titleRaw}</div>
                      <div className="text-sm text-gray-600">{formatDateRange(p.startDate, p.endDate)}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  )
}
