export type PlayGenre = 'tragedy' | 'comedy' | 'history' | 'romance' | 'apocrypha'

export type Play = {
  id: string
  serial: string
  title: string
  genre: PlayGenre
  yearWritten: number
  acts: number
  characterCount: number
  inFirstFolio: boolean
  source: string
  approximateRuntime: number
  notableLines: string[]
  altTitles?: string[]
}
