import ICAL from 'ical.js'
import type { NormalizedEvent } from '../normalization/normalize'
import { normalizeTitle, normalizeDates } from '../normalization/normalize'

export interface ICSEvent {
  summary: string
  dtstart: string
  dtend?: string
  description?: string
  url?: string
  location?: string
}

export function parseICS(icsContent: string): ICSEvent[] {
  try {
    const jcalData = ICAL.parse(icsContent)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')

    return vevents.map((vevent) => {
      const event = new ICAL.Event(vevent)
      
      return {
        summary: event.summary || '',
        dtstart: event.startDate?.toJSDate()?.toISOString() || '',
        dtend: event.endDate?.toJSDate()?.toISOString(),
        description: event.description || undefined,
        url: getProperty(vevent, 'url') || undefined,
        location: event.location || undefined,
      }
    })
  } catch (error) {
    console.error('Failed to parse ICS:', error)
    return []
  }
}

export function normalizeICSEvents(
  icsEvents: ICSEvent[],
  sourceConfidence = 0.95
): NormalizedEvent[] {
  return icsEvents.map((event) => {
    const { play, confidence } = normalizeTitle(event.summary)
    
    let startDate: Date
    let endDate: Date
    
    try {
      startDate = new Date(event.dtstart)
      endDate = event.dtend ? new Date(event.dtend) : startDate
    } catch {
      startDate = new Date()
      endDate = startDate
    }

    return {
      titleRaw: event.summary,
      canonicalPlay: play,
      startDate,
      endDate,
      eventUrl: event.url,
      notes: event.description,
      sourceConfidence: Math.min(confidence, sourceConfidence),
    }
  })
}

function getProperty(vevent: ICAL.Component, propName: string): string | null {
  try {
    const prop = vevent.getFirstProperty(propName)
    return prop ? prop.getFirstValue() : null
  } catch {
    return null
  }
}

export async function fetchAndParseICS(url: string): Promise<NormalizedEvent[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const icsContent = await response.text()
    const icsEvents = parseICS(icsContent)
    return normalizeICSEvents(icsEvents)
  } catch (error) {
    console.error(`Failed to fetch ICS from ${url}:`, error)
    return []
  }
}
