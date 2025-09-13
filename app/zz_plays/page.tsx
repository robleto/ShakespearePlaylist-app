import Link from 'next/link'
import { getUpcomingPlayCounts } from '../../lib/services/productions'
import { PLAY_TITLES } from '../../lib/normalization/plays'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'

export const dynamic = 'force-dynamic'

export default async function PlaysOverviewPage() {
  const counts = await getUpcomingPlayCounts()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Plays</h1>
        <p className="text-muted-foreground mb-8">Browse plays and see which companies have upcoming productions.</p>
        {counts.length === 0 && <p className="text-gray-600">No upcoming productions yet.</p>}
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {counts.map(c => (
            <li key={c.canonicalPlay} className="border rounded p-4 bg-white shadow-sm flex justify-between items-center">
              <div>
                <Link href={`/plays/${c.canonicalPlay}`} className="font-semibold hover:underline">
                  {PLAY_TITLES[c.canonicalPlay as keyof typeof PLAY_TITLES]}
                </Link>
              </div>
              <span className="text-sm text-gray-600">{c.count} production{c.count === 1 ? '' : 's'}</span>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  )
}
