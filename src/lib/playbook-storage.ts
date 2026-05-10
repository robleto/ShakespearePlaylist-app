import type { Stamp } from '@/types/stamp'

/**
 * Persistence shape for the playbook. Bumped via `v` when the schema
 * changes; readState handles unknown/older shapes by discarding.
 *
 * v1 stores stamps only. Holder info, edition, and accent are
 * placeholder fields — they don't ship UI in this step but are
 * already in the type so adding them is additive, not a migration.
 */
export type PlaybookState = {
  v: 1
  stamps: Stamp[]
}

export const STORAGE_KEY = 'playbook:v1'

export function emptyState(): PlaybookState {
  return { v: 1, stamps: [] }
}

export function readState(raw: string | null): PlaybookState {
  if (!raw) return emptyState()
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'v' in parsed &&
      (parsed as { v: number }).v === 1 &&
      'stamps' in parsed &&
      Array.isArray((parsed as { stamps: unknown }).stamps)
    ) {
      return parsed as PlaybookState
    }
  } catch {
    // fall through to empty
  }
  return emptyState()
}

export function writeState(state: PlaybookState): string {
  return JSON.stringify(state)
}

// Mutation helpers — pure, return a new state object

export function addStamp(state: PlaybookState, stamp: Stamp): PlaybookState {
  return { ...state, stamps: [...state.stamps, stamp] }
}

export function updateStamp(
  state: PlaybookState,
  id: string,
  updates: Partial<Stamp>
): PlaybookState {
  return {
    ...state,
    stamps: state.stamps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  }
}

export function deleteStamp(state: PlaybookState, id: string): PlaybookState {
  return { ...state, stamps: state.stamps.filter((s) => s.id !== id) }
}

export function stampsForPlay(state: PlaybookState, playId: string): Stamp[] {
  return state.stamps
    .filter((s) => s.playId === playId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function stampedPlayIds(state: PlaybookState): Set<string> {
  return new Set(state.stamps.map((s) => s.playId))
}
