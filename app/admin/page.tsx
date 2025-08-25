import { getProductionsForReview } from '../../lib/services/productions'
import { ReviewTable } from '../../components/admin/review-table'

export default async function AdminPage() {
  const productions = await getProductionsForReview()

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Review Queue</h1>
          <p className="mt-2 text-sm text-gray-700">
            Productions that require review before being published.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <ReviewTable productions={productions} />
            </div>
          </div>
        </div>
      </div>

      {productions.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No productions to review</h3>
          <p className="mt-1 text-sm text-gray-500">
            All productions have been reviewed and published.
          </p>
        </div>
      )}
    </div>
  )
}
