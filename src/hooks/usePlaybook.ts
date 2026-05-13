'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { Stamp, StampDraft } from '@/types/stamp'
import {
  type PlaybookState,
  STORAGE_KEY,
  addStamp as addStampPure,
  deleteStamp as deleteStampPure,
  emptyState,
  readState,
  stampsForPlay as stampsForPlayPure,
  updateStamp as updateStampPure,
  writeState,
} from '@/lib/playbook-storage'

// Module-level singleton store — one source of truth across all
// components subscribed via usePlaybook.
let snapshot: PlaybookState = emptyState()
let hydrated = false
const listeners = new Set<() => void>()

// Cached SSR snapshot. Must be a stable reference: useSyncExternalStore
// compares by identity, and a fresh emptyState() each call triggers an
// infinite-render warning.
const SERVER_SNAPSHOT: PlaybookState = emptyState()

function emit() {
  listeners.forEach((l) => l())
}

function load() {
  if (typeof window === 'undefined') return
  if (hydrated) return
  try {
    snapshot = readState(localStorage.getItem(STORAGE_KEY))
  } catch {
    snapshot = emptyState()
  }
  hydrated = true
  emit()
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, writeState(snapshot))
  } catch {
    // localStorage may be unavailable (private mode, quota); state is still
    // correct in memory for the session.
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  load()
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): PlaybookState {
  return snapshot
}

function getServerSnapshot(): PlaybookState {
  return SERVER_SNAPSHOT
}

// Sync across tabs / windows
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return
    snapshot = readState(e.newValue)
    emit()
  })
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function usePlaybook() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addStamp = useCallback((draft: StampDraft): Stamp => {
    const stamp: Stamp = {
      ...draft,
      id: genId(),
      createdAt: new Date().toISOString(),
    }
    snapshot = addStampPure(snapshot, stamp)
    persist()
    emit()
    return stamp
  }, [])

  const updateStamp = useCallback((id: string, updates: Partial<Stamp>) => {
    snapshot = updateStampPure(snapshot, id, updates)
    persist()
    emit()
  }, [])

  const deleteStamp = useCallback((id: string) => {
    snapshot = deleteStampPure(snapshot, id)
    persist()
    emit()
  }, [])

  const stampsForPlay = useCallback((playId: string) => stampsForPlayPure(state, playId), [state])

  return {
    /** All persisted stamps. Empty during SSR and the initial client render. */
    stamps: state.stamps,
    /** True after the first load from localStorage. */
    hydrated,
    stampsForPlay,
    addStamp,
    updateStamp,
    deleteStamp,
  }
}
