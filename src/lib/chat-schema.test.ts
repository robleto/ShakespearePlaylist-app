import { describe, expect, it } from 'vitest'
import { extractJson, parseAIResponse } from './chat-schema'

describe('extractJson', () => {
  it('parses raw JSON', () => {
    expect(extractJson('{"a": 1}')).toEqual({ a: 1 })
  })

  it('strips a ```json fenced block', () => {
    expect(extractJson('```json\n{"a": 2}\n```')).toEqual({ a: 2 })
  })

  it('strips a plain ``` fenced block', () => {
    expect(extractJson('```\n{"a": 3}\n```')).toEqual({ a: 3 })
  })

  it('finds an embedded object after prose', () => {
    expect(extractJson('here you go: {"a": 4}')).toEqual({ a: 4 })
  })

  it('returns null when no JSON is present', () => {
    expect(extractJson('nope, just words')).toBe(null)
  })

  it('returns null on empty string', () => {
    expect(extractJson('')).toBe(null)
  })
})

describe('parseAIResponse', () => {
  it('accepts a valid extracted shape', () => {
    const text = JSON.stringify({
      kind: 'extracted',
      playId: 'hamlet',
      date: '2024-03-14',
      productionCompany: 'RSC',
      venue: 'Barbican',
      city: 'London',
      director: null,
      leadActor: null,
      notes: null,
      confidence: 'high',
    })
    const out = parseAIResponse(text)
    expect(out.kind).toBe('extracted')
    if (out.kind === 'extracted') {
      expect(out.playId).toBe('hamlet')
      expect(out.confidence).toBe('high')
    }
  })

  it('defaults confidence to "high" when omitted', () => {
    const text = JSON.stringify({
      kind: 'extracted',
      playId: 'macbeth',
    })
    const out = parseAIResponse(text)
    if (out.kind === 'extracted') expect(out.confidence).toBe('high')
  })

  it('accepts a valid clarify shape', () => {
    const text = JSON.stringify({
      kind: 'clarify',
      question: 'Henry IV Part 1 or Part 2?',
      options: ['Part 1', 'Part 2'],
    })
    const out = parseAIResponse(text)
    expect(out.kind).toBe('clarify')
    if (out.kind === 'clarify') {
      expect(out.options).toHaveLength(2)
    }
  })

  it('rejects unknown kind', () => {
    expect(() => parseAIResponse(JSON.stringify({ kind: 'maybe', playId: 'hamlet' }))).toThrow()
  })

  it('rejects extracted without playId', () => {
    expect(() => parseAIResponse(JSON.stringify({ kind: 'extracted' }))).toThrow()
  })

  it('rejects malformed date format', () => {
    expect(() =>
      parseAIResponse(
        JSON.stringify({ kind: 'extracted', playId: 'hamlet', date: 'March 14, 2024' })
      )
    ).toThrow()
  })

  it('throws when no JSON in raw text', () => {
    expect(() => parseAIResponse('not json at all')).toThrow()
  })
})
