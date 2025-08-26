import type { NormalizedEvent } from '../../normalization/normalize'
import { normalizeTitle } from '../../normalization/normalize'
import { fetchWithPoliteness } from '../fetch'
import { parseJSONLD, normalizeJSONLDEvents } from '../parse-jsonld'

interface USFEvent {
  title: string
  date: string
  time: string
  venue?: string
  url?: string
}

export async function scrapeUSF(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  const baseUrl = 'https://www.bard.org'
  
  try {
    console.log('🎭 Scraping Utah Shakespeare Festival with custom parser...')
    
    // First try JSON-LD from main pages
    const mainPageResult = await fetchWithPoliteness(baseUrl)
    if (mainPageResult.status === 200) {
      const jsonldEvents = parseJSONLD(mainPageResult.content)
      if (jsonldEvents.length > 0) {
        console.log(`Found ${jsonldEvents.length} JSON-LD events from main page`)
        events.push(...normalizeJSONLDEvents(jsonldEvents, 0.9))
      }
    }

    // Custom calendar crawling for Utah Shakespeare
    const calendarEvents = await scrapeUSFCalendar(baseUrl)
    events.push(...calendarEvents)

    console.log(`✅ USF scraping completed. Found ${events.length} total events.`)
  } catch (error) {
    console.error('USF scraping failed:', error)
  }

  return events
}

async function scrapeUSFCalendar(baseUrl: string): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  
  // Get current date and end of reasonable season (next 6 months)
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 6)
  
  console.log(`🗓️ Crawling USF calendar from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
  
  const currentDate = new Date(startDate)
  let daysChecked = 0
  const maxDays = 180 // Reasonable limit
  
  while (currentDate <= endDate && daysChecked < maxDays) {
    const dateStr = currentDate.toISOString().split('T')[0] // YYYY-MM-DD format
    const calendarUrl = `${baseUrl}/calendar/days/${dateStr}/`
    
    try {
      const result = await fetchWithPoliteness(calendarUrl)
      if (result.status === 200) {
        const dayEvents = parseUSFCalendarDay(result.content, dateStr)
        if (dayEvents.length > 0) {
          console.log(`📅 Found ${dayEvents.length} events on ${dateStr}`)
          events.push(...dayEvents)
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch calendar for ${dateStr}:`, error)
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
    daysChecked++
    
    // Be polite - small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`🎭 Processed ${daysChecked} calendar days, found ${events.length} USF events`)
  return events
}

function parseUSFCalendarDay(htmlContent: string, dateStr: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = []
  
  // Look for card-title elements containing show titles
  const showTitleRegex = /<h3[^>]*class="[^"]*card-title[^"]*"[^>]*>([^<]+)</g
  
  // Extract all show titles first
  const showTitles: string[] = []
  let titleMatch
  while ((titleMatch = showTitleRegex.exec(htmlContent)) !== null) {
    const title = titleMatch[1].trim()
    if (title.length > 3 && !title.toLowerCase().includes('seminar') && !title.toLowerCase().includes('orientation')) {
      showTitles.push(title)
    }
  }
  
  console.log(`📅 Found ${showTitles.length} show titles on ${dateStr}:`, showTitles)
  
  // For each show title, look for associated venue and time information
  for (const title of showTitles) {
    // Clean up the title (remove " - Close", " - Opening", etc)
    const cleanTitle = title.replace(/\s*-\s*(Close|Opening|Preview).*$/, '').trim()
    
    // Look for venue information in the surrounding context
    const titleIndex = htmlContent.indexOf(title)
    const contextAfter = htmlContent.slice(titleIndex, titleIndex + 1000)
    
    // Extract venue
    const venueMatch = contextAfter.match(/(Engelstad Shakespeare Theatre|Randall L\. Jones Theatre|Anes Studio Theatre)/i)
    const venue = venueMatch ? venueMatch[0] : ''
    
    // Look for time information - check for common time patterns
    const timeMatch = contextAfter.match(/(\d{1,2}:\d{2}\s*(?:am|pm))/i)
    const time = timeMatch ? timeMatch[1] : '8:00 pm' // Default time
    
    // Create event
    if (cleanTitle.length > 3) {
      const eventDate = new Date(`${dateStr} ${time}`)
      const normalizedTitle = normalizeTitle(cleanTitle)
      
      const normalizedEvent: NormalizedEvent = {
        titleRaw: cleanTitle,
        canonicalPlay: normalizedTitle.play,
        startDate: eventDate,
        endDate: eventDate,
        eventUrl: `https://www.bard.org/calendar/days/${dateStr}/`,
        notes: venue ? `Venue: ${venue}` : '',
        sourceConfidence: Math.max(normalizedTitle.confidence, 0.9)
      }
      
      events.push(normalizedEvent)
    }
  }
  
  return events
}
