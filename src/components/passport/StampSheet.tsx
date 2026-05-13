'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Stamp, StampDraft } from '@/types/stamp'
import { usePlaybook } from '@/hooks/usePlaybook'

type Mode = { kind: 'new'; playId: string } | { kind: 'edit'; stamp: Stamp } | null

export function StampSheet({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const { addStamp, updateStamp, deleteStamp } = usePlaybook()
  const editing = mode?.kind === 'edit' ? mode.stamp : null
  const playId = mode?.kind === 'new' ? mode.playId : (editing?.playId ?? '')

  const [date, setDate] = useState(editing?.date ?? today())
  const [productionCompany, setCompany] = useState(editing?.productionCompany ?? '')
  const [venue, setVenue] = useState(editing?.venue ?? '')
  const [city, setCity] = useState(editing?.city ?? '')
  const [director, setDirector] = useState(editing?.director ?? '')
  const [leadActor, setLeadActor] = useState(editing?.leadActor ?? '')
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  // Reset whenever the sheet opens with a different mode
  useEffect(() => {
    if (!mode) return
    if (mode.kind === 'edit') {
      const s = mode.stamp
      setDate(s.date)
      setCompany(s.productionCompany)
      setVenue(s.venue)
      setCity(s.city)
      setDirector(s.director ?? '')
      setLeadActor(s.leadActor ?? '')
      setNotes(s.notes ?? '')
    } else {
      setDate(today())
      setCompany('')
      setVenue('')
      setCity('')
      setDirector('')
      setLeadActor('')
      setNotes('')
    }
    setError(null)
  }, [mode])

  // Lock body scroll + close on Escape
  useEffect(() => {
    if (!mode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [mode, onClose])

  if (!mode) return null
  if (typeof document === 'undefined') return null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const dateTrim = date.trim()
    if (dateTrim && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(dateTrim)) {
      setError('Date must be 2026, 2026-05, or 2026-05-12 — or leave blank.')
      return
    }
    const draft: StampDraft = {
      playId,
      date: dateTrim,
      productionCompany: productionCompany.trim(),
      venue: venue.trim(),
      city: city.trim(),
      director: director.trim() || undefined,
      leadActor: leadActor.trim() || undefined,
      notes: notes.trim() || undefined,
      source: 'manual',
    }
    if (editing) {
      updateStamp(editing.id, draft)
    } else {
      addStamp(draft)
    }
    onClose()
  }

  function handleDelete() {
    if (!editing) return
    if (!window.confirm('Delete this stamp? This cannot be undone.')) return
    deleteStamp(editing.id)
    onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Edit stamp' : 'Record viewing'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      />
      <form
        onSubmit={handleSave}
        className="page"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '20px 20px 24px',
          borderTop: '2px solid var(--ink)',
          animation: 'sheet-in 220ms ease-out',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <header
          style={{
            paddingBottom: 10,
            borderBottom: '1px solid var(--ink)',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div>
              <div className="mono-tiny" style={{ fontSize: 8 }}>
                {editing ? 'AMEND ENTRY' : 'RECORD VIEWING'}
              </div>
              <div className="play-title" style={{ fontSize: 22, marginTop: 2, lineHeight: 1 }}>
                {editing ? 'Amend Entry' : 'New Viewing'}
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
          </div>
          <div
            className="play-sub"
            style={{ fontSize: 12, marginTop: 6, color: 'var(--ink-soft)' }}
          >
            Fill what you remember. Nothing is required — more detail makes a richer stamp.
          </div>
        </header>

        <Field label="Date">
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="2026 or 2026-05 or 2026-05-12"
            pattern="\d{4}(-\d{2}(-\d{2})?)?"
            title="2026, 2026-05, or 2026-05-12 — or leave blank"
            autoComplete="off"
            style={inputStyle}
          />
        </Field>

        <Field label="Production company">
          <input
            type="text"
            value={productionCompany}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Royal Shakespeare Co."
            style={inputStyle}
          />
        </Field>

        <Field label="Venue">
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Barbican"
            style={inputStyle}
          />
        </Field>

        <Field label="City">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="London"
            style={inputStyle}
          />
        </Field>

        <Field label="Director">
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            placeholder="Robert Icke"
            style={inputStyle}
          />
        </Field>

        <Field label="Lead actor">
          <input
            type="text"
            value={leadActor}
            onChange={(e) => setLeadActor(e.target.value)}
            placeholder="Adjoa Andoh"
            style={inputStyle}
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Standing, gallery, or any detail worth keeping."
            style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
          />
        </Field>

        {error && (
          <div
            className="mono-cap"
            style={{
              color: 'var(--vermilion)',
              fontSize: 9,
              padding: '6px 8px',
              border: '1px solid var(--vermilion)',
              marginTop: 10,
            }}
          >
            ! {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: editing ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: 8,
            marginTop: 16,
          }}
        >
          {editing && (
            <button
              type="button"
              onClick={handleDelete}
              className="mono-cap"
              style={{
                fontSize: 10,
                padding: '10px 8px',
                border: '1px dashed var(--vermilion)',
                color: 'var(--vermilion)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              DELETE
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mono-cap"
            style={{
              fontSize: 10,
              padding: '10px 8px',
              border: '1px solid var(--ink-faint)',
              color: 'var(--ink)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="mono-cap"
            style={{
              fontSize: 10,
              padding: '10px 8px',
              border: '1px solid var(--ink)',
              color: 'var(--paper)',
              background: 'var(--ink)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {editing ? 'SAVE' : 'STAMP'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span
        className="mono-cap"
        style={{
          fontSize: 8,
          letterSpacing: '0.18em',
          color: 'var(--ink-soft)',
          display: 'block',
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-body), system-ui, sans-serif',
  fontSize: 14,
  padding: '8px 10px',
  border: '1px solid var(--ink-faint)',
  background: 'var(--paper-deep)',
  color: 'var(--ink)',
  boxSizing: 'border-box',
  borderRadius: 0,
}

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
