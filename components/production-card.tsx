import Link from 'next/link'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { PLAY_TITLES } from '../lib/normalization/plays'
import { formatDateRange } from '../lib/utils/date'

interface Production {
  id: string
  titleRaw: string
  canonicalPlay: string
  startDate: Date | string
  endDate: Date | string
  eventUrl?: string | null
  priceMin?: number | null
  priceMax?: number | null
  company: {
    name: string
    city: string
    region: string
  }
  venue?: {
    name: string
  } | null
}

interface ProductionCardProps {
  production: Production
}

export function ProductionCard({ production }: ProductionCardProps) {
  const playTitle = PLAY_TITLES[production.canonicalPlay as keyof typeof PLAY_TITLES] || production.canonicalPlay
  const dateRange = formatDateRange(production.startDate, production.endDate)
  
  const formatPrice = () => {
    if (!production.priceMin && !production.priceMax) return null
    if (production.priceMin === production.priceMax) return `$${production.priceMin}`
    if (production.priceMin && production.priceMax) return `$${production.priceMin} - $${production.priceMax}`
    if (production.priceMin) return `From $${production.priceMin}`
    return `Up to $${production.priceMax}`
  }

  const price = formatPrice()

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {production.titleRaw}
          </h3>
          {production.eventUrl && (
            <a
              href={production.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
              title="Visit box office"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {production.venue ? (
              <span>{production.venue.name}, {production.company.city}, {production.company.region}</span>
            ) : (
              <span>{production.company.city}, {production.company.region}</span>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {production.company.name}
          </div>

          {price && (
            <div className="text-sm font-medium text-green-600">
              {price}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {playTitle}
          </span>

          <Link
            href={`/productions/${production.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
