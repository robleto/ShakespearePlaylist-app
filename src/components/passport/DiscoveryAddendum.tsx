import type { Production } from '@/types/production'
import { formatRun } from '@/lib/format'

type Props = {
  productions: Production[]
}

export function DiscoveryAddendum({ productions }: Props) {
  const empty = productions.length === 0
  return (
    <div className="addendum">
      <div className="addendum-title">
        <span>In Performance</span>
        {empty ? (
          <span className="badge">NIL</span>
        ) : (
          <span className="badge">{String(productions.length).padStart(2, '0')} ON STAGE</span>
        )}
      </div>
      {empty ? (
        <div
          className="mono-tiny"
          style={{ paddingTop: 4, paddingBottom: 2, letterSpacing: '0.22em' }}
        >
          NO PRODUCTIONS ON RECORD
        </div>
      ) : (
        productions.map((p, i) => (
          <div key={`${p.playId}-${i}`} className="prod">
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <div style={{ minWidth: 0 }}>
              <div className="head">{p.productionCompany}</div>
              <div className="city">
                {p.venue} · {p.city}
              </div>
              {p.note ? <div className="note">{p.note}</div> : null}
              <div className="run" style={{ marginTop: 4 }}>
                {formatRun(p.startDate, p.endDate)}
              </div>
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-tiny"
              style={{
                color: 'var(--vermilion)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                alignSelf: 'start',
                paddingTop: 2,
              }}
              aria-label={`${p.productionCompany} listing`}
            >
              LISTING →
            </a>
          </div>
        ))
      )}
    </div>
  )
}
