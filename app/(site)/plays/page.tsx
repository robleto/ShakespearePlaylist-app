import Link from 'next/link'
import { getUpcomingPlayCounts } from '@/lib/services/productions'
import { 
  PLAY_TITLES, 
  CATEGORY_TITLES, 
  getAllPlaysByCategory,
  PlayCategory,
  CanonicalPlay 
} from '@/lib/normalization/plays'

export const dynamic = 'force-dynamic'

export default async function PlaysOverviewPage() {
  const counts = await getUpcomingPlayCounts()
  const playsByCategory = getAllPlaysByCategory()
  
  // Create a map for quick lookup of production counts
  const countMap = new Map(counts.map(c => [c.canonicalPlay, c.count]))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Shakespeare's Complete Works</h1>
      <p className="text-muted-foreground mb-8">
        All 38 plays by William Shakespeare, organized by genre. 
        Production counts show upcoming performances from tracked theater companies.
      </p>
      
      {Object.entries(playsByCategory).map(([category, plays]) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            {CATEGORY_TITLES[category as PlayCategory]}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({plays.length} plays)
            </span>
          </h2>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {plays.map((play) => {
              const productionCount = countMap.get(play) || 0
              return (
                <div 
                  key={play} 
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link 
                        href={`/plays/${play}`} 
                        className="font-medium hover:underline text-foreground"
                      >
                        {PLAY_TITLES[play]}
                      </Link>
                    </div>
                    {productionCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full ml-2">
                        {productionCount} upcoming
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
      
      {counts.length > 0 && (
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Production Summary</h3>
          <p className="text-sm text-muted-foreground">
            Currently tracking {counts.length} plays with upcoming productions across all theater companies.
          </p>
        </div>
      )}
    </div>
  )
}
