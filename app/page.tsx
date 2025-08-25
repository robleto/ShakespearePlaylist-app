import { searchProductions } from '../lib/services/productions'
import { SearchForm } from '../components/search-form'
import { ProductionCard } from '../components/production-card'
import { Header } from '../components/header'
import { Footer } from '../components/footer'

interface SearchParams {
  q?: string
  play?: string
  start?: string
  end?: string
  cursor?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const filters = {
    q: searchParams.q,
    play: searchParams.play,
    start: searchParams.start ? new Date(searchParams.start) : undefined,
    end: searchParams.end ? new Date(searchParams.end) : undefined,
    status: 'PUBLISHED' as const,
  }

  const { productions, nextCursor, hasMore } = await searchProductions(
    filters,
    20,
    searchParams.cursor
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Shakespeare
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover upcoming Shakespeare productions from theaters across the United States
          </p>
          
          <SearchForm />
        </div>

        {/* Results Section */}
        {productions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">
              {searchParams.q || searchParams.play ? 'Search Results' : 'Upcoming Productions'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productions.map((production) => (
                <ProductionCard
                  key={production.id}
                  production={production}
                />
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="mt-8 text-center">
                <a
                  href={`/?${new URLSearchParams({
                    ...searchParams,
                    cursor: nextCursor || '',
                  }).toString()}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Load More
                </a>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {productions.length === 0 && searchParams.q && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No productions found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or browse all productions.
            </p>
          </div>
        )}

        {/* Featured Content */}
        {productions.length === 0 && !searchParams.q && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to ShakesFind
            </h3>
            <p className="text-gray-500 mb-4">
              Start searching to discover Shakespeare productions near you.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
