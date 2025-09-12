'use client'

import { PLAY_OPTIONS } from '@/lib/normalization/plays'
import { useRouter, useSearchParams } from 'next/navigation'

interface ProductionsFilterProps {
  currentPlay?: string
  currentCompany?: string
  hideStale?: boolean
}

export function ProductionsFilter({ currentPlay, currentCompany, hideStale }: ProductionsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePlayChange = (play: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (play) {
      params.set('play', play)
    } else {
      params.delete('play')
    }
    
    // Preserve company filter if it exists
    if (currentCompany) {
      params.set('company', currentCompany)
    }
    
    const queryString = params.toString()
    const url = queryString ? `/productions?${queryString}` : '/productions'
    router.push(url)
  }

  const handleReset = () => {
    const params = new URLSearchParams()
    if (currentCompany) {
      params.set('company', currentCompany)
    }
    if (hideStale) params.set('hideStale','1')
    const queryString = params.toString()
    const url = queryString ? `/productions?${queryString}` : '/productions'
    router.push(url)
  }

  const toggleStale = () => {
    const params = new URLSearchParams(searchParams)
    if (params.get('hideStale') === '1') params.delete('hideStale')
    else params.set('hideStale','1')
    if (currentPlay) params.set('play', currentPlay)
    if (currentCompany) params.set('company', currentCompany)
    const url = `/productions?${params.toString()}`
    router.push(url)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="play" className="text-gray-600">Play:</label>
      <select
        id="play"
        name="play"
        value={currentPlay || ''}
        className="border rounded px-2 py-1 text-sm"
        onChange={(e) => handlePlayChange(e.target.value)}
      >
        <option value="">All</option>
        {PLAY_OPTIONS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {currentPlay && (
        <button
          type="button"
          onClick={handleReset}
          className="text-blue-600 hover:underline"
        >
          Reset
        </button>
      )}
      <label className="flex items-center gap-1 ml-4 text-xs cursor-pointer">
        <input type="checkbox" checked={searchParams.get('hideStale') === '1'} onChange={toggleStale} /> Hide stale
      </label>
    </div>
  )
}
