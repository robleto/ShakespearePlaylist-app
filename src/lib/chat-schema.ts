import { z } from 'zod'

/** What the AI is asked to return. Validated server-side before passing back. */
export const extractedSchema = z.object({
  kind: z.literal('extracted'),
  playId: z.string().min(1),
  date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]).optional(),
  productionCompany: z.union([z.string(), z.null()]).optional(),
  venue: z.union([z.string(), z.null()]).optional(),
  city: z.union([z.string(), z.null()]).optional(),
  director: z.union([z.string(), z.null()]).optional(),
  leadActor: z.union([z.string(), z.null()]).optional(),
  notes: z.union([z.string(), z.null()]).optional(),
  confidence: z.enum(['high', 'low']).default('high'),
})

export const clarifySchema = z.object({
  kind: z.literal('clarify'),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
})

export const aiResponseSchema = z.discriminatedUnion('kind', [extractedSchema, clarifySchema])

export type ExtractedAIResponse = z.infer<typeof extractedSchema>
export type ClarifyAIResponse = z.infer<typeof clarifySchema>
export type AIResponse = z.infer<typeof aiResponseSchema>

/** What the API route returns to the client. Wraps AI response with error case. */
export type ChatRouteResponse =
  | { kind: 'extracted'; data: ExtractedAIResponse }
  | { kind: 'clarify'; data: ClarifyAIResponse }
  | { kind: 'error'; message: string }

/**
 * Pull the first JSON object from a model response. Claude may wrap output in
 * a ```json fenced block, prefix with leading prose, or return raw JSON.
 * Returns the parsed object, or null if no JSON could be extracted.
 */
export function extractJson(text: string): unknown {
  if (!text) return null
  const trimmed = text.trim()
  // Try fenced ```json block first
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) {
    try {
      return JSON.parse(fence[1].trim())
    } catch {
      // fall through to other strategies
    }
  }
  // Try parsing whole thing
  try {
    return JSON.parse(trimmed)
  } catch {
    // Try to find a {...} object
  }
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
  return null
}

/** Parse + validate the model's text response. Throws if not parseable. */
export function parseAIResponse(rawText: string): AIResponse {
  const json = extractJson(rawText)
  if (!json) throw new Error('Model returned no valid JSON')
  const result = aiResponseSchema.safeParse(json)
  if (!result.success) {
    throw new Error(`Model JSON failed schema: ${result.error.message}`)
  }
  return result.data
}
