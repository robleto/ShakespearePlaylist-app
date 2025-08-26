import { prisma } from '../../lib/db'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'

export const revalidate = 3600

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: [{ region: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { productions: { where: { status: 'PUBLISHED' } } } }
    }
  })

  const grouped = companies.reduce<Record<string, typeof companies>>((acc, c) => {
    acc[c.region] = acc[c.region] || []
    acc[c.region].push(c)
    return acc
  }, {})
  const regions = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Companies</h1>
        <p className="text-muted-foreground mb-8">Browse theatre companies. Click a company to view its productions and plays.</p>
        <div className="space-y-10">
          {regions.map(region => (
            <section key={region}>
              <h2 className="text-xl font-semibold mb-4">{region}</h2>
              <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[region].map(c => (
                  <li key={c.id} className="border rounded p-4 hover:shadow transition bg-white">
                    <a href={`/productions?company=${encodeURIComponent(c.id)}`} className="font-medium text-blue-700 hover:underline">{c.name}</a>
                    <div className="text-sm text-gray-500 mt-1">{c.city}, {c.region}</div>
                    <div className="text-xs text-gray-400 mt-2">{c._count.productions} productions</div>
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
