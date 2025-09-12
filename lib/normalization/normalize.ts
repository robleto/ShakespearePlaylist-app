import { parse, isAfter, isBefore, parseISO, format } from 'date-fns'
import { CanonicalPlay, DEFAULT_ALIASES, PLAY_TITLES, type PlayAlias } from './plays'

// Very common stopwords we don't want to overweight in fuzzy overlap
const STOPWORDS = new Set([
  'the','of','a','an','and','to','for','with','in','on','by','from','be','being','is','are','it','at','as'
])

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

  // Attempt fuzzy matching against every canonical title (excluding OTHER)
  // Strategy: strip non-alphanumerics from both, check for containment or significant token overlap
  const normalized = title.replace(/[^a-z0-9]/g, '')
  let best: { play: CanonicalPlay; confidence: number } | null = null
  for (const [playKey, fullTitle] of Object.entries(PLAY_TITLES)) {
    if (playKey === CanonicalPlay.OTHER) continue
    const normFull = fullTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normFull.length < 5) continue
    if (normalized.includes(normFull)) {
      // Very strong match – full canonical title contained
      best = { play: playKey as CanonicalPlay, confidence: 0.95 }
      break
    }
    // Token overlap heuristic (stopword-aware)
    const titleTokensArr = title.split(/[^a-z0-9]+/).filter(Boolean)
    const titleTokens = new Set(titleTokensArr)
    const fullTokens = fullTitle.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    const fullMeaningful = fullTokens.filter(t => !STOPWORDS.has(t))
    const overlapTokens = fullTokens.filter(t => titleTokens.has(t))
    const overlap = overlapTokens.length
    const meaningfulOverlap = overlapTokens.filter(t => !STOPWORDS.has(t)).length
    // Require at least one meaningful overlapping token (or two total if title is very short)
    if (meaningfulOverlap === 0) continue
    // Compute ratios using meaningful tokens to avoid "the/of" inflation
    const overlapRatio = meaningfulOverlap / Math.max(1, fullMeaningful.length)
    if (
      overlapRatio >= 0.5 && // cover at least half the meaningful tokens
      meaningfulOverlap >= Math.min(2, fullMeaningful.length) // at least 2 unless only 1 meaningful token exists
    ) {
      const confidence = 0.78 + Math.min(0.17, overlapRatio * 0.25) // 0.78–~0.95 bounded
      if (!best || confidence > best.confidence) {
        best = { play: playKey as CanonicalPlay, confidence }
      }
    }
  }
  if (best) return best

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
  let cleanStr = dateStr.trim()
  // Fix common truncation like "anuary" -> "January"
  if (/^anuary/i.test(cleanStr)) cleanStr = 'J' + cleanStr
  if (/^ebruary/i.test(cleanStr)) cleanStr = 'F' + cleanStr
  if (/^arch/i.test(cleanStr)) cleanStr = 'M' + cleanStr
  if (/^uly/i.test(cleanStr)) cleanStr = 'J' + cleanStr // July missing J
  if (/^une/i.test(cleanStr)) cleanStr = 'J' + cleanStr // June missing J
  
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
