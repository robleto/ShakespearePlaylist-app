import type { NormalizedEvent } from '../../normalization/normalize'
import { normalizeEvent } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'

export async function scrapeOSF(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://osfashland.org'
  
  try {
    console.log('🎭 Scraping Oregon Shakespeare Festival with custom parser...')
    
    // First try to find shows from their main season page
    const seasonUrl = `${baseUrl}/en/season.aspx`
    const seasonResult = await fetchWithPoliteness(seasonUrl)
    
    if (seasonResult.status === 200) {
      console.log('📋 Parsing season page for shows...')
      const seasonEvents = parseSeasonPage(seasonResult.content, baseUrl)
      events.push(...seasonEvents)
    }

    // Also try their shows page and calendar
    const showsUrls = [
      `${baseUrl}/en/productions`,
      `${baseUrl}/tickets-and-calendar/calendar`,
      `${baseUrl}/en/productions/2025-plays`
    ]
    
    for (const showsUrl of showsUrls) {
      const showsResult = await fetchWithPoliteness(showsUrl)
      
      if (showsResult.status === 200) {
        console.log(`📋 Parsing shows page: ${showsUrl}`)
        const showEvents = parseShowsPage(showsResult.content, baseUrl)
        events.push(...showEvents)
      }
    }

    // Try individual show pages we know about
    const knownShows = [
      'en/productions/2025-plays/the-merry-wives-of-windsor.aspx',
      'en/productions/2025-plays/antony-and-cleopatra.aspx',
      'en/productions/2025-plays/romeo-and-juliet.aspx',
      'en/productions/2025-plays/hamlet.aspx',
      'en/productions/2025-plays/much-ado-about-nothing.aspx',
      'en/productions/2025-plays/a-midsummer-nights-dream.aspx',
      'en/productions/2025-plays/into-the-woods.aspx',
      'en/productions/2025-plays/importance-of-being-earnest.aspx',
      'en/productions/2025-plays/quixote-nuevo.aspx'
    ]

    for (const show of knownShows) {
      try {
        const showUrl = `${baseUrl}/${show}`
        const showResult = await fetchWithPoliteness(showUrl)
        
        if (showResult.status === 200) {
          console.log(`📋 Parsing individual show page: ${show}`)
          const showEvent = parseIndividualShowPage(showResult.content, baseUrl, showUrl)
          if (showEvent) {
            events.push(showEvent)
            console.log(`✅ Found event: ${showEvent.titleRaw}`)
          } else {
            console.log(`❌ No event found for: ${show}`)
          }
        } else {
          console.log(`❌ Failed to fetch ${showUrl}: ${showResult.status}`)
        }
      } catch (error) {
        console.warn(`Failed to parse show ${show}:`, error)
      }
    }

    console.log(`✅ OSF custom scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('OSF custom scraping failed:', error)
  }

  return events
}

function parseSeasonPage(html: string, baseUrl: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = []
  
  // Look for show titles in the HTML using regex patterns
  // Common patterns: h1, h2, h3 tags with show titles
  const titlePatterns = [
    /<h[123][^>]*>([^<]*(?:shakespeare|hamlet|macbeth|othello|romeo|juliet|merry wives|henry|richard|caesar|antony|cleopatra|midsummer|tempest|much ado|twelfth|merchant|venice|dream|lear|coriolanus|timon|titus)[^<]*)<\/h[123]>/gi,
    /<[^>]*class="[^"]*(?:title|show|play|production)[^"]*"[^>]*>([^<]+)<\/[^>]+>/gi,
    /<[^>]*(?:title|show|play|production)[^>]*>([^<]+)<\/[^>]+>/gi
  ]
  
  for (const pattern of titlePatterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(html)) !== null) {
      const title = match[1]?.trim()
      if (title && title.length > 3 && !title.toLowerCase().includes('buy') && !title.toLowerCase().includes('ticket')) {
        const event = createOSFEvent(title, '', undefined, baseUrl, 0.7)
        if (event) events.push(event)
      }
    }
  }
  
  return events
}

function parseShowsPage(html: string, baseUrl: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = []
  
  // Similar parsing approach for shows page
  const titlePatterns = [
    /<h[123][^>]*>([^<]*(?:shakespeare|hamlet|macbeth|othello|romeo|juliet|merry wives|henry|richard|caesar|antony|cleopatra|midsummer|tempest|much ado|twelfth|merchant|venice|dream|lear|coriolanus|timon|titus)[^<]*)<\/h[123]>/gi,
    /<[^>]*class="[^"]*(?:title|show|play|production)[^"]*"[^>]*>([^<]+)<\/[^>]+>/gi
  ]
  
  for (const pattern of titlePatterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(html)) !== null) {
      const title = match[1]?.trim()
      if (title && title.length > 3) {
        const event = createOSFEvent(title, '', undefined, baseUrl, 0.6)
        if (event) events.push(event)
      }
    }
  }
  
  return events
}

function parseIndividualShowPage(html: string, baseUrl: string, url: string): NormalizedEvent | null {
  try {
    // Extract title from h1 or title tag
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    
    let title = h1Match?.[1]?.trim() || 
                titleMatch?.[1]?.replace(/\s*-\s*Oregon Shakespeare Festival.*$/i, '').trim()
    
    // Clean up HTML entities and extra text
    if (title) {
      title = title.replace(/&[^;]+;/g, '').replace(/\s+/g, ' ').trim()
    }
    
    if (!title || title.length < 3) {
      return null
    }
    
    // Look for date and venue information - OSF has specific patterns
    let dateText = ''
    let venue = 'Allen Elizabethan Theatre' // Default venue
    
    // Look for the date pattern like "May 30 – October 12, 2025 | Allen Elizabethan Theatre"
    const dateVenuePattern = /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+)\s*[–-]\s*((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+),?\s*(\d{4})\s*\|\s*([^<\n]+)/i
    const dateVenueMatch = html.match(dateVenuePattern)
    
    if (dateVenueMatch) {
      const [, startMonth, endDate, year, theaterName] = dateVenueMatch
      dateText = `${startMonth} – ${endDate}, ${year}`
      venue = theaterName.trim()
      console.log(`📅 Found date and venue: "${dateText}" at "${venue}"`)
    } else {
      // Try just date pattern
      const datePattern = /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+)\s*[–-]\s*((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+),?\s*(\d{4})/i
      const dateMatch = html.match(datePattern)
      
      if (dateMatch) {
        const [, startMonth, endDate, year] = dateMatch
        dateText = `${startMonth} – ${endDate}, ${year}`
        console.log(`📅 Found date: "${dateText}"`)
      }
      
      // Look for venue separately
      const venuePatterns = [
        /(Allen Elizabethan Theatre|Angus Bowmer Theatre|Thomas Theatre|New Theatre)/i,
        /Theatre[^<\n]*/i
      ]
      
      for (const pattern of venuePatterns) {
        const venueMatch = html.match(pattern)
        if (venueMatch) {
          venue = venueMatch[1] || venueMatch[0]
          venue = venue.trim()
          console.log(`🏛️ Found venue: "${venue}"`)
          break
        }
      }
    }
    
    console.log(`🎭 Parsing "${title}" - Date: "${dateText}" - Venue: "${venue}"`)
    
    return createOSFEvent(title, dateText, url, baseUrl, 0.9)
  } catch (error) {
    console.warn('Error parsing individual show page:', error)
    return null
  }
}

function createOSFEvent(title: string, dateText: string, link: string | undefined, baseUrl: string, confidence: number): NormalizedEvent | null {
  try {
    // Clean up the title
    const cleanTitle = title
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .replace(/\s+/g, ' ')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 3) {
      return null
    }
    
    // Parse dates
    let startDate = new Date()
    let endDate = new Date()
    
    if (dateText) {
      // Try to parse date ranges like "May 30 – October 12, 2025"
      const rangeMatch = dateText.match(/(may|june|july|august|september|october|november|december)\s+(\d+)[^\w]*(?:–|to|through)[^\w]*(?:(may|june|july|august|september|october|november|december)\s+)?(\d+),?\s*(\d{4})/i)
      
      if (rangeMatch) {
        const [, startMonth, startDay, endMonth, endDay, year] = rangeMatch
        const finalEndMonth = endMonth || startMonth
        
        const startDateStr = `${startMonth} ${startDay}, ${year}`
        const endDateStr = `${finalEndMonth} ${endDay}, ${year}`
        
        const parsedStartDate = new Date(startDateStr)
        const parsedEndDate = new Date(endDateStr)
        
        if (!isNaN(parsedStartDate.getTime())) {
          startDate = parsedStartDate
        }
        if (!isNaN(parsedEndDate.getTime())) {
          endDate = parsedEndDate
        }
      }
    }
    
    // Create the full URL if it's relative
    const fullUrl = link && link.startsWith('http') ? link : 
                   link ? `${baseUrl}${link.startsWith('/') ? '' : '/'}${link}` : 
                   `${baseUrl}/shows`
    
    // Use the normalizeEvent function to ensure proper format
    return normalizeEvent({
      titleRaw: cleanTitle,
      startDate,
      endDate,
      eventUrl: fullUrl,
      notes: `Oregon Shakespeare Festival production`,
      sourceConfidence: confidence
    })
  } catch (error) {
    console.warn('Error creating OSF event:', error)
    return null
  }
}
