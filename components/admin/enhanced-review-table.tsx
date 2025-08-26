'use client'

import { useState } from 'react'
import { Check, X, Edit, ExternalLink } from 'lucide-react'
import { PLAY_TITLES } from '../../lib/normalization/plays'
import { formatDateRange } from '../../lib/utils/date'
import type { Production as PrismaProduction, Company, Venue, Source } from '@prisma/client'

type ProductionWithSource = PrismaProduction & {
  company: Company & {
    sources: Source[]
  }
  venue?: Venue | null
}

interface EnhancedReviewTableProps {
  productions: ProductionWithSource[]
}

export function EnhancedReviewTable({ productions }: EnhancedReviewTableProps) {
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

  const getSourceInfo = (production: ProductionWithSource) => {
    const source = production.company.sources[0] // Most companies have one primary source
    if (!source) return { name: 'Unknown', type: 'UNKNOWN', url: '' }
    
    // Map source types to display names
    const sourceTypeNames: Record<string, string> = {
      'ICS': 'Calendar (ICS)',
      'JSONLD': 'Structured Data',
      'HTML': 'Web Scraping'
    }
    
    return {
      name: source.parserName || source.url,
      type: sourceTypeNames[source.kind] || source.kind,
      url: source.url
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'PUBLISHED': 'bg-green-100 text-green-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Production
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company & Source
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status & Confidence
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
            const sourceInfo = getSourceInfo(production)
            const isLoading = loading === production.id

            return (
              <tr key={production.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {production.titleRaw}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {playTitle}
                    </div>
                    {production.venue && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {production.venue.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {production.company.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {production.company.city}, {production.company.region}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sourceInfo.type}
                      </span>
                      {sourceInfo.url && (
                        <a 
                          href={sourceInfo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dateRange}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(production.status)}`}>
                      {production.status}
                    </span>
                    <div className="text-sm text-gray-500">
                      Confidence: {Math.round(production.sourceConfidence * 100)}%
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    {production.status === 'REVIEW' && (
                      <button
                        onClick={() => handleApprove(production.id)}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(production.id)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      {productions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No productions found</div>
        </div>
      )}
    </div>
  )
}
