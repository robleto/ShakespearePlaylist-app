export type Production = {
  playId: string
  productionCompany: string
  venue: string
  city: string
  /** ISO date, e.g. "2026-06-04" */
  startDate: string
  /** ISO date, e.g. "2026-07-12" */
  endDate: string
  /** Public listing URL */
  url: string
  /** ISO date when an editor last confirmed the listing is accurate */
  lastVerified: string
  /** Optional editorial annotation, italicized below the venue */
  note?: string
}

export type ProductionsFile = {
  productions: Production[]
  /** ISO timestamp the static file was last regenerated; null = never published */
  lastPublished: string | null
}
