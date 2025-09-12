import { notFound } from 'next/navigation'
import { PLAY_TITLES, CanonicalPlay } from '@/lib/normalization/plays'
import { getAggregatedUpcomingProductions } from '@/lib/services/productions'
import { formatDateRange } from '@/lib/utils/date'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const dynamic = 'force-dynamic'

export default async function PlayDetailPage({ params }: { params: { play: string } }) {
  const playKey = params.play as keyof typeof CanonicalPlay
  if (!CanonicalPlay[playKey]) notFound()
  const title = PLAY_TITLES[params.play as keyof typeof PLAY_TITLES]
  const aggregated = await getAggregatedUpcomingProductions({ play: params.play })
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{label:'Plays',href:'/plays'},{label:title}]} />
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8">Companies producing this play.</p>
      {aggregated.length === 0 && <p className="text-gray-600">No upcoming productions of this play.</p>}
      <ul className="divide-y">
        {aggregated.map(p => (
          <li key={p.companyId} className="py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold"><a href={`/companies/${(p.company as any).slug || p.company.id}`} className="hover:underline">{p.company.name}</a></h2>
              <div className="text-xs text-gray-500 mt-0.5">{p.company.city}, {p.company.region}</div>
            </div>
            <div className="text-sm text-gray-600">{formatDateRange(p.startDate, p.endDate)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
