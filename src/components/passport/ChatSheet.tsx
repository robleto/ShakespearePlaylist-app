'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StampDraft } from '@/types/stamp'
import { usePlaybook } from '@/hooks/usePlaybook'
import { getPlay } from '@/lib/plays'
import type { ChatRouteResponse, ClarifyAIResponse, ExtractedAIResponse } from '@/lib/chat-schema'

type Phase =
  | { kind: 'input' }
  | { kind: 'loading' }
  | { kind: 'review'; data: ExtractedAIResponse; sourceText: string }
  | { kind: 'clarify'; data: ClarifyAIResponse; sourceText: string }
  | { kind: 'error'; message: string; sourceText: string }

export function ChatSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addStamp } = usePlaybook()
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'input' })

  // reset whenever opened
  useEffect(() => {
    if (open) {
      setText('')
      setPhase({ kind: 'input' })
    }
  }, [open])

  // body lock + Esc
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

  if (!open) return null
  if (typeof document === 'undefined') return null

  async function send(userText: string) {
    setPhase({ kind: 'loading' })
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, todayISO: todayISO() }),
      })
      const body = (await res.json()) as ChatRouteResponse
      if (body.kind === 'extracted') {
        if (!getPlay(body.data.playId)) {
          setPhase({
            kind: 'error',
            message: `The model picked an unknown play id ("${body.data.playId}"). Try rewording.`,
            sourceText: userText,
          })
          return
        }
        setPhase({ kind: 'review', data: body.data, sourceText: userText })
      } else if (body.kind === 'clarify') {
        setPhase({ kind: 'clarify', data: body.data, sourceText: userText })
      } else {
        setPhase({ kind: 'error', message: body.message, sourceText: userText })
      }
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
        sourceText: userText,
      })
    }
  }

  function pickClarification(choice: string, sourceText: string) {
    void send(`${sourceText}\n\n(For the play, I mean: ${choice}.)`)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chat intake"
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
      <div
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
        <Header onClose={onClose} phase={phase} />

        {phase.kind === 'input' && (
          <InputView
            text={text}
            setText={setText}
            onSend={() => text.trim() && send(text.trim())}
          />
        )}

        {phase.kind === 'loading' && <LoadingView />}

        {phase.kind === 'clarify' && (
          <ClarifyView
            data={phase.data}
            onPick={(choice) => pickClarification(choice, phase.sourceText)}
            onBack={() => setPhase({ kind: 'input' })}
            onClose={onClose}
          />
        )}

        {phase.kind === 'review' && (
          <ReviewView
            data={phase.data}
            sourceText={phase.sourceText}
            onCancel={() => setPhase({ kind: 'input' })}
            onStamp={(draft) => {
              addStamp(draft)
              onClose()
            }}
          />
        )}

        {phase.kind === 'error' && (
          <ErrorView
            message={phase.message}
            onRetry={() => send(phase.sourceText)}
            onBack={() => setPhase({ kind: 'input' })}
          />
        )}
      </div>
    </div>,
    document.body
  )
}

function Header({ onClose, phase }: { onClose: () => void; phase: Phase }) {
  const eyebrow =
    phase.kind === 'review'
      ? 'REVIEW · STAMP?'
      : phase.kind === 'clarify'
        ? 'NEED A DETAIL'
        : phase.kind === 'error'
          ? 'INTAKE ERROR'
          : 'INTAKE'
  const title =
    phase.kind === 'review'
      ? 'Verify the entry'
      : phase.kind === 'clarify'
        ? 'A small clarification'
        : phase.kind === 'error'
          ? 'Something went off'
          : 'Describe the show'
  return (
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
          {eyebrow}
        </div>
        <div className="play-title" style={{ fontSize: 22, marginTop: 2, lineHeight: 1 }}>
          {title}
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
  )
}

function InputView({
  text,
  setText,
  onSend,
}: {
  text: string
  setText: (s: string) => void
  onSend: () => void
}) {
  return (
    <div>
      <p className="mono-tiny" style={{ marginBottom: 8, lineHeight: 1.5, fontSize: 9 }}>
        Type a sentence about the show — what, where, when, who. Plain prose is fine. The agent will
        pull the play and details out and let you review before stamping.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        autoFocus
        placeholder="e.g. Saw Hamlet at the Globe last Tuesday, Cush Jumbo was electric."
        style={{
          width: '100%',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          fontSize: 14,
          padding: '10px 12px',
          border: '1px solid var(--ink-faint)',
          background: 'var(--paper-deep)',
          color: 'var(--ink)',
          boxSizing: 'border-box',
          borderRadius: 0,
          resize: 'vertical',
          minHeight: 100,
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="mono-cap"
          onClick={() => setText('')}
          style={btnSecondary}
          disabled={!text}
        >
          CLEAR
        </button>
        <button
          type="button"
          className="mono-cap"
          onClick={onSend}
          disabled={!text.trim()}
          style={{ ...btnPrimary, opacity: text.trim() ? 1 : 0.4 }}
        >
          SEND →
        </button>
      </div>
    </div>
  )
}

function LoadingView() {
  return (
    <div style={{ padding: '32px 0', textAlign: 'center' }}>
      <div className="mono-tiny" style={{ fontSize: 9, marginBottom: 6 }}>
        TRANSCRIBING
      </div>
      <div className="play-sub" style={{ fontSize: 18 }}>
        The agent is reading…
      </div>
    </div>
  )
}

function ClarifyView({
  data,
  onPick,
  onBack,
  onClose,
}: {
  data: ClarifyAIResponse
  onPick: (choice: string) => void
  onBack: () => void
  onClose: () => void
}) {
  return (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.4, marginBottom: 14 }}>{data.question}</p>
      {data.options && data.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              className="mono-cap"
              style={{ ...btnSecondary, textAlign: 'left', padding: '10px 12px', fontSize: 11 }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onBack} className="mono-cap" style={btnSecondary}>
          ← REPHRASE
        </button>
        <button type="button" onClick={onClose} className="mono-cap" style={btnSecondary}>
          CANCEL
        </button>
      </div>
    </div>
  )
}

function ErrorView({
  message,
  onRetry,
  onBack,
}: {
  message: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div>
      <div
        className="mono-cap"
        style={{
          color: 'var(--vermilion)',
          fontSize: 9,
          padding: '8px 10px',
          border: '1px solid var(--vermilion)',
          marginBottom: 14,
          lineHeight: 1.4,
        }}
      >
        ! {message}
      </div>
      <p className="mono-tiny" style={{ fontSize: 9, lineHeight: 1.5, marginBottom: 14 }}>
        You can retry the same input, rephrase, or close out and use the manual form on the play
        page instead.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button type="button" onClick={onBack} className="mono-cap" style={btnSecondary}>
          ← REPHRASE
        </button>
        <button type="button" onClick={onRetry} className="mono-cap" style={btnPrimary}>
          RETRY
        </button>
      </div>
    </div>
  )
}

function ReviewView({
  data,
  sourceText,
  onCancel,
  onStamp,
}: {
  data: ExtractedAIResponse
  sourceText: string
  onCancel: () => void
  onStamp: (draft: StampDraft) => void
}) {
  const play = getPlay(data.playId)
  const [date, setDate] = useState(data.date ?? '')
  const [productionCompany, setCompany] = useState(data.productionCompany ?? '')
  const [venue, setVenue] = useState(data.venue ?? '')
  const [city, setCity] = useState(data.city ?? '')
  const [director, setDirector] = useState(data.director ?? '')
  const [leadActor, setLeadActor] = useState(data.leadActor ?? '')
  const [notes, setNotes] = useState(data.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!productionCompany.trim() || !venue.trim() || !city.trim()) {
      setError('Production company, venue, and city are required.')
      return
    }
    if (!date) {
      setError('Date is required.')
      return
    }
    onStamp({
      playId: data.playId,
      date,
      productionCompany: productionCompany.trim(),
      venue: venue.trim(),
      city: city.trim(),
      director: director.trim() || undefined,
      leadActor: leadActor.trim() || undefined,
      notes: notes.trim() || undefined,
      source: 'ai-chat',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="kbox thin"
        style={{
          padding: '10px 12px',
          marginBottom: 14,
          background: 'var(--paper-deep)',
        }}
      >
        <div className="mono-tiny" style={{ fontSize: 8, marginBottom: 2 }}>
          IDENTIFIED PLAY
          {data.confidence === 'low' && (
            <span style={{ color: 'var(--vermilion)', marginLeft: 8 }}>· LOW CONFIDENCE</span>
          )}
        </div>
        <div className="play-title" style={{ fontSize: 22, lineHeight: 1.05 }}>
          {play?.title ?? data.playId}
        </div>
        {play?.subtitle && (
          <div className="play-sub" style={{ fontSize: 13 }}>
            {play.subtitle}
          </div>
        )}
      </div>

      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>
      <Field label="Production company">
        <input
          type="text"
          value={productionCompany}
          onChange={(e) => setCompany(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>
      <Field label="Venue">
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>
      <Field label="City">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>
      <Field label="Director (optional)">
        <input
          type="text"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field label="Lead actor (optional)">
        <input
          type="text"
          value={leadActor}
          onChange={(e) => setLeadActor(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
        />
      </Field>

      <details style={{ margin: '10px 0' }}>
        <summary
          className="mono-tiny"
          style={{ fontSize: 8, cursor: 'pointer', color: 'var(--ink-soft)' }}
        >
          WHAT YOU TYPED
        </summary>
        <div
          style={{
            marginTop: 6,
            padding: '8px 10px',
            background: 'var(--paper-deep)',
            border: '1px dotted var(--ink-faint)',
            fontSize: 13,
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
          }}
        >
          {sourceText}
        </div>
      </details>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onCancel} className="mono-cap" style={btnSecondary}>
          ← BACK
        </button>
        <button type="submit" className="mono-cap" style={btnPrimary}>
          STAMP
        </button>
      </div>
    </form>
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

const btnSecondary: React.CSSProperties = {
  fontSize: 10,
  padding: '10px 8px',
  border: '1px solid var(--ink-faint)',
  color: 'var(--ink)',
  background: 'transparent',
  cursor: 'pointer',
}

const btnPrimary: React.CSSProperties = {
  fontSize: 10,
  padding: '10px 8px',
  border: '1px solid var(--ink)',
  color: 'var(--paper)',
  background: 'var(--ink)',
  cursor: 'pointer',
  fontWeight: 600,
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
