'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PLAYS } from '@/lib/plays'
import type { PlayGenre } from '@/types/play'
import { usePlaybook } from '@/hooks/usePlaybook'

const GENRE_ORDER: { key: PlayGenre; label: string }[] = [
  { key: 'tragedy', label: 'TRAGEDIES' },
  { key: 'comedy', label: 'COMEDIES' },
  { key: 'history', label: 'HISTORIES' },
  { key: 'romance', label: 'ROMANCES' },
  { key: 'apocrypha', label: 'APOCRYPHA' },
]

export function IndexSheet({
  open,
  onClose,
  currentPlayId,
}: {
  open: boolean
  onClose: () => void
  currentPlayId?: string
}) {
  const { stamps } = usePlaybook()

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const stampCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of stamps) counts[s.playId] = (counts[s.playId] ?? 0) + 1
    return counts
  }, [stamps])
  const attestedTotal = Object.keys(stampCounts).length

  if (!open) return null

  const groups = GENRE_ORDER.map(({ key, label }) => ({
    label,
    plays: PLAYS.filter((p) => p.genre === key).sort((a, b) => a.pageNumber - b.pageNumber),
  })).filter((g) => g.plays.length > 0)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Index"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        aria-label="Close index"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      />
      <div
        className="page"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '20px 20px 24px',
          borderTop: '2px solid var(--ink)',
          animation: 'sheet-in 220ms ease-out',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: 10,
            borderBottom: '1px solid var(--ink)',
            marginBottom: 14,
          }}
        >
          <div>
            <div className="mono-tiny" style={{ fontSize: 8 }}>
              SHAKESPEARE PLAYBOOK · {String(attestedTotal).padStart(2, '0')}/{PLAYS.length}{' '}
              ATTESTED
            </div>
            <div className="play-title" style={{ fontSize: 22, marginTop: 2, lineHeight: 1 }}>
              The Index
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mono-cap"
            aria-label="Close"
            style={{
              background: 'transparent',
              border: '1px solid var(--ink-faint)',
              padding: '4px 10px',
              color: 'var(--ink)',
              cursor: 'pointer',
              fontSize: 9,
            }}
          >
            CLOSE
          </button>
        </header>

        {groups.map((group) => (
          <section key={group.label} style={{ marginBottom: 18 }}>
            <h3
              className="mono-cap"
              style={{
                fontSize: 9,
                color: 'var(--vermilion)',
                margin: '0 0 6px',
                paddingBottom: 4,
                borderBottom: '1px dotted var(--ink-faint)',
              }}
            >
              {group.label} · {String(group.plays.length).padStart(2, '0')}
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {group.plays.map((play) => {
                const active = play.id === currentPlayId
                const count = stampCounts[play.id] ?? 0
                const attested = count > 0
                return (
                  <li key={play.id}>
                    <Link
                      href={`/play/${play.id}`}
                      onClick={onClose}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        alignItems: 'baseline',
                        gap: 10,
                        padding: '7px 0',
                        borderBottom: '1px dotted var(--ink-hair)',
                        textDecoration: 'none',
                        color: 'var(--ink)',
                        opacity: active ? 1 : 0.92,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 12,
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono), monospace',
                          fontSize: 11,
                          color: attested ? 'var(--vermilion)' : 'var(--ink-faint)',
                          lineHeight: 1,
                        }}
                      >
                        {attested ? '◉' : '○'}
                      </span>
                      <span
                        className="play-title"
                        style={{
                          fontSize: 18,
                          lineHeight: 1.05,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        {play.title}
                        {active && (
                          <span
                            className="mono-tiny"
                            style={{
                              marginLeft: 8,
                              color: 'var(--vermilion)',
                              fontSize: 7,
                            }}
                          >
                            ← HERE
                          </span>
                        )}
                      </span>
                      <span
                        className="f-mono"
                        style={{
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          color: 'var(--ink-soft)',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {play.serial}
                        <br />
                        {attested
                          ? `${String(count).padStart(2, '0')} VIEWING${count > 1 ? 'S' : ''}`
                          : `PAGE ${String(play.pageNumber).padStart(2, '0')} / 39`}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <footer
          className="mono-tiny"
          style={{
            borderTop: '1px solid var(--ink-faint)',
            paddingTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 7.5,
          }}
        >
          <span>FIRST FOLIO ED. · XXXIX PLAYS</span>
          <span style={{ color: 'var(--vermilion)' }}>★ HOLDER PROPERTY ★</span>
        </footer>
      </div>

      <style jsx>{`
        @keyframes sheet-in {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
