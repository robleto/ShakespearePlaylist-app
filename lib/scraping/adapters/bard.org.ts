import type { NormalizedEvent } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'
import { parseJSONLD, normalizeJSONLDEvents } from '../parse-jsonld'
import { parseICS, normalizeICSEvents } from '../parse-ics'
import { parseHTMLEvents, normalizeHTMLEvents } from '../parse-html'

export async function scrapeUSF(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://bard.org'
  
  try {
    console.log('🎭 Scraping Utah Shakespeare Festival...')
    
    const mainPageResult = await fetchWithPoliteness(baseUrl)
    if (mainPageResult.status !== 200) {
      console.error(`Failed to fetch USF main page: ${mainPageResult.status}`)
      return events
    }

    // Look for JSON-LD events
    const jsonldEvents = parseJSONLD(mainPageResult.content)
    if (jsonldEvents.length > 0) {
      console.log(`Found ${jsonldEvents.length} JSON-LD events`)
      events.push(...normalizeJSONLDEvents(jsonldEvents, 0.9))
    }

    // Try common event page URLs
    const eventUrls = [
      `${baseUrl}/tickets`,
      `${baseUrl}/calendar`,
      `${baseUrl}/shows`,
      `${baseUrl}/season`,
      `${baseUrl}/whats-on`,
      `${baseUrl}/events`,
      `${baseUrl}/plays`,
      `${baseUrl}/current-season`,
    ]

    for (const eventUrl of eventUrls) {
      try {
        const eventPageResult = await fetchWithPoliteness(eventUrl)
        if (eventPageResult.status === 200) {
          const pageJsonldEvents = parseJSONLD(eventPageResult.content)
          if (pageJsonldEvents.length > 0) {
            console.log(`Found ${pageJsonldEvents.length} JSON-LD events from ${eventUrl}`)
            events.push(...normalizeJSONLDEvents(pageJsonldEvents, 0.9))
          } else {
            const htmlEvents = parseHTMLEvents(eventPageResult.content, { baseUrl: eventUrl })
            if (htmlEvents.length > 0) {
              console.log(`Found ${htmlEvents.length} HTML events from ${eventUrl}`)
              events.push(...normalizeHTMLEvents(htmlEvents, 0.6))
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scrape ${eventUrl}:`, error)
      }
    }

    console.log(`✅ USF scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('USF scraping failed:', error)
  }

  return events
}
