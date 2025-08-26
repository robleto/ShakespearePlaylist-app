// Auto-generated adapter stub for guthrie.org
import type { NormalizedEvent } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'
import { parseJSONLD, normalizeJSONLDEvents } from '../parse-jsonld'
import { parseHTMLEvents, normalizeHTMLEvents } from '../parse-html'

export async function scrapeGuthrieOrg(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://www.guthrietheater.org'
  
  try {
    console.log('🎭 Scraping Guthrie Theater...')
    
    // Try to find shows or events page
    const eventUrls = [
      `${baseUrl}/shows-and-tickets/performance-calendar/`,
      `${baseUrl}/shows-and-tickets/2025-2026-season/`,
      `${baseUrl}/shows-and-tickets/`,
      `${baseUrl}/events`,
      `${baseUrl}/calendar`,
    ]

    for (const eventUrl of eventUrls) {
      try {
        const eventPageResult = await fetchWithPoliteness(eventUrl)
        if (eventPageResult.status === 200) {
          // Try JSON-LD first
          const pageJsonldEvents = parseJSONLD(eventPageResult.content)
          if (pageJsonldEvents.length > 0) {
            console.log(`Found ${pageJsonldEvents.length} JSON-LD events from ${eventUrl}`)
            events.push(...normalizeJSONLDEvents(pageJsonldEvents, 0.9))
          } else {
            // Fall back to HTML parsing
            const htmlEvents = parseHTMLEvents(eventPageResult.content, { baseUrl: eventUrl })
            if (htmlEvents.length > 0) {
              console.log(`Found ${htmlEvents.length} HTML events from ${eventUrl}`)
              events.push(...normalizeHTMLEvents(htmlEvents, 0.6))
            }
          }
        } else {
          console.log(`${eventUrl} returned status ${eventPageResult.status}`)
        }
      } catch (error) {
        console.warn(`Failed to scrape ${eventUrl}:`, error)
      }
    }

    console.log(`✅ Guthrie Theater scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('Guthrie Theater scraping failed:', error)
  }

  return events
}
