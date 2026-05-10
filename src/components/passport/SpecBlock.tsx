import type { Play } from '@/types/play'
import { formatRuntime } from '@/lib/plays'

export function SpecBlock({ play }: { play: Play }) {
  return (
    <div className="spec">
      <Row k="Year writ.">{play.yearWritten}</Row>
      <Row k="Acts">{play.acts} · sc. variable</Row>
      <Row k="Cast">{play.characterCount} speaking parts</Row>
      <Row k="Runtime">≈ {formatRuntime(play.approximateRuntime)} (uncut)</Row>
      <Row k="Folio">{play.folioLabel}</Row>
      <Row k="Source">{play.source}</Row>
    </div>
  )
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{children}</span>
    </div>
  )
}
