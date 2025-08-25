import { expect, test } from 'vitest'
import { normalizeTitle, normalizeDates } from '../lib/normalization/normalize'
import { CanonicalPlay } from '../lib/normalization/plays'

test('normalizeTitle should match common aliases', () => {
  expect(normalizeTitle('Romeo & Juliet').play).toBe(CanonicalPlay.ROMEO_AND_JULIET)
  expect(normalizeTitle('R&J').play).toBe(CanonicalPlay.ROMEO_AND_JULIET)
  expect(normalizeTitle('The Scottish Play').play).toBe(CanonicalPlay.MACBETH)
  expect(normalizeTitle('12th Night').play).toBe(CanonicalPlay.TWELFTH_NIGHT)
  expect(normalizeTitle('Midsummer').play).toBe(CanonicalPlay.MIDSUMMER_NIGHT_S_DREAM)
})

test('normalizeTitle should handle direct play names', () => {
  expect(normalizeTitle('Hamlet').play).toBe(CanonicalPlay.HAMLET)
  expect(normalizeTitle('Macbeth').play).toBe(CanonicalPlay.MACBETH)
  expect(normalizeTitle('Othello').play).toBe(CanonicalPlay.OTHELLO)
})

test('normalizeDates should parse date ranges', () => {
  const { startDate, endDate } = normalizeDates('2024-01-15', '2024-01-20')
  expect(startDate.getDate()).toBe(15)
  expect(endDate.getDate()).toBe(20)
})

test('normalizeDates should handle single dates', () => {
  const { startDate, endDate } = normalizeDates('2024-01-15')
  expect(startDate.getDate()).toBe(15)
  expect(endDate.getDate()).toBe(15)
})
