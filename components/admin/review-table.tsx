'use client'

import { useState } from 'react'
import { Check, X, Edit } from 'lucide-react'
import { PLAY_TITLES } from '../../lib/normalization/plays'
import { formatDateRange } from '../../lib/utils/date'
import type { Production as PrismaProduction, Company, Venue } from '@prisma/client'

type Production = PrismaProduction & {
  company: Company
  venue?: Venue | null
}

interface ReviewTableProps {
  productions: Production[]
}

export function ReviewTable({ productions }: ReviewTableProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (productionId: string) => {
    setLoading(productionId)
    try {
      const response = await fetch(`/api/admin/productions/${productionId}/approve`, {
        method: 'POST',
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to approve production:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleArchive = async (productionId: string) => {
    setLoading(productionId)
    try {
      const response = await fetch(`/api/admin/productions/${productionId}/archive`, {
        method: 'POST',
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to archive production:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Production
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Company
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Dates
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Confidence
          </th>
          <th scope="col" className="relative px-6 py-3">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {productions.map((production) => {
          const playTitle = PLAY_TITLES[production.canonicalPlay as keyof typeof PLAY_TITLES] || production.canonicalPlay
          const dateRange = formatDateRange(production.startDate, production.endDate)
          const isLoading = loading === production.id

          return (
            <tr key={production.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {production.titleRaw}
                  </div>
                  <div className="text-sm text-gray-500">
                    {playTitle}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{production.company.name}</div>
                <div className="text-sm text-gray-500">
                  {production.company.city}, {production.company.region}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dateRange}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  production.sourceConfidence > 0.8
                    ? 'bg-green-100 text-green-800'
                    : production.sourceConfidence > 0.6
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {Math.round(production.sourceConfidence * 100)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleApprove(production.id)}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(production.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Archive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
