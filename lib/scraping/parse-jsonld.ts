import type { NormalizedEvent } from '../normalization/normalize'
import { normalizeTitle, normalizeDates, parsePriceRange } from '../normalization/normalize'

export interface JSONLDEvent {
  '@type': string | string[]
  name?: string
  startDate?: string
  endDate?: string
  location?: {
    name?: string
    address?: string | {
      streetAddress?: string
      addressLocality?: string
      addressRegion?: string
    }
  }
  url?: string
  description?: string
  offers?: {
    price?: string | number
    lowPrice?: string | number
    highPrice?: string | number
    priceCurrency?: string
  } | Array<{
    price?: string | number
    lowPrice?: string | number
    highPrice?: string | number
    priceCurrency?: string
  }>
  performer?: {
    name?: string
  } | Array<{ name?: string }>
}

export function parseJSONLD(htmlContent: string): JSONLDEvent[] {
  const events: JSONLDEvent[] = []
  
  try {
    // Find all JSON-LD script tags
    const scriptRegex = /<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/gis
    let match

    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      try {
        const jsonData = JSON.parse(match[1])
        
        // Handle single objects or arrays
        const items = Array.isArray(jsonData) ? jsonData : [jsonData]
        
        for (const item of items) {
          // Handle @graph structure
          if (item['@graph']) {
            const graphItems = Array.isArray(item['@graph']) ? item['@graph'] : [item['@graph']]
            events.push(...extractEventsFromItems(graphItems))
          } else {
            events.push(...extractEventsFromItems([item]))
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON-LD script:', parseError)
      }
    }
  } catch (error) {
    console.error('Failed to parse JSON-LD:', error)
  }

  return events
}

function extractEventsFromItems(items: any[]): JSONLDEvent[] {
  const events: JSONLDEvent[] = []
  
  for (const item of items) {
    if (isEvent(item)) {
      events.push(item as JSONLDEvent)
    }
  }
  
  return events
}

function isEvent(item: any): boolean {
  if (!item || typeof item !== 'object') return false
  
  const type = item['@type']
  if (!type) return false
  
  const types = Array.isArray(type) ? type : [type]
  return types.some((t: string) => 
    t === 'Event' || 
    t === 'TheaterEvent' || 
    t === 'PerformingArtsEvent' ||
    t.toLowerCase().includes('event')
  )
}

export function normalizeJSONLDEvents(
  jsonldEvents: JSONLDEvent[],
  sourceConfidence = 0.9
): NormalizedEvent[] {
  return jsonldEvents.map((event) => {
    const title = event.name || ''
    const { play, confidence } = normalizeTitle(title)
    
    let startDate = new Date()
    let endDate = startDate
    
    if (event.startDate) {
      try {
        const dates = normalizeDates(event.startDate, event.endDate)
        startDate = dates.startDate
        endDate = dates.endDate
      } catch (error) {
        console.warn('Failed to parse JSON-LD dates:', error)
      }
    }

    // Extract pricing info
    let priceMin: number | undefined
    let priceMax: number | undefined
    
    if (event.offers) {
      const offers = Array.isArray(event.offers) ? event.offers : [event.offers]
      const prices: number[] = []
      
      for (const offer of offers) {
        if (offer.price) {
          const price = typeof offer.price === 'string' ? parseFloat(offer.price) : offer.price
          if (!isNaN(price)) prices.push(price)
        }
        if (offer.lowPrice) {
          const price = typeof offer.lowPrice === 'string' ? parseFloat(offer.lowPrice) : offer.lowPrice
          if (!isNaN(price)) prices.push(price)
        }
        if (offer.highPrice) {
          const price = typeof offer.highPrice === 'string' ? parseFloat(offer.highPrice) : offer.highPrice
          if (!isNaN(price)) prices.push(price)
        }
      }
      
      if (prices.length > 0) {
        priceMin = Math.min(...prices)
        priceMax = Math.max(...prices)
      }
    }

    // Build notes from location and description
    const notes: string[] = []
    if (event.description) {
      notes.push(event.description)
    }
    if (event.location?.name) {
      notes.push(`Venue: ${event.location.name}`)
    }

    return {
      titleRaw: title,
      canonicalPlay: play,
      startDate,
      endDate,
      eventUrl: event.url,
      priceMin,
      priceMax,
      notes: notes.length > 0 ? notes.join(' | ') : undefined,
      sourceConfidence: Math.min(confidence, sourceConfidence),
    }
  })
}

export async function fetchAndParseJSONLD(url: string): Promise<NormalizedEvent[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const htmlContent = await response.text()
    const jsonldEvents = parseJSONLD(htmlContent)
    return normalizeJSONLDEvents(jsonldEvents)
  } catch (error) {
    console.error(`Failed to fetch JSON-LD from ${url}:`, error)
    return []
  }
}
