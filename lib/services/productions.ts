import { prisma } from '../db'
import type { Production, Company, Venue, CanonicalPlay } from '@prisma/client'
import type { NormalizedEvent } from '../normalization/normalize'

export interface CreateProductionData extends Omit<NormalizedEvent, 'sourceConfidence'> {
  companyId: string
  venueId?: string
  sourceConfidence?: number
}

// Type for production with included relations
export type ProductionWithRelations = Production & {
  company: Company
  venue?: Venue | null
}

export async function createProduction(data: CreateProductionData): Promise<Production> {
  return prisma.production.create({
    data: {
      companyId: data.companyId,
      venueId: data.venueId,
      titleRaw: data.titleRaw,
      canonicalPlay: data.canonicalPlay,
      startDate: data.startDate,
      endDate: data.endDate,
      perfDates: data.perfDates ? JSON.stringify(data.perfDates) : undefined,
      eventUrl: data.eventUrl,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      notes: data.notes,
      sourceConfidence: data.sourceConfidence || 0.5,
      status: data.sourceConfidence && data.sourceConfidence > 0.8 ? 'PUBLISHED' : 'REVIEW',
    },
  })
}

export async function findDuplicateProduction(
  companyId: string,
  canonicalPlay: string,
  startDate: Date,
  endDate: Date
): Promise<Production | null> {
  // Find production with overlapping dates for the same company and play
  return prisma.production.findFirst({
    where: {
      companyId,
      canonicalPlay: canonicalPlay as CanonicalPlay,
      AND: [
        {
          OR: [
            // Start date falls within existing production's date range
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } },
              ],
            },
            // End date falls within existing production's date range
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } },
              ],
            },
            // New production completely contains existing production
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } },
              ],
            },
          ],
        },
      ],
    },
  })
}

export async function updateProductionLastSeen(productionId: string): Promise<Production> {
  return prisma.production.update({
    where: { id: productionId },
    data: { lastSeenAt: new Date() },
  })
}

export async function createOrUpdateProduction(
  data: CreateProductionData
): Promise<{ production: Production; isNew: boolean }> {
  // Check for duplicates
  const existing = await findDuplicateProduction(
    data.companyId,
    data.canonicalPlay,
    data.startDate,
    data.endDate
  )

  if (existing) {
    // Update last seen timestamp
    const production = await updateProductionLastSeen(existing.id)
    return { production, isNew: false }
  } else {
    // Create new production
    const production = await createProduction(data)
    return { production, isNew: true }
  }
}

export async function getProductionsByStatus(status: 'PUBLISHED' | 'REVIEW' | 'ARCHIVED') {
  return prisma.production.findMany({
    where: { status },
    include: {
      company: true,
      venue: true,
    },
    orderBy: { startDate: 'asc' },
  })
}

export async function getProductionsForReview() {
  return prisma.production.findMany({
    where: { status: 'REVIEW' },
    include: {
      company: true,
      venue: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function approveProduction(productionId: string) {
  return prisma.production.update({
    where: { id: productionId },
    data: { status: 'PUBLISHED' },
  })
}

export async function archiveProduction(productionId: string) {
  return prisma.production.update({
    where: { id: productionId },
    data: { status: 'ARCHIVED' },
  })
}

export async function updateProduction(
  productionId: string,
  data: {
    titleRaw?: string
    canonicalPlay?: CanonicalPlay
    startDate?: Date
    endDate?: Date
    perfDates?: any
    eventUrl?: string
    priceMin?: number
    priceMax?: number
    notes?: string
    sourceConfidence?: number
    status?: 'PUBLISHED' | 'REVIEW' | 'ARCHIVED'
  }
) {
  return prisma.production.update({
    where: { id: productionId },
    data,
  })
}

export interface ProductionFilters {
  play?: string
  companyId?: string
  q?: string
  near?: { lat: number; lng: number; radius: number }
  start?: Date
  end?: Date
  status?: 'PUBLISHED' | 'REVIEW' | 'ARCHIVED'
}

export async function searchProductions(
  filters: ProductionFilters,
  limit = 20,
  cursor?: string
): Promise<{
  productions: ProductionWithRelations[]
  nextCursor: string | null
  hasMore: boolean
}> {
  const where: any = {}

  if (filters.play) {
    where.canonicalPlay = filters.play
  }

  if (filters.companyId) {
    where.companyId = filters.companyId
  }

  if (filters.status) {
    where.status = filters.status
  } else {
    where.status = 'PUBLISHED' // Default to published only
  }

  if (filters.q) {
    where.OR = [
      { titleRaw: { contains: filters.q, mode: 'insensitive' } },
      { company: { name: { contains: filters.q, mode: 'insensitive' } } },
      { company: { city: { contains: filters.q, mode: 'insensitive' } } },
    ]
  }

  if (filters.start || filters.end) {
    where.AND = where.AND || []
    
    if (filters.start) {
      where.AND.push({ endDate: { gte: filters.start } })
    }
    
    if (filters.end) {
      where.AND.push({ startDate: { lte: filters.end } })
    }
  }

  const queryOptions: any = {
    where,
    include: {
      company: true,
      venue: true,
    },
    orderBy: { startDate: 'asc' },
    take: limit + 1, // Take one extra to check if there are more
  }

  if (cursor) {
    queryOptions.cursor = { id: cursor }
    queryOptions.skip = 1
  }

  const productions = await prisma.production.findMany(queryOptions) as ProductionWithRelations[]
  
  const hasMore = productions.length > limit
  if (hasMore) {
    productions.pop()
  }

  const nextCursor = hasMore ? productions[productions.length - 1]?.id : null

  return {
    productions,
    nextCursor,
    hasMore,
  }
}

// "What's playing where" – group upcoming published productions by company
export async function getUpcomingProductionsGroupedByCompany() {
  const today = new Date()
  const productions = await prisma.production.findMany({
    where: {
      status: 'PUBLISHED',
      endDate: { gte: today },
    },
    include: { company: true, venue: true },
    orderBy: [{ company: { name: 'asc' } }, { startDate: 'asc' }],
  }) as ProductionWithRelations[]

  const grouped: Record<string, { company: Company; productions: ProductionWithRelations[] }> = {}
  for (const p of productions) {
    if (!grouped[p.companyId]) {
      grouped[p.companyId] = { company: p.company, productions: [] }
    }
    grouped[p.companyId].productions.push(p)
  }
  return Object.values(grouped)
}

// "Where's playing what" – counts of upcoming productions per play
export async function getUpcomingPlayCounts() {
  const today = new Date()
  const counts = await prisma.production.groupBy({
    by: ['canonicalPlay'],
    where: { status: 'PUBLISHED', endDate: { gte: today } },
    _count: { _all: true },
  })
  // Sort in JS since Prisma aggregation orderBy on _all may not be supported
  return counts.sort((a, b) => (b._count._all - a._count._all))
}

// Productions for a single play (upcoming)
export async function getUpcomingProductionsByPlay(play: string) {
  const today = new Date()
  return prisma.production.findMany({
  where: { status: 'PUBLISHED', canonicalPlay: play as any, endDate: { gte: today } },
    include: { company: true, venue: true },
    orderBy: { startDate: 'asc' },
  }) as Promise<ProductionWithRelations[]>
}
