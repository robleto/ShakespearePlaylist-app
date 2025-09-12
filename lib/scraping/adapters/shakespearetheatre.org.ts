import type { NormalizedEvent } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'
import { parseJSONLD, normalizeJSONLDEvents } from '../parse-jsonld'
import { parseICS, normalizeICSEvents } from '../parse-ics'
import { parseHTMLEvents, normalizeHTMLEvents } from '../parse-html'

export async function scrapeSTC(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://shakespearetheatre.org'
  
  try {
    console.log('🎭 Scraping Shakespeare Theatre Company...')
    
    const mainPageResult = await fetchWithPoliteness(baseUrl)
    if (mainPageResult.status !== 200) {
      console.error(`Failed to fetch STC main page: ${mainPageResult.status}`)
      return events
    }

    // Look for JSON-LD events – but STC tends to embed season-wide historical items.
    // We'll parse but NOT immediately push; we'll first derive current visible season titles from the what's-on page and filter.
    const jsonldAll = parseJSONLD(mainPageResult.content)

    // Fetch what's-on explicitly to derive canonical current production titles
    const whatsOnUrl = baseUrl + '/whats-on'
    const whatsOn = await fetchWithPoliteness(whatsOnUrl)
    let currentTitles: string[] = []
    if (whatsOn.status === 200) {
      // Very lightweight extraction: look for card headings / links containing known play tokens
      const tokenRegex = />([^<]*(Hamlet|Macbeth|Othello|Merry Wives|All's Well|Measure for Measure|Richard II|Richard III|Henry V|Henry IV|Henry VI|Henry VIII|Coriolanus|Cymbeline|Titus|Pericles|Two Gentlemen|Two Noble Kinsmen|Love's Labour|Comedy of Errors|Troilus|Cressida|Winter's Tale|Tempest|Much Ado|Merchant|Twelfth Night|As You Like It))[^<]*</gi
      let m: RegExpExecArray | null
      const found = new Set<string>()
      while ((m = tokenRegex.exec(whatsOn.content)) !== null) {
        const raw = m[1].replace(/&amp;/g,'&').trim()
        // Normalize spacing / punctuation for comparison
        const norm = raw.replace(/\s+/g,' ').replace(/[–—-].*$/, '').trim()
        if (norm.length >= 3) found.add(norm)
      }
      currentTitles = Array.from(found)
      console.log(`STC what's-on extracted titles:`, currentTitles)
    } else {
      console.warn('STC whats-on page fetch failed status', whatsOn.status)
    }

    const jsonldEvents = jsonldAll.filter(e => {
      if (!e.name) return false
      if (currentTitles.length === 0) return true // fallback: keep if we couldn't extract list
      // Keep JSON-LD item only if its name loosely matches one of the visible current titles tokens.
      const nameLower = e.name.toLowerCase()
      return currentTitles.some(t => {
        const tl = t.toLowerCase()
        // Accept if one contains the other (handles subtitle decorations)
        return nameLower.includes(tl) || tl.includes(nameLower)
      })
    })
    if (jsonldEvents.length > 0) {
      console.log(`Filtered JSON-LD events kept: ${jsonldEvents.length} / ${jsonldAll.length}`)
      events.push(...normalizeJSONLDEvents(jsonldEvents, 0.9))
    }

    // Try common event page URLs
    const eventUrls = [
      `${baseUrl}/whats-on`, // prioritize what's-on first now that we filter JSON-LD
      `${baseUrl}/shows-tickets`,
      `${baseUrl}/calendar`,
      `${baseUrl}/shows`,
      `${baseUrl}/season`,
      `${baseUrl}/events`,
      `${baseUrl}/tickets`,
      `${baseUrl}/current-season`,
    ]

    for (const eventUrl of eventUrls) {
      try {
        const eventPageResult = await fetchWithPoliteness(eventUrl)
        if (eventPageResult.status === 200) {
          const pageJsonldEvents = parseJSONLD(eventPageResult.content)
          if (pageJsonldEvents.length > 0) {
            // Apply same filtering by currentTitles if we have them to avoid stale season artifacts
            const filteredPage = currentTitles.length
              ? pageJsonldEvents.filter(e => e.name && currentTitles.some(t => {
                  const tl = t.toLowerCase(); const nl = e.name!.toLowerCase();
                  return nl.includes(tl) || tl.includes(nl)
                }))
              : pageJsonldEvents
            console.log(`Found ${filteredPage.length} / ${pageJsonldEvents.length} JSON-LD events from ${eventUrl}`)
            events.push(...normalizeJSONLDEvents(filteredPage, 0.9))
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

    console.log(`✅ STC scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('STC scraping failed:', error)
  }

  return events
}
