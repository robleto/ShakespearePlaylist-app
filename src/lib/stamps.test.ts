import { describe, expect, it } from 'vitest'
import { deriveMode, formatRole, formatStampDate, formatVenue, toRenderData } from './stamps'
import type { Stamp } from '@/types/stamp'

const base: Stamp = {
  id: 's-1',
  playId: 'hamlet',
  date: '2024-03-14',
  productionCompany: 'Royal Shakespeare Co.',
  venue: 'Barbican',
  city: 'London',
  createdAt: '2024-03-15T10:00:00.000Z',
  source: 'manual',
}

describe('stamps render helpers', () => {
  describe('formatStampDate', () => {
    it('formats YYYY-MM-DD as DD·MMM·YYYY uppercase', () => {
      expect(formatStampDate('2024-03-14')).toBe('14·MAR·2024')
    })

    it('handles two-digit days and months consistently', () => {
      expect(formatStampDate('2025-10-08')).toBe('08·OCT·2025')
    })

    it('returns empty string for empty input', () => {
      expect(formatStampDate('')).toBe('')
    })

    it('falls back to the input when not parseable', () => {
      expect(formatStampDate('not-a-date')).toBe('not-a-date')
    })

    it('tolerates a full ISO timestamp', () => {
      expect(formatStampDate('2024-03-14T22:00:00.000Z')).toBe('14·MAR·2024')
    })
  })

  describe('formatVenue', () => {
    it('joins venue and city with " · "', () => {
      expect(formatVenue({ venue: 'Barbican', city: 'London' })).toBe('Barbican · London')
    })

    it('omits empty fields', () => {
      expect(formatVenue({ venue: 'Barbican', city: '' })).toBe('Barbican')
      expect(formatVenue({ venue: '', city: 'London' })).toBe('London')
    })
  })

  describe('formatRole', () => {
    it('prefers director over leadActor', () => {
      expect(formatRole({ director: 'Robert Icke', leadActor: 'X' })).toBe('Dir. Robert Icke')
    })

    it('falls back to lead actor when no director', () => {
      expect(formatRole({ leadActor: 'Adjoa Andoh' })).toBe('Lead — Adjoa Andoh')
    })

    it('returns empty string when neither is set', () => {
      expect(formatRole({})).toBe('')
    })
  })

  describe('deriveMode', () => {
    it('unstamped on empty array', () => {
      expect(deriveMode([])).toBe('unstamped')
    })

    it('stamped on a single stamp with a date', () => {
      expect(deriveMode([base])).toBe('stamped')
    })

    it('multi when more than one stamp', () => {
      expect(deriveMode([base, { ...base, id: 's-2' }])).toBe('multi')
    })

    it('nodata when every stamp lacks a date', () => {
      expect(deriveMode([{ ...base, date: '' }])).toBe('nodata')
    })
  })

  describe('toRenderData', () => {
    it('first stamp renders as circle, subsequent as rect', () => {
      const out = toRenderData([base, { ...base, id: 's-2' }, { ...base, id: 's-3' }])
      expect(out.map((s) => s.kind)).toEqual(['circle', 'rect', 'rect'])
    })

    it('packs venue + city and formats date', () => {
      const [out] = toRenderData([base])
      expect(out.venue).toBe('Barbican · London')
      expect(out.date).toBe('14·MAR·2024')
      expect(out.company).toBe('Royal Shakespeare Co.')
    })

    it('preserves stamp id for editing', () => {
      const [out] = toRenderData([base])
      expect(out.id).toBe('s-1')
    })
  })
})
