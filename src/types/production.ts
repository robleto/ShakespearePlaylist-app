export type Production = {
  playId: string
  productionCompany: string
  venue: string
  city: string
  startDate: string
  endDate: string
  url: string
  lastVerified: string
}

export type ProductionsFile = {
  productions: Production[]
  lastPublished: string | null
}
