'use client'

import { useEffect, useRef, useState } from 'react'
import type { Stamp } from '@/types/stamp'
import type { Play } from '@/types/play'
import type { Production } from '@/types/production'
import { usePlaybook } from '@/hooks/usePlaybook'
import { deriveMode, toRenderData } from '@/lib/stamps'
import { PageRunner } from './PageRunner'
import { PlayPlate } from './PlayPlate'
import { SpecBlock } from './SpecBlock'
import { AnnotQuotes } from './AnnotQuotes'
import { DiscoveryAddendum } from './DiscoveryAddendum'
import { StampOverlay } from './StampOverlay'
import { StampSheet } from './StampSheet'

type SheetMode = { kind: 'new'; playId: string } | { kind: 'edit'; stamp: Stamp } | null

export function PlayPageView({ play, productions }: { play: Play; productions: Production[] }) {
  const { stampsForPlay } = usePlaybook()
  const stamps = stampsForPlay(play.id)
  const mode = deriveMode(stamps)
  const renderStamps = toRenderData(stamps).slice(0, 3)
  const [sheetMode, setSheetMode] = useState<SheetMode>(null)

  // Animate the entrance of a newly-committed stamp exactly once. We
  // diff the stamp ID set against the previous render; any new ID gets
  // marked as `landingId` for the duration of the keyframe animation,
  // then cleared so subsequent renders show the stamp at rest.
  const [landingId, setLandingId] = useState<string | null>(null)
  const seenIds = useRef<Set<string>>(new Set())
  useEffect(() => {
    const ids = stamps.map((s) => s.id)
    let freshId: string | null = null
    for (const id of ids) {
      if (!seenIds.current.has(id)) {
        freshId = id
        break
      }
    }
    seenIds.current = new Set(ids)
    if (freshId) {
      setLandingId(freshId)
      const t = setTimeout(() => setLandingId(null), 360)
      return () => clearTimeout(t)
    }
  }, [stamps])

  function openEdit(stampId: string) {
    const target = stamps.find((s) => s.id === stampId)
    if (target) setSheetMode({ kind: 'edit', stamp: target })
  }

  const statusText =
    mode === 'unstamped'
      ? 'STATUS · AWAITING INSPECTION'
      : mode === 'nodata'
        ? 'STATUS · ATTESTED · UNDOCUMENTED'
        : mode === 'multi'
          ? `STATUS · ATTESTED · ${String(stamps.length).padStart(2, '0')} VIEWINGS`
          : 'STATUS · ATTESTED · 01 VIEWING'

  return (
    <>
      <div
        className="page"
        style={{
          padding: '18px 20px 14px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageRunner page={play.pageNumber} />
        <div className="chrome-line thin" style={{ marginTop: 6 }} />

        <h1
          className="play-title"
          style={{
            fontSize: play.title.length > 18 ? 38 : 46,
            margin: '14px 0 0',
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
          <StampOverlay mode={mode} stamps={renderStamps} onEdit={openEdit} landingId={landingId} />
        </div>

        <div className="dotted" style={{ margin: '2px 0 10px' }} />

        <SpecBlock play={play} />

        <div className="dotted" style={{ margin: '10px 0' }} />

        {/* Whichever block lands here takes whatever vertical space
            remains and scrolls internally if it overflows. Keeps the
            page-as-leaf bounded; user scrolls the section, not the leaf. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          {mode === 'unstamped' && productions.length > 0 ? (
            <DiscoveryAddendum productions={productions} />
          ) : (
            <AnnotQuotes quotes={play.notableLines} refs={play.notableLineRefs} />
          )}
        </div>

        {/* footer status + record affordance — fixed at the bottom of
            the page card via flex flow, not absolute positioning, so
            the scrollable section above never collides with it. */}
        <div style={{ flexShrink: 0, marginTop: 6 }}>
          <div className="dotted" style={{ marginBottom: 6 }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span className="mono-tiny" style={{ flex: 1, minWidth: 0 }}>
              {statusText}
            </span>
            <button
              type="button"
              onClick={() => setSheetMode({ kind: 'new', playId: play.id })}
              className="mono-cap"
              aria-label="Record viewing"
              style={{
                fontSize: 8.5,
                letterSpacing: '0.2em',
                padding: '4px 8px',
                border:
                  mode === 'unstamped'
                    ? '1px dashed var(--vermilion)'
                    : '1px solid var(--ink-faint)',
                color: mode === 'unstamped' ? 'var(--vermilion)' : 'var(--ink)',
                background: 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + RECORD
            </button>
          </div>
        </div>
      </div>

      <StampSheet mode={sheetMode} onClose={() => setSheetMode(null)} />
    </>
  )
}
