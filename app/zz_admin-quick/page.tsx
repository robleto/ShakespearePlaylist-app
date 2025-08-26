import { prisma } from '../../lib/db'
import { EnhancedReviewTable } from '../../components/admin/enhanced-review-table'

export default async function QuickAdminPage() {
  const productions = await prisma.production.findMany({
    include: {
      company: {
        include: {
          sources: true
        }
      },
      venue: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold">ShakesFind Quick Admin (No Auth)</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Productions Review</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage all scraped productions with source information. Each production shows which theater website and scraping method was used.
              </p>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <EnhancedReviewTable productions={productions} />
          </div>
        </div>
      </main>
    </div>
  )
}
