import Link from 'next/link'
import { PLAYS } from '@/lib/plays'
import { PlaybookSeal } from '@/components/passport/PlaybookSeal'

const HOLDER = {
  name: 'Greg Robleto',
  id: 'PB·0042·MD',
  issued: '08·MAY·2026',
  hometheatre: 'FOLGER · WASHINGTON DC',
  seen: 0,
  total: PLAYS.length,
}

export default function CoverPage() {
  const firstPlay = PLAYS[0]
  return (
    <div
      className="page"
      style={{
        padding: '18px 16px 30px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* top frame */}
      <div className="chrome-line" style={{ borderTopWidth: 2 }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '7px 0',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <span className="mono-tiny" style={{ fontSize: 7 }}>
          SP · ENT.GOV
        </span>
        <span className="mono-tiny" style={{ fontSize: 7 }}>
          FIRST FOLIO ED.
        </span>
        <span className="mono-tiny" style={{ fontSize: 7 }}>
          XXXIX · 1 HOLDER
        </span>
      </div>
      <div className="chrome-line thin" />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '10px 0',
          minWidth: 0,
        }}
      >
        <div
          className="mono-cap"
          style={{
            color: 'var(--ink-soft)',
            marginBottom: 12,
            fontSize: 8,
            letterSpacing: '.28em',
          }}
        >
          · PASSPORT OF VIEWING ·
        </div>

        <h1 className="play-title" style={{ fontSize: 46, lineHeight: 0.9, margin: 0 }}>
          Shakespeare
          <br />
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Playbook</span>
        </h1>
        <div className="play-sub" style={{ fontSize: 13, marginTop: 6, padding: '0 12px' }}>
          An Inventory of Productions Attended Live
        </div>

        <div style={{ margin: '20px 0 14px' }}>
          <PlaybookSeal size={120} />
        </div>

        <div
          className="mono-cap"
          style={{
            fontSize: 8.5,
            letterSpacing: '.28em',
            borderTop: '1px solid var(--ink)',
            borderBottom: '1px solid var(--ink)',
            padding: '5px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          FIRST FOLIO EDITION · XXXIX PLAYS
        </div>

        <div
          className="mono-tiny"
          style={{
            marginTop: 8,
            color: 'var(--ink-soft)',
            fontSize: 7,
            letterSpacing: '.2em',
            padding: '0 6px',
            lineHeight: 1.5,
          }}
        >
          AFTER MR. WILLIAM SHAKESPEARES
          <br />
          COMEDIES, HISTORIES &amp; TRAGEDIES
          <br />· LONDON · ANNO MDCXXIII ·
        </div>
      </div>

      {/* holder block */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '8px 10px',
          padding: '9px 0',
          borderTop: '1px solid var(--ink)',
          borderBottom: '1px solid var(--ink)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="mono-tiny" style={{ fontSize: 7 }}>
            ISSUED BY · HOLDER (SELF)
          </div>
          <div
            className="play-title"
            style={{
              fontSize: 18,
              margin: '2px 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {HOLDER.name}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div className="mono-tiny" style={{ fontSize: 7 }}>
            HOLDER ID
          </div>
          <div className="f-mono" style={{ fontSize: 13, marginTop: 2 }}>
            {HOLDER.id}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mono-tiny" style={{ fontSize: 7 }}>
            ISSUED
          </div>
          <div className="f-mono" style={{ fontSize: 11, marginTop: 2 }}>
            {HOLDER.issued}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div className="mono-tiny" style={{ fontSize: 7 }}>
            HOME HOUSE
          </div>
          <div
            className="f-mono"
            style={{
              fontSize: 9.5,
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {HOLDER.hometheatre}
          </div>
        </div>
      </div>

      {/* footer line */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 0 0',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <span className="mono-tiny" style={{ fontSize: 7 }}>
          PROGRESS · {String(HOLDER.seen).padStart(2, '0')}/{HOLDER.total}
        </span>
        <Link
          href={`/play/${firstPlay.id}`}
          className="mono-tiny"
          style={{ color: 'var(--vermilion)', fontSize: 7, textDecoration: 'none' }}
        >
          ★ HOLDER PROPERTY ★ →
        </Link>
      </div>
    </div>
  )
}
