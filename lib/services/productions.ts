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
  company: Company & { slug?: string | null }
  venue?: Venue | null
}

export async function createProduction(data: CreateProductionData): Promise<Production> {
  const autoPublish = (data.sourceConfidence || 0) >= 0.85
  const titleDecoded = decodeHtmlEntities(data.titleRaw)
  return prisma.production.create({
    data: {
      companyId: data.companyId,
      venueId: data.venueId,
      titleRaw: titleDecoded,
      canonicalPlay: data.canonicalPlay,
      startDate: data.startDate,
      endDate: data.endDate,
      perfDates: data.perfDates ? JSON.stringify(data.perfDates) : undefined,
      eventUrl: data.eventUrl,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      notes: data.notes,
      sourceConfidence: data.sourceConfidence || 0.5,
      status: autoPublish ? 'PUBLISHED' : 'REVIEW',
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
  // Skip clearly non-Shakespeare items
  if (data.canonicalPlay === 'OTHER') {
    throw new Error('Non-Shakespeare production skipped')
  }
  // Enforce confidence threshold (default to REVIEW discard if below)
  if ((data.sourceConfidence || 0) < 0.7) {
    throw new Error('Low-confidence match skipped (<0.7)')
  }
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

// Aggregated review items: group REVIEW rows by (company, canonicalPlay)
export async function getAggregatedReviewGroups() {
  const rows = await prisma.production.findMany({
    where: { status: 'REVIEW' },
    include: { company: { include: { sources: true } } },
    orderBy: { createdAt: 'desc' },
  })
  interface Group { companyId: string; company: Company & { sources?: any[] }; canonicalPlay: string; startDate: Date; endDate: Date; count: number; ids: string[]; sampleTitles: string[]; maxConfidence: number; minConfidence: number }
  const map = new Map<string, Group>()
  for (const r of rows) {
    const key = r.companyId + '::' + r.canonicalPlay
    const g = map.get(key)
    if (g) {
      g.startDate = r.startDate < g.startDate ? r.startDate : g.startDate
      g.endDate = r.endDate > g.endDate ? r.endDate : g.endDate
      g.count += 1
      g.ids.push(r.id)
      if (g.sampleTitles.length < 3 && r.titleRaw) g.sampleTitles.push(r.titleRaw.slice(0,160))
      g.maxConfidence = Math.max(g.maxConfidence, r.sourceConfidence)
      g.minConfidence = Math.min(g.minConfidence, r.sourceConfidence)
    } else {
      map.set(key, { companyId: r.companyId, company: r.company, canonicalPlay: r.canonicalPlay, startDate: r.startDate, endDate: r.endDate, count: 1, ids: [r.id], sampleTitles: r.titleRaw ? [r.titleRaw.slice(0,160)] : [], maxConfidence: r.sourceConfidence, minConfidence: r.sourceConfidence })
    }
  }
  return Array.from(map.values()).sort((a,b)=> a.company.name.localeCompare(b.company.name) || a.canonicalPlay.localeCompare(b.canonicalPlay))
}

export async function approveReviewGroup(companyId: string, canonicalPlay: string) {
  return prisma.production.updateMany({ where: { companyId, canonicalPlay: canonicalPlay as any, status: 'REVIEW' }, data: { status: 'PUBLISHED' } })
}

// "Reject" uses ARCHIVED for now (semantic rejection)
export async function rejectReviewGroup(companyId: string, canonicalPlay: string) {
  return prisma.production.updateMany({ where: { companyId, canonicalPlay: canonicalPlay as any, status: 'REVIEW' }, data: { status: 'ARCHIVED' } })
}

export async function updateReviewGroupDates(companyId: string, canonicalPlay: string, startDate: Date, endDate: Date) {
  // Only adjust REVIEW rows (published edits could be a future enhancement)
  return prisma.production.updateMany({
    where: { companyId, canonicalPlay: canonicalPlay as any, status: 'REVIEW' },
    data: { startDate, endDate }
  })
}

export async function revertGroupStatus(companyId: string, canonicalPlay: string, fromStatus: 'PUBLISHED' | 'ARCHIVED') {
  // Revert rows that were just approved/rejected back to REVIEW within undo window
  return prisma.production.updateMany({
    where: { companyId, canonicalPlay: canonicalPlay as any, status: fromStatus },
    data: { status: 'REVIEW' }
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
  NOT: { canonicalPlay: 'OTHER' },
    },
  // @ts-ignore slug added via recent migration; ignore until prisma generate runs
  include: { company: { select: { id: true, name: true, slug: true, city: true, region: true, country: true, website: true, createdAt: true, updatedAt: true, lat: true, lng: true } }, venue: true },
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
  // We want distinct companies per play (one production per company counts once)
  const rows = await prisma.production.findMany({
    where: { status: 'PUBLISHED', endDate: { gte: today }, NOT: { canonicalPlay: 'OTHER' } },
    select: { canonicalPlay: true, companyId: true },
  })
  const map = new Map<string, Set<string>>()
  for (const r of rows) {
    if (!map.has(r.canonicalPlay)) map.set(r.canonicalPlay, new Set())
    map.get(r.canonicalPlay)!.add(r.companyId)
  }
  const counts = Array.from(map.entries()).map(([canonicalPlay, set]) => ({ canonicalPlay, count: set.size }))
  counts.sort((a, b) => b.count - a.count)
  return counts
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

// Coverage + freshness info for admin view
export async function getScrapeCoverage() {
  const companies = await prisma.company.findMany({
    include: {
      sources: true,
      productions: { select: { id: true, canonicalPlay: true, status: true, startDate: true, endDate: true } },
    },
    orderBy: { name: 'asc' },
  })
  const today = new Date()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const coverage = companies.map(c => {
    const published = c.productions.filter(p => p.status === 'PUBLISHED' && p.endDate >= today)
    const playsDistinct = new Set(published.map(p => p.canonicalPlay))
    const lastRunAt = c.sources.map(s => s.lastRunAt).filter(Boolean).sort((a,b)=>b!.getTime()-a!.getTime())[0] || null
    const stale = !lastRunAt || (Date.now() - lastRunAt.getTime()) > sevenDaysMs
    return {
      // @ts-ignore slug field added by migration; ignore until Prisma client regen
      company: { id: c.id, name: c.name, slug: c.slug },
      sourceCount: c.sources.length,
      publishedCount: published.length,
      distinctPlays: playsDistinct.size,
      plays: Array.from(playsDistinct),
      lastRunAt,
      lastStatus: c.sources.map(s => s.lastStatus).filter(Boolean).slice(-1)[0] || null,
      stale,
    }
  })
  return coverage
}

// Regression helper: decide new status string given prior and current counts
export function computeRegressionStatus(previousPublished: number, currentPublished: number, baseStatus: string) {
  if (previousPublished > 0 && currentPublished === 0) {
    return `REGRESSION: 0 vs ${previousPublished}`
  }
  return baseStatus
}

// Aggregate upcoming Shakespeare productions: one row per (company, play)
export interface AggregatedProduction {
  companyId: string
  company: Company & { slug?: string | null }
  canonicalPlay: string
  title: string
  startDate: Date
  endDate: Date
  productionCount: number // number of underlying production rows merged
  underlyingIds: string[]
  verboseRejected?: boolean
}

export interface AggregationFilters {
  play?: string
  companyId?: string
  hideStale?: boolean
  staleDays?: number
}

export async function getAggregatedUpcomingProductions(filters: AggregationFilters = {}): Promise<AggregatedProduction[]> {
  const today = new Date()
  const productions = await prisma.production.findMany({
    where: {
      status: 'PUBLISHED',
      endDate: { gte: today },
      canonicalPlay: { not: 'OTHER' },
      ...(filters.play ? { canonicalPlay: filters.play as any } : {}),
      ...(filters.companyId ? { companyId: filters.companyId } : {}),
    },
    include: {
      // @ts-ignore slug added by migration
      company: { include: { sources: true } },
    },
    orderBy: { startDate: 'asc' },
  }) as (ProductionWithRelations & { company: Company & { slug?: string | null, sources: any[] } })[]

  const staleThresholdMs = (filters.staleDays ?? 14) * 24 * 60 * 60 * 1000
  const byKey = new Map<string, AggregatedProduction>()
  const hasCleanTitle = new Set<string>()

  for (const p of productions) {
    if (filters.hideStale) {
      const lastRun = p.company.sources.map((s:any)=>s.lastRunAt).filter(Boolean).sort((a:Date,b:Date)=>b.getTime()-a.getTime())[0]
      if (!lastRun || (Date.now() - new Date(lastRun).getTime()) > staleThresholdMs) {
        continue
      }
    }
    const key = `${p.companyId}::${p.canonicalPlay}`
    const existing = byKey.get(key)
  const candidateClean = chooseBetterTitle(existing?.title, p.titleRaw)
  const verboseRejected: boolean = !!(!candidateClean && p.titleRaw && p.titleRaw.trim().length > 70) // heuristic
    if (existing) {
      existing.startDate = p.startDate < existing.startDate ? p.startDate : existing.startDate
      existing.endDate = p.endDate > existing.endDate ? p.endDate : existing.endDate
      existing.productionCount += 1
      if (candidateClean) existing.title = candidateClean
      if (verboseRejected) existing.verboseRejected = true
      existing.underlyingIds.push(p.id)
    } else {
      byKey.set(key, {
        companyId: p.companyId,
        company: p.company,
        canonicalPlay: p.canonicalPlay,
        title: candidateClean,
        startDate: p.startDate,
        endDate: p.endDate,
        productionCount: 1,
        underlyingIds: [p.id],
        verboseRejected,
      })
    }
    if (candidateClean) hasCleanTitle.add(key)
  }
  // Filter out aggregated rows that ONLY had verbose/garbage titles and never yielded a clean canonical-like title
  const filtered = Array.from(byKey.entries())
    .filter(([key, row]) => !(row.verboseRejected && !hasCleanTitle.has(key)))
    .map(([_, row]) => row)

  return filtered.sort((a,b)=> a.company.name.localeCompare(b.company.name) || a.startDate.getTime()-b.startDate.getTime())
}

function chooseBetterTitle(a?: string, b?: string): string {
  const pick = (t?: string) => {
    if (!t) return ''
    const trimmed = decodeHtmlEntities(t).trim()
  // Drop obvious non-production / garbage patterns (auditions, classes, workshops, camps, registrations)
  const lower = trimmed.toLowerCase()
  if (/(audition|workshop|class|camp|intensive|registration|signup|acting\s+class)/i.test(lower)) return ''
  // Reject overly long or verbose description-like titles
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length
  if (trimmed.length > 70 || wordCount > 10) return ''
  // Reject if contains sentence punctuation suggesting a paragraph
  if (/[.!?].+\s/.test(trimmed)) return ''
  if (trimmed.includes('\n')) return ''
    // Reject if mostly non-word characters
    const wordChars = trimmed.replace(/[^A-Za-z0-9]/g,'').length
    if (wordChars < trimmed.length * 0.4) return ''
    return trimmed
  }
  const ca = pick(a)
  const cb = pick(b)
  if (ca && cb) {
    // Prefer shorter (likely canonical) title
    return ca.length <= cb.length ? ca : cb
  }
  return ca || cb || a || b || ''
}

// Basic HTML entity decoding (covers numeric and common named entities we expect)
function decodeHtmlEntities(str: string): string {
  if (!str) return str
  return str
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g,'"')
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
}

// Aggregated and grouped by company helper used for public grouped view
export async function getAggregatedUpcomingProductionsGroupedByCompany(filters: AggregationFilters = {}) {
  const list = await getAggregatedUpcomingProductions(filters)
  const map: Record<string, { company: AggregatedProduction['company']; rows: AggregatedProduction[] }> = {}
  for (const row of list) {
    if (!map[row.companyId]) map[row.companyId] = { company: row.company, rows: [] }
    map[row.companyId].rows.push(row)
  }
  return Object.values(map).sort((a,b)=> a.company.name.localeCompare(b.company.name))
}
