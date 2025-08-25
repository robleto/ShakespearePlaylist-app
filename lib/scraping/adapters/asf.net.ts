import type { NormalizedEvent } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'
import { parseJSONLD, normalizeJSONLDEvents } from '../parse-jsonld'
import { parseICS, normalizeICSEvents } from '../parse-ics'
import { parseHTMLEvents, normalizeHTMLEvents } from '../parse-html'

export async function scrapeASF(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://asf.net'
  
  try {
    console.log('🎭 Scraping Alabama Shakespeare Festival...')
    
    // Try to find calendar or events page
    const mainPageResult = await fetchWithPoliteness(baseUrl)
    if (mainPageResult.status !== 200) {
      console.error(`Failed to fetch ASF main page: ${mainPageResult.status}`)
      return events
    }

    // Look for JSON-LD events first
    const jsonldEvents = parseJSONLD(mainPageResult.content)
    if (jsonldEvents.length > 0) {
      console.log(`Found ${jsonldEvents.length} JSON-LD events`)
      events.push(...normalizeJSONLDEvents(jsonldEvents, 0.9))
    }

    // Look for ICS calendar links
    const icsLinks = extractICSLinks(mainPageResult.content, baseUrl)
    for (const icsUrl of icsLinks) {
      try {
        const icsResult = await fetchWithPoliteness(icsUrl)
        if (icsResult.status === 200) {
          const icsEvents = parseICS(icsResult.content)
          console.log(`Found ${icsEvents.length} ICS events from ${icsUrl}`)
          events.push(...normalizeICSEvents(icsEvents, 0.95))
        }
      } catch (error) {
        console.warn(`Failed to fetch ICS from ${icsUrl}:`, error)
      }
    }

    // Look for events or calendar page
    const eventUrls = [
      `${baseUrl}/events`,
      `${baseUrl}/calendar`,
      `${baseUrl}/shows`,
      `${baseUrl}/season`,
      `${baseUrl}/whats-on`,
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
        }
      } catch (error) {
        console.warn(`Failed to scrape ${eventUrl}:`, error)
      }
    }

    console.log(`✅ ASF scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('ASF scraping failed:', error)
  }

  return events
}

function extractICSLinks(htmlContent: string, baseUrl: string): string[] {
  const links: string[] = []
  
  // Look for .ics links
  const icsRegex = /href=["\']([^"\']*\.ics[^"\']*)["\']|webcal:\/\/([^\s"\'<>]+)/gi
  let match
  
  while ((match = icsRegex.exec(htmlContent)) !== null) {
    const url = match[1] || `https://${match[2]}`
    try {
      const fullUrl = new URL(url, baseUrl).toString()
      if (!links.includes(fullUrl)) {
        links.push(fullUrl)
      }
    } catch {
      // Skip invalid URLs
    }
  }
  
  return links
}
