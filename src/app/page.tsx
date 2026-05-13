import Link from 'next/link'
import { PLAYS } from '@/lib/plays'
import { HOLDER } from '@/lib/holder'
import { PlaybookSeal } from '@/components/passport/PlaybookSeal'
import { ProgressBadge } from '@/components/passport/ProgressBadge'

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

        <div style={{ margin: '20px 0 18px' }}>
          <PlaybookSeal size={120} />
        </div>

        <div
          className="mono-tiny"
          style={{
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

        <div
          className="play-sub"
          style={{
            fontSize: 11,
            marginTop: 18,
            padding: '0 18px',
            lineHeight: 1.4,
            color: 'var(--ink-soft)',
          }}
        >
          A page is attested when its play has been seen in performance.
          <br />
          The completed book is the artifact.
        </div>
      </div>

      {/* holder block */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
          padding: '10px 0',
          borderTop: '1px solid var(--ink)',
          borderBottom: '1px solid var(--ink)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="mono-tiny" style={{ fontSize: 7 }}>
            HOLDER
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
            ISSUED
          </div>
          <div className="f-mono" style={{ fontSize: 11, marginTop: 2 }}>
            {HOLDER.issued}
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
        <ProgressBadge total={PLAYS.length} />
        <Link
          href={`/play/${firstPlay.id}`}
          className="mono-cap"
          style={{
            color: 'var(--vermilion)',
            fontSize: 9,
            letterSpacing: '.22em',
            textDecoration: 'none',
          }}
        >
          OPEN BOOK →
        </Link>
      </div>
    </div>
  )
}
