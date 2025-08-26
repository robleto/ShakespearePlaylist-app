import { getProductionsForReview } from '../../../lib/services/productions'
import { ReviewTable } from '../../../components/admin/review-table'

export const revalidate = 0

export default async function AdminReviewPage() {
  const productions = await getProductionsForReview()
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review Queue</h2>
      <p className="text-sm text-gray-600 mb-6">Productions that require approval before publishing.</p>
      <div className="border rounded shadow-sm overflow-hidden">
        <ReviewTable productions={productions} />
      </div>
      {productions.length === 0 && (
        <p className="text-sm text-gray-500 mt-8">Nothing pending. 🎉</p>
      )}
    </div>
  )
}
