import { PLAYS, getPlayByPage } from '@/lib/plays'

const COVER_HREF = '/'

/**
 * Linear book order: cover → page 1 → page 2 … → page 39 → cover.
 * Both directions wrap. Used by SwipeNav and keyboard navigation.
 */
export type Location = { kind: 'cover' } | { kind: 'play'; playId: string }

export function locationFromPlayId(id: string | null): Location {
  return id ? { kind: 'play', playId: id } : { kind: 'cover' }
}

export function locationHref(loc: Location): string {
  return loc.kind === 'cover' ? COVER_HREF : `/play/${loc.playId}`
}

export function nextLocation(current: Location): Location {
  if (current.kind === 'cover') {
    const first = getPlayByPage(1)
    return first ? { kind: 'play', playId: first.id } : current
  }
  const play = PLAYS.find((p) => p.id === current.playId)
  if (!play) return { kind: 'cover' }
  const next = getPlayByPage(play.pageNumber + 1)
  return next ? { kind: 'play', playId: next.id } : { kind: 'cover' }
}

export function prevLocation(current: Location): Location {
  if (current.kind === 'cover') {
    const last = getPlayByPage(PLAYS.length)
    return last ? { kind: 'play', playId: last.id } : current
  }
  const play = PLAYS.find((p) => p.id === current.playId)
  if (!play) return { kind: 'cover' }
  if (play.pageNumber === 1) return { kind: 'cover' }
  const prev = getPlayByPage(play.pageNumber - 1)
  return prev ? { kind: 'play', playId: prev.id } : { kind: 'cover' }
}
