export type PlayGenre = 'tragedy' | 'comedy' | 'history' | 'romance' | 'apocrypha'

export type Play = {
  id: string
  serial: string
  pageNumber: number
  title: string
  subtitle: string
  genre: PlayGenre
  yearWritten: number
  acts: number
  characterCount: number
  inFirstFolio: boolean
  folioLabel: string
  source: string
  approximateRuntime: number
  notableLines: string[]
  /** Path under /public, e.g. /plates/hamlet.svg. null = not yet commissioned. */
  plate: string | null
  altTitles?: string[]
}
