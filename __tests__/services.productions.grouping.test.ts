import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('../lib/db', () => {
  return {
    prisma: {
      production: {
        findMany: vi.fn(),
        groupBy: vi.fn(),
      },
    },
  }
})

import { getUpcomingProductionsGroupedByCompany, getUpcomingPlayCounts, getUpcomingProductionsByPlay } from '../lib/services/productions'
import { PLAY_TITLES } from '../lib/normalization/plays'
import { prisma } from '../lib/db'

describe('productions service grouping', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('groups upcoming productions by company', async () => {
    const now = new Date()
    ;(prisma.production.findMany as any).mockResolvedValue([
      { id: '1', companyId: 'c1', company: { id: 'c1', name: 'Alpha', city: 'CityA', region: 'AA' }, titleRaw: 'Hamlet', canonicalPlay: Object.keys(PLAY_TITLES)[0], startDate: now, endDate: now },
      { id: '2', companyId: 'c1', company: { id: 'c1', name: 'Alpha', city: 'CityA', region: 'AA' }, titleRaw: 'Macbeth', canonicalPlay: Object.keys(PLAY_TITLES)[1], startDate: now, endDate: now },
      { id: '3', companyId: 'c2', company: { id: 'c2', name: 'Beta', city: 'CityB', region: 'BB' }, titleRaw: 'Othello', canonicalPlay: Object.keys(PLAY_TITLES)[2], startDate: now, endDate: now },
    ])
    const grouped = await getUpcomingProductionsGroupedByCompany()
    expect(grouped.length).toBe(2)
    const alpha = grouped.find(g => g.company.id === 'c1')!
    expect(alpha.productions.length).toBe(2)
  })

  it('returns play counts sorted desc', async () => {
    ;(prisma.production.groupBy as any).mockResolvedValue([
      { canonicalPlay: 'HAMLET', _count: { _all: 2 } },
      { canonicalPlay: 'MACBETH', _count: { _all: 5 } },
      { canonicalPlay: 'OTHELLO', _count: { _all: 1 } },
    ])
    const counts = await getUpcomingPlayCounts()
    expect(counts[0].canonicalPlay).toBe('MACBETH')
    expect(counts[counts.length - 1].canonicalPlay).toBe('OTHELLO')
  })

  it('fetches upcoming productions for a play', async () => {
    const now = new Date()
    ;(prisma.production.findMany as any).mockResolvedValue([
      { id: '9', companyId: 'c9', company: { id: 'c9', name: 'Delta', city: 'CityD', region: 'DD' }, titleRaw: 'Hamlet', canonicalPlay: 'HAMLET', startDate: now, endDate: now },
    ])
    const list = await getUpcomingProductionsByPlay('HAMLET')
    expect(list.length).toBe(1)
    expect(list[0].canonicalPlay).toBe('HAMLET')
  })
})
