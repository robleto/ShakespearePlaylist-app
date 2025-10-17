import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { PLAY_TITLES } from '@/lib/normalization/plays'
import { formatDateRange } from '@/lib/utils/date'
import { notFound, redirect } from 'next/navigation'

interface Params { slug: string }

export const dynamic = 'force-dynamic'

export default async function CompanyDetail({ params }: { params: Params }) {
  // Prefer targeted queries first
  let company = await prisma.company.findUnique({ where: { slug: params.slug } })

  // If not found, attempt lookup by primary ID (UUID string) and redirect to canonical slug if available
  if (!company) {
    const byId = await prisma.company.findUnique({ where: { id: params.slug } })
    if (byId?.slug) {
      redirect(`/companies/${byId.slug}`)
    }
    company = byId || null
  }

  if (!company) return notFound()
  const productions = await prisma.production.findMany({
    where: { companyId: company.id, status: 'PUBLISHED', endDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    include: { company: true }
  })
  const byPlay = productions.reduce<Record<string, typeof productions>>((acc, p)=>{(acc[p.canonicalPlay]=acc[p.canonicalPlay]||[]).push(p);return acc}, {})
  const playKeys = Object.keys(byPlay)
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{label:'Companies',href:'/companies'},{label:company.name}]} />
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-4xl font-bold">{company.name}</h1>
        <a href={`/productions?company=${company.id}`} className="text-sm text-blue-600 hover:underline whitespace-nowrap mt-2">All productions →</a>
      </div>
      <p className="text-gray-600 mb-8">{company.city}, {company.region} · <a href={company.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Website</a></p>
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
    </div>
  )
}
