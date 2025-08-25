import { parse, isAfter, isBefore, parseISO, format } from 'date-fns'
import { CanonicalPlay, DEFAULT_ALIASES, type PlayAlias } from './plays'

export interface NormalizedEvent {
  titleRaw: string
  canonicalPlay: CanonicalPlay
  startDate: Date
  endDate: Date
  perfDates?: Date[]
  eventUrl?: string
  priceMin?: number
  priceMax?: number
  notes?: string
  sourceConfidence: number
}

export interface NormalizationOptions {
  aliases?: PlayAlias[]
  currentYear?: number
}

export function normalizeTitle(
  titleRaw: string,
  options: NormalizationOptions = {}
): { play: CanonicalPlay; confidence: number } {
  const aliases = options.aliases || DEFAULT_ALIASES
  
  // Try aliases first
  for (const alias of aliases) {
    const regex = new RegExp(alias.pattern, 'i')
    if (regex.test(titleRaw)) {
      return { play: alias.play, confidence: alias.confidence }
    }
  }

  // Simple heuristics for common patterns
  const title = titleRaw.toLowerCase()
  
  if (title.includes('hamlet')) {
    return { play: CanonicalPlay.HAMLET, confidence: 0.8 }
  }
  if (title.includes('macbeth')) {
    return { play: CanonicalPlay.MACBETH, confidence: 0.8 }
  }
  if (title.includes('othello')) {
    return { play: CanonicalPlay.OTHELLO, confidence: 0.8 }
  }
  if (title.includes('lear')) {
    return { play: CanonicalPlay.KING_LEAR, confidence: 0.7 }
  }
  if (title.includes('caesar')) {
    return { play: CanonicalPlay.JULIUS_CAESAR, confidence: 0.7 }
  }
  if (title.includes('tempest')) {
    return { play: CanonicalPlay.TEMPEST, confidence: 0.8 }
  }

  // Check if it mentions "Shakespeare" to increase confidence
  const shakespeareMatch = title.includes('shakespeare')
  
  return { 
    play: CanonicalPlay.OTHER, 
    confidence: shakespeareMatch ? 0.4 : 0.2 
  }
}

export function normalizeDates(
  startDateStr: string,
  endDateStr?: string,
  options: NormalizationOptions = {}
): { startDate: Date; endDate: Date } {
  const currentYear = options.currentYear || new Date().getFullYear()
  
  try {
    // Try parsing as ISO date first
    let startDate = tryParseISO(startDateStr)
    if (!startDate) {
      startDate = tryParseCommonFormats(startDateStr, currentYear)
    }
    
    let endDate: Date
    if (endDateStr) {
      endDate = tryParseISO(endDateStr) || tryParseCommonFormats(endDateStr, currentYear)
    } else {
      // If no end date, assume same day
      endDate = new Date(startDate)
    }

    // Ensure end date is after start date
    if (isBefore(endDate, startDate)) {
      // If end date appears to be before start, it might be next year
      endDate = new Date(endDate.getFullYear() + 1, endDate.getMonth(), endDate.getDate())
    }

    return { startDate, endDate }
  } catch (error) {
    console.warn('Date parsing failed:', { startDateStr, endDateStr, error })
    // Fallback to current date
    const fallback = new Date()
    return { startDate: fallback, endDate: fallback }
  }
}

function tryParseISO(dateStr: string): Date | null {
  try {
    const date = parseISO(dateStr)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

function tryParseCommonFormats(dateStr: string, currentYear: number): Date {
  const cleanStr = dateStr.trim()
  
  // Common patterns
  const patterns = [
    'MMM d, yyyy',      // "Jan 15, 2024"
    'MMM d yyyy',       // "Jan 15 2024"
    'MMMM d, yyyy',     // "January 15, 2024"
    'M/d/yyyy',         // "1/15/2024"
    'yyyy-MM-dd',       // "2024-01-15"
    'MMM d',            // "Jan 15" (add current year)
    'MMMM d',           // "January 15" (add current year)
    'M/d',              // "1/15" (add current year)
  ]

  for (const pattern of patterns) {
    try {
      let testStr = cleanStr
      
      // If pattern doesn't include year, add current year
      if (!pattern.includes('y') && !cleanStr.match(/\d{4}/)) {
        testStr = `${cleanStr} ${currentYear}`
        const yearPattern = pattern + ' yyyy'
        const parsed = parse(testStr, yearPattern, new Date())
        if (!isNaN(parsed.getTime())) {
          return parsed
        }
      } else {
        const parsed = parse(testStr, pattern, new Date())
        if (!isNaN(parsed.getTime())) {
          return parsed
        }
      }
    } catch {
      // Try next pattern
    }
  }

  // Fallback: try to extract numbers and make a reasonable guess
  const numbers = cleanStr.match(/\d+/g)
  if (numbers && numbers.length >= 2) {
    const month = parseInt(numbers[0])
    const day = parseInt(numbers[1])
    const year = numbers.length > 2 ? parseInt(numbers[2]) : currentYear
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day)
    }
  }

  throw new Error(`Unable to parse date: ${dateStr}`)
}

export function parsePriceRange(priceStr: string): { min?: number; max?: number } {
  if (!priceStr) return {}

  // Remove currency symbols and clean up
  const clean = priceStr.replace(/[$£€¥]/g, '').replace(/,/g, '')
  
  // Look for range patterns like "$20-$50" or "$20 to $50"
  const rangeMatch = clean.match(/(\d+(?:\.\d{2})?)\s*[-–—to]\s*(\d+(?:\.\d{2})?)/)
  if (rangeMatch) {
    return {
      min: Math.round(parseFloat(rangeMatch[1])),
      max: Math.round(parseFloat(rangeMatch[2])),
    }
  }

  // Look for single price
  const singleMatch = clean.match(/(\d+(?:\.\d{2})?)/)
  if (singleMatch) {
    const price = Math.round(parseFloat(singleMatch[1]))
    return { min: price, max: price }
  }

  return {}
}

export function normalizeEvent(
  event: Partial<NormalizedEvent> & { titleRaw: string },
  options: NormalizationOptions = {}
): NormalizedEvent {
  const { play, confidence } = normalizeTitle(event.titleRaw, options)
  
  const startDate = event.startDate || new Date()
  const endDate = event.endDate || startDate

  return {
    titleRaw: event.titleRaw,
    canonicalPlay: play,
    startDate,
    endDate,
    perfDates: event.perfDates,
    eventUrl: event.eventUrl,
    priceMin: event.priceMin,
    priceMax: event.priceMax,
    notes: event.notes,
    sourceConfidence: event.sourceConfidence || confidence,
  }
}
