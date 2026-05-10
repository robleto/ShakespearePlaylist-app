import { describe, expect, it } from 'vitest'
import {
  addStamp,
  deleteStamp,
  emptyState,
  readState,
  stampedPlayIds,
  stampsForPlay,
  updateStamp,
  writeState,
  type PlaybookState,
} from './playbook-storage'
import type { Stamp } from '@/types/stamp'

const sampleStamp: Stamp = {
  id: 'stamp-1',
  playId: 'hamlet',
  date: '2024-03-14',
  productionCompany: 'Royal Shakespeare Co.',
  venue: 'Barbican',
  city: 'London',
  director: 'Robert Icke',
  createdAt: '2024-03-15T10:00:00.000Z',
  source: 'manual',
}

describe('playbook-storage', () => {
  describe('readState', () => {
    it('returns empty state when raw is null', () => {
      expect(readState(null)).toEqual(emptyState())
    })

    it('returns empty state for invalid JSON', () => {
      expect(readState('not json {{{')).toEqual(emptyState())
    })

    it('returns empty state for shape with wrong version', () => {
      expect(readState(JSON.stringify({ v: 99, stamps: [] }))).toEqual(emptyState())
    })

    it('returns empty state when stamps is missing', () => {
      expect(readState(JSON.stringify({ v: 1 }))).toEqual(emptyState())
    })

    it('round-trips a valid v1 state', () => {
      const state: PlaybookState = { v: 1, stamps: [sampleStamp] }
      const round = readState(writeState(state))
      expect(round).toEqual(state)
    })
  })

  describe('addStamp', () => {
    it('appends a stamp to the array', () => {
      const next = addStamp(emptyState(), sampleStamp)
      expect(next.stamps).toHaveLength(1)
      expect(next.stamps[0]).toBe(sampleStamp)
    })

    it('does not mutate the input state', () => {
      const before = emptyState()
      addStamp(before, sampleStamp)
      expect(before.stamps).toHaveLength(0)
    })
  })

  describe('updateStamp', () => {
    it('updates fields on the matching stamp only', () => {
      const state: PlaybookState = {
        v: 1,
        stamps: [sampleStamp, { ...sampleStamp, id: 'stamp-2', playId: 'macbeth' }],
      }
      const next = updateStamp(state, 'stamp-1', { city: 'Stratford' })
      expect(next.stamps[0].city).toBe('Stratford')
      expect(next.stamps[1].city).toBe('London')
    })

    it('is a no-op when id does not match', () => {
      const state: PlaybookState = { v: 1, stamps: [sampleStamp] }
      const next = updateStamp(state, 'unknown', { city: 'Stratford' })
      expect(next.stamps[0].city).toBe('London')
    })
  })

  describe('deleteStamp', () => {
    it('removes a stamp by id', () => {
      const state: PlaybookState = { v: 1, stamps: [sampleStamp] }
      const next = deleteStamp(state, 'stamp-1')
      expect(next.stamps).toHaveLength(0)
    })
  })

  describe('stampsForPlay', () => {
    it('filters by playId and sorts by createdAt asc', () => {
      const state: PlaybookState = {
        v: 1,
        stamps: [
          { ...sampleStamp, id: 'b', createdAt: '2024-04-01T00:00:00.000Z' },
          { ...sampleStamp, id: 'a', createdAt: '2024-03-01T00:00:00.000Z' },
          { ...sampleStamp, id: 'c', playId: 'macbeth', createdAt: '2024-03-15T00:00:00.000Z' },
        ],
      }
      const out = stampsForPlay(state, 'hamlet')
      expect(out.map((s) => s.id)).toEqual(['a', 'b'])
    })
  })

  describe('stampedPlayIds', () => {
    it('returns the unique set of plays with at least one stamp', () => {
      const state: PlaybookState = {
        v: 1,
        stamps: [
          { ...sampleStamp, id: '1', playId: 'hamlet' },
          { ...sampleStamp, id: '2', playId: 'hamlet' },
          { ...sampleStamp, id: '3', playId: 'macbeth' },
        ],
      }
      expect(stampedPlayIds(state)).toEqual(new Set(['hamlet', 'macbeth']))
    })
  })
})
