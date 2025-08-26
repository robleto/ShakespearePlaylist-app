import type { Production, Company, Venue, Source } from '@prisma/client'

export type ProductionWithCompany = Production & { company: Company; venue?: Venue | null }
export type SourceWithCompany = Source & { company: Company }

// Admin view models
export interface ReviewQueueItem extends ProductionWithCompany {
  // Extend later with computed fields (e.g., durationDays, isExpiringSoon)
}
