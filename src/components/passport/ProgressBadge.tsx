'use client'

import { usePlaybook } from '@/hooks/usePlaybook'

export function ProgressBadge({ total }: { total: number }) {
  const { stamps } = usePlaybook()
  const attested = new Set(stamps.map((s) => s.playId)).size
  return (
    <span className="mono-tiny" style={{ fontSize: 7 }}>
      PROGRESS · {String(attested).padStart(2, '0')}/{total}
    </span>
  )
}
