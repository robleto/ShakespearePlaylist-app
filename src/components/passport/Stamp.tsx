import type { CSSProperties, ReactNode } from 'react'

type Common = {
  rotate?: number
  scale?: number
  ghost?: boolean
  fade?: boolean
}

type CircleProps = Common & {
  company: string
  venue: string
  date: string
  role?: string
}

export function StampCircle({
  company,
  venue,
  date,
  role,
  rotate = 0,
  scale = 1,
  ghost = false,
  fade = false,
}: CircleProps) {
  return (
    <div
      className={`stamp circle ${ghost ? 'ghost' : ''} ${fade ? 'fade' : 'pressed'}`}
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      <div className="lil">★ &nbsp; OFFICIAL VIEWING &nbsp; ★</div>
      <div className="center-mark">{company}</div>
      <div className="lil">{venue}</div>
      <div className="date">{date || 'DATE · UNRECORDED'}</div>
      {role && (
        <div className="lil" style={{ marginTop: 3, opacity: 0.7 }}>
          {role}
        </div>
      )}
    </div>
  )
}

type RectProps = Common & {
  company: string
  venue: string
  date: string
  role?: string
}

export function StampRect({
  company,
  venue,
  date,
  role,
  rotate = 0,
  scale = 1,
  ghost = false,
  fade = false,
}: RectProps) {
  return (
    <div
      className={`stamp rect ${ghost ? 'ghost' : ''} ${fade ? 'fade' : 'pressed'}`}
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      <div className="head">▸ ENTRY · ATTENDED</div>
      <div className="ven">{company}</div>
      <div className="ven" style={{ opacity: 0.85 }}>
        {venue}
      </div>
      <div className="meta">
        <span>{date || '—'}</span>
        <span>{role || 'GEN. ADMISSION'}</span>
      </div>
    </div>
  )
}

type PremiereProps = Common & {
  company: string
  venue: string
  date: string
}

export function StampPremiere({ company, venue, date, rotate = 0, scale = 1 }: PremiereProps) {
  return (
    <div
      className="stamp premiere pressed"
      style={{ transform: `rotate(${rotate}deg) scale(${scale})`, position: 'relative' }}
    >
      <div className="ban">FIRST · VIEWING</div>
      <div className="body">
        <div style={{ fontWeight: 700, letterSpacing: '.18em' }}>{company}</div>
        <div style={{ opacity: 0.8, marginTop: 2 }}>{venue}</div>
        <div style={{ opacity: 0.8, marginTop: 2 }}>{date}</div>
      </div>
    </div>
  )
}

export function StampGhost(props: CircleProps) {
  return <StampCircle {...props} ghost />
}

export function StampAwaiting() {
  return (
    <div className="stamp awaiting">
      AWAITING · INSPECTION
      <div className="sub">NO ENTRY ON RECORD</div>
    </div>
  )
}

export function StampSeenNoData({ rotate = -4, scale = 1 }: Common = {}) {
  return (
    <div
      className="stamp seen-nodata pressed"
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      <div>SEEN</div>
      <div className="lil">DATE · UNDOCUMENTED</div>
      <div className="lil">VENUE · UNDOCUMENTED</div>
    </div>
  )
}

/** Position wrapper used inside .stamp-cluster. */
export function StampSlot({
  top,
  right,
  z,
  children,
}: {
  top?: CSSProperties['top']
  right?: CSSProperties['right']
  z?: number
  children: ReactNode
}) {
  return <div style={{ position: 'absolute', top, right, zIndex: z }}>{children}</div>
}
