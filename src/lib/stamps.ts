import type { Stamp } from '@/types/stamp'

export type StampMode = 'unstamped' | 'stamped' | 'multi' | 'nodata'
export type StampKind = 'circle' | 'rect' | 'premiere'

export type StampRenderData = {
  id: string
  kind: StampKind
  company: string
  venue: string
  date: string
  role: string
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Format a partial-or-full ISO date as the design's "14·MAR·2024".
 * Accepts:
 *   "2024-03-14" → "14·MAR·2024"
 *   "2024-03"    → "MAR·2024"
 *   "2024"       → "2024"
 *   ""           → ""
 */
export function formatStampDate(iso: string): string {
  if (!iso) return ''
  const full = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (full) {
    const [, year, month, day] = full
    const idx = parseInt(month, 10) - 1
    return `${day}·${MONTHS[idx] ?? month}·${year}`
  }
  const yearMonth = iso.match(/^(\d{4})-(\d{2})$/)
  if (yearMonth) {
    const [, year, month] = yearMonth
    const idx = parseInt(month, 10) - 1
    return `${MONTHS[idx] ?? month}·${year}`
  }
  const yearOnly = iso.match(/^\d{4}$/)
  if (yearOnly) return iso
  return iso
}

/** "Barbican · London" from venue + city. */
export function formatVenue(stamp: Pick<Stamp, 'venue' | 'city'>): string {
  return [stamp.venue, stamp.city].filter(Boolean).join(' · ')
}

/** "Dir. Robert Icke" or "Lead — Adjoa Andoh"; empty if neither. */
export function formatRole(stamp: Pick<Stamp, 'director' | 'leadActor'>): string {
  if (stamp.director) return `Dir. ${stamp.director}`
  if (stamp.leadActor) return `Lead — ${stamp.leadActor}`
  return ''
}

export function deriveMode(stamps: Stamp[]): StampMode {
  if (stamps.length === 0) return 'unstamped'
  if (stamps.every((s) => !s.date)) return 'nodata'
  if (stamps.length === 1) return 'stamped'
  return 'multi'
}

/**
 * v1 kind picker: first stamp on a play renders as a "circle" (official
 * viewing); subsequent stamps render as "rect". Premiere variant is not
 * picked automatically — leave it for explicit user marking later.
 */
function kindForIndex(i: number): StampKind {
  return i === 0 ? 'circle' : 'rect'
}

/** Convert persisted stamps into the shape Stamp components consume. */
export function toRenderData(stamps: Stamp[]): StampRenderData[] {
  return stamps.map((s, i) => ({
    id: s.id,
    kind: kindForIndex(i),
    company: s.productionCompany,
    venue: formatVenue(s),
    date: formatStampDate(s.date),
    role: formatRole(s),
  }))
}
