'use client'

import { StampAwaiting, StampCircle, StampPremiere, StampRect, StampSeenNoData } from './Stamp'
import type { StampMode, StampRenderData } from '@/lib/stamps'

type Slot = {
  top: string
  right: string
  rotate: number
  scale: number
  z: number
}

const MULTI_SLOTS: Slot[] = [
  { top: '-2%', right: '-4%', rotate: -9, scale: 0.95, z: 3 },
  { top: '40%', right: '8%', rotate: 12, scale: 0.85, z: 2 },
  { top: '10%', right: '40%', rotate: -18, scale: 0.74, z: 1 },
]

export function StampOverlay({
  mode,
  stamps,
  onEdit,
  landingId,
}: {
  mode: StampMode
  stamps: StampRenderData[]
  onEdit: (stampId: string) => void
  /** ID of a stamp that should run the entrance animation. */
  landingId?: string | null
}) {
  if (mode === 'unstamped') {
    return (
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
    )
  }

  if (mode === 'nodata') {
    return (
      <div className="stamp-cluster" style={{ inset: 0 }}>
        <ClickableStamp
          onClick={() => stamps[0] && onEdit(stamps[0].id)}
          style={{ top: '30%', right: '10%' }}
          landing={!!stamps[0] && stamps[0].id === landingId}
        >
          <StampSeenNoData rotate={-6} />
        </ClickableStamp>
      </div>
    )
  }

  if (mode === 'stamped') {
    const s = stamps[0]
    return (
      <div className="stamp-cluster" style={{ inset: 0 }}>
        <ClickableStamp
          onClick={() => onEdit(s.id)}
          style={{ top: '10%', right: '-2%' }}
          landing={s.id === landingId}
        >
          <RenderedStamp s={s} rotate={-9} scale={0.92} />
        </ClickableStamp>
      </div>
    )
  }

  // multi
  return (
    <div className="stamp-cluster" style={{ inset: 0 }}>
      {stamps.map((s, i) => {
        const slot = MULTI_SLOTS[i] ?? MULTI_SLOTS[MULTI_SLOTS.length - 1]
        return (
          <ClickableStamp
            key={s.id}
            onClick={() => onEdit(s.id)}
            style={{ top: slot.top, right: slot.right, zIndex: slot.z }}
            landing={s.id === landingId}
          >
            <RenderedStamp s={s} rotate={slot.rotate} scale={slot.scale} />
          </ClickableStamp>
        )
      })}
    </div>
  )
}

function ClickableStamp({
  onClick,
  style,
  children,
  landing,
}: {
  onClick: () => void
  style?: React.CSSProperties
  children: React.ReactNode
  landing?: boolean
}) {
  return (
    <button
      type="button"
      aria-label="Edit stamp"
      onClick={onClick}
      className={landing ? 'stamp-landing' : undefined}
      style={{
        position: 'absolute',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        pointerEvents: 'auto',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function RenderedStamp({
  s,
  rotate,
  scale,
}: {
  s: StampRenderData
  rotate: number
  scale: number
}) {
  if (s.kind === 'rect') {
    return (
      <StampRect
        company={s.company}
        venue={s.venue}
        date={s.date}
        role={s.role}
        rotate={rotate}
        scale={scale}
      />
    )
  }
  if (s.kind === 'premiere') {
    return (
      <StampPremiere
        company={s.company}
        venue={s.venue}
        date={s.date}
        rotate={rotate}
        scale={scale}
      />
    )
  }
  return (
    <StampCircle
      company={s.company}
      venue={s.venue}
      date={s.date}
      role={s.role}
      rotate={rotate}
      scale={scale}
    />
  )
}
