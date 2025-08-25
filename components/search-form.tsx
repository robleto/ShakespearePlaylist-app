'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { PLAY_OPTIONS } from '../lib/normalization/plays'

export function SearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedPlay, setSelectedPlay] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedPlay) params.set('play', selectedPlay)
    if (startDate) params.set('start', startDate)
    if (endDate) params.set('end', endDate)
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Query */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Company, city, or play name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Play Selection */}
          <div>
            <label htmlFor="play" className="block text-sm font-medium text-gray-700 mb-1">
              Play
            </label>
            <select
              id="play"
              value={selectedPlay}
              onChange={(e) => setSelectedPlay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Plays</option>
              {PLAY_OPTIONS.map((play) => (
                <option key={play.value} value={play.value}>
                  {play.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search Productions
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
