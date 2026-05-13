export type StampSource = 'manual' | 'ai-chat'

export type Stamp = {
  id: string
  playId: string
  /** Year minimum; partial dates allowed. One of: "YYYY", "YYYY-MM", "YYYY-MM-DD". */
  date: string
  productionCompany: string
  venue: string
  city: string
  director?: string
  leadActor?: string
  notes?: string
  createdAt: string
  source: StampSource
}

export type StampDraft = Omit<Stamp, 'id' | 'createdAt'>
