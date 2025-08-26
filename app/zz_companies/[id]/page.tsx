import { prisma } from '../../../lib/db'
import { Header } from '../../../components/header'
import { Footer } from '../../../components/footer'
import { Breadcrumbs } from '../../../components/breadcrumbs'
import { PLAY_TITLES } from '../../../lib/normalization/plays'
import { formatDateRange } from '../../../lib/utils/date'

interface Params { id: string }

export const dynamic = 'force-dynamic'

export default async function CompanyDetail({ params }: { params: Params }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } })
  if (!company) return <div>Company not found</div>
  const productions = await prisma.production.findMany({
    where: { companyId: company.id, status: 'PUBLISHED', endDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    include: { company: true }
  })
  const byPlay = productions.reduce<Record<string, typeof productions>>((acc,p)=>{(acc[p.canonicalPlay]=acc[p.canonicalPlay]||[]).push(p);return acc}, {})
  const playKeys = Object.keys(byPlay)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{label:'Companies',href:'/companies'},{label:company.name}]} />
        <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
        <p className="text-gray-600 mb-8">{company.city}, {company.region} · <a href={company.website} className="text-blue-600 hover:underline" target="_blank">Website</a></p>
        {playKeys.length === 0 && <p className="text-muted-foreground">No upcoming productions.</p>}
        <div className="space-y-10">
          {playKeys.map(pk => (
            <section key={pk}>
              <h2 className="text-xl font-semibold mb-3"><a href={`/plays/${pk}`} className="hover:underline">{PLAY_TITLES[pk as keyof typeof PLAY_TITLES] || pk}</a></h2>
              <ul className="divide-y">
                {byPlay[pk].map(p => (
                  <li key={p.id} className="py-2 flex justify-between items-center">
                    <div className="font-medium">{p.titleRaw}</div>
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
