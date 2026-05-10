import { notFound } from 'next/navigation'
import { PLAYS, getPlay } from '@/lib/plays'
import { PageRunner } from '@/components/passport/PageRunner'
import { GenreStripe } from '@/components/passport/GenreStripe'
import { PlayPlate } from '@/components/passport/PlayPlate'
import { SpecBlock } from '@/components/passport/SpecBlock'
import { AnnotQuotes } from '@/components/passport/AnnotQuotes'
import { StampAwaiting } from '@/components/passport/Stamp'

export function generateStaticParams() {
  return PLAYS.map((play) => ({ id: play.id }))
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const play = getPlay(params.id)
  if (!play) notFound()

  // v1: every play renders unstamped. Step 2 derives mode from real stamps.
  const mode = 'unstamped' as const

  return (
    <div className="page" style={{ padding: '18px 20px 14px', position: 'relative' }}>
      <PageRunner page={play.pageNumber} />
      <div className="chrome-line thin" style={{ marginTop: 6 }} />

      <div style={{ paddingTop: 10 }}>
        <GenreStripe genre={play.genre} />
      </div>

      <div
        className="mono-tiny"
        style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}
      >
        <span>SERIAL · {play.serial}</span>
        <span>FOLIO ENTRY · {String(play.pageNumber).padStart(2, '0')}/39</span>
      </div>

      <h1
        className="play-title"
        style={{
          fontSize: play.title.length > 18 ? 38 : 46,
          margin: '12px 0 0',
        }}
      >
        {play.title}
      </h1>
      <div className="play-sub" style={{ fontSize: 16, marginTop: 2 }}>
        {play.subtitle}
      </div>

      <div
        style={{
          position: 'relative',
          height: 240,
          margin: '4px -8px 6px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <PlayPlate play={play} />
      </div>

      <div className="dotted" style={{ margin: '2px 0 10px' }} />

      <SpecBlock play={play} />

      <div className="dotted" style={{ margin: '10px 0' }} />

      <AnnotQuotes quotes={play.notableLines} />

      {/* footer status */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
        <div className="dotted" style={{ marginBottom: 6 }} />
        <div className="mono-tiny" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>STATUS · AWAITING INSPECTION</span>
          <span style={{ color: 'var(--vermilion)' }}>NOT YET INSPECTED</span>
        </div>
      </div>

      {mode === 'unstamped' && (
        <div
          style={{
            position: 'absolute',
            top: '52%',
            right: '8%',
            transform: 'rotate(-7deg)',
            pointerEvents: 'none',
          }}
        >
          <StampAwaiting />
        </div>
      )}
    </div>
  )
}
