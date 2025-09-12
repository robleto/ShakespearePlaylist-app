import type { NormalizedEvent } from '../normalization/normalize'
import { normalizeTitle, normalizeDates, parsePriceRange } from '../normalization/normalize'

export interface HTMLParseOptions {
  selectors?: {
    eventContainer?: string
    title?: string
    date?: string
    url?: string
    price?: string
    description?: string
  }
  baseUrl?: string
}

export interface ExtractedEvent {
  title: string
  dateText: string
  url?: string
  priceText?: string
  description?: string
}

export function parseHTMLEvents(
  htmlContent: string,
  options: HTMLParseOptions = {}
): ExtractedEvent[] {
  // This is a conservative HTML parser that looks for common patterns
  // In a real implementation, you'd use a proper DOM parser like cheerio
  
  const events: ExtractedEvent[] = []
  
  try {
    // Look for common event patterns in the HTML
    // This is a simplified implementation - you'd want to use a proper DOM parser
    
    // Pattern 1: Event cards with Shakespeare play names
    const shakespeareKeywords = [
      'hamlet','macbeth','othello','romeo','juliet','lear','caesar','tempest','midsummer','much ado','merchant','venice','taming','shrew','twelfth night','as you like it','winter\'s tale',
      // Added broader coverage tokens
      'merry wives','windsor','all\'s well','measure for measure','richard ii','richard iii','henry iv','henry v','henry vi','henry viii','coriolanus','cymbeline','titus','timon','pericles','two gentlemen','two noble kinsmen','love\'s labour','loves labour','comedy of errors','troilus','cressida'
    ]
    
    const lines = htmlContent.split('\n')
    let currentEvent: Partial<ExtractedEvent> = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      
      // Look for lines containing Shakespeare play names
      const hasShakespeareRef = shakespeareKeywords.some(keyword => 
        line.includes(keyword) || line.includes('shakespeare')
      )
      
      if (hasShakespeareRef) {
        // Extract title from this line
        const titleMatch = line.match(/>([^<]+)</g)
        if (titleMatch) {
          const title = titleMatch[titleMatch.length - 1]
            .replace(/[<>]/g, '')
            .trim()
          
          if (title.length > 3) {
            currentEvent.title = title
            
            // Look for date in surrounding lines
            for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 4); j++) {
              const dateLine = lines[j]
              const dateMatch = extractDateFromLine(dateLine)
              if (dateMatch) {
                currentEvent.dateText = dateMatch
                break
              }
            }
            
            // Look for URL in surrounding lines
            for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 3); j++) {
              const urlLine = lines[j]
              const urlMatch = urlLine.match(/href=["\']([^"\']+)["\']/)
              if (urlMatch && isRelevantUrl(urlMatch[1])) {
                currentEvent.url = resolveUrl(urlMatch[1], options.baseUrl)
                break
              }
            }
            
            // If we have title and date, add the event
            if (currentEvent.title && currentEvent.dateText) {
              events.push(currentEvent as ExtractedEvent)
              currentEvent = {}
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse HTML events:', error)
  }
  
  return events
}

function extractDateFromLine(line: string): string | null {
  // Look for common date patterns
  const datePatterns = [
    /\b\w+\s+\d{1,2},?\s+\d{4}\b/g,           // "January 15, 2024"
    /\b\w+\s+\d{1,2}[-–—]\w+\s+\d{1,2}\b/g,   // "Jan 15–Feb 20"
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,           // "1/15/2024"
    /\b\d{4}-\d{2}-\d{2}\b/g,                 // "2024-01-15"
  ]
  
  for (const pattern of datePatterns) {
    const matches = line.match(pattern)
    if (matches) {
      return matches[0].trim()
    }
  }
  
  return null
}

function isRelevantUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return (
    lowerUrl.includes('ticket') ||
    lowerUrl.includes('event') ||
    lowerUrl.includes('show') ||
    lowerUrl.includes('performance') ||
    lowerUrl.includes('calendar')
  )
}

function resolveUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http')) {
    return url
  }
  
  if (baseUrl) {
    try {
      return new URL(url, baseUrl).toString()
    } catch {
      return url
    }
  }
  
  return url
}

export function normalizeHTMLEvents(
  htmlEvents: ExtractedEvent[],
  sourceConfidence = 0.6
): NormalizedEvent[] {
  return htmlEvents.map((event) => {
  const { play, confidence } = normalizeTitle(event.title)
    
    let startDate = new Date()
    let endDate = startDate
    
    if (event.dateText) {
      try {
        // Try to parse date range
        const rangeSeparators = ['–', '—', '-', ' to ', ' through ']
        let startDateStr = event.dateText
        let endDateStr: string | undefined
        
        for (const separator of rangeSeparators) {
          if (event.dateText.includes(separator)) {
            const parts = event.dateText.split(separator)
            if (parts.length === 2) {
              startDateStr = parts[0].trim()
              endDateStr = parts[1].trim()
              break
            }
          }
        }
        
        const dates = normalizeDates(startDateStr, endDateStr)
        startDate = dates.startDate
        endDate = dates.endDate
      } catch (error) {
        console.warn('Failed to parse HTML dates:', error)
      }
    }

    // Parse price if available
    let priceMin: number | undefined
    let priceMax: number | undefined
    
    if (event.priceText) {
      const prices = parsePriceRange(event.priceText)
      priceMin = prices.min
      priceMax = prices.max
    }

    // Boost confidence slightly for direct canonical matches of single-token famous titles
    const boosted = /^(hamlet|macbeth|othello|lear|coriolanus|cymbeline)$/i.test(event.title.trim()) && confidence < 0.85
      ? 0.9
      : confidence
    return {
      titleRaw: event.title,
      canonicalPlay: play,
      startDate,
      endDate,
      eventUrl: event.url,
      priceMin,
      priceMax,
      notes: event.description,
      sourceConfidence: boosted,
    }
  })
}

export async function fetchAndParseHTML(
  url: string,
  options: HTMLParseOptions = {}
): Promise<NormalizedEvent[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const htmlContent = await response.text()
    const htmlEvents = parseHTMLEvents(htmlContent, {
      ...options,
      baseUrl: options.baseUrl || url,
    })
    return normalizeHTMLEvents(htmlEvents)
  } catch (error) {
    console.error(`Failed to fetch HTML from ${url}:`, error)
    return []
  }
}
