import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { buildSystemPrompt } from '@/lib/chat-prompt'
import { parseAIResponse, type ChatRouteResponse } from '@/lib/chat-schema'

const requestSchema = z.object({
  text: z.string().min(1).max(2000),
  /** Client's "today" so relative dates ("last Tuesday") resolve to the
   * user's clock, not the server's. Format: YYYY-MM-DD. */
  todayISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const MODEL = 'claude-sonnet-4-6'

export async function POST(req: Request): Promise<NextResponse<ChatRouteResponse>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { kind: 'error', message: 'Chat is not configured on this server.' },
      { status: 503 }
    )
  }

  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ kind: 'error', message: 'Invalid request.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let rawText = ''
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: buildSystemPrompt(body.todayISO),
      messages: [{ role: 'user', content: body.text }],
    })
    const block = message.content.find((b) => b.type === 'text')
    rawText = block && 'text' in block ? block.text : ''
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json(
      { kind: 'error', message: `Anthropic call failed: ${detail}` },
      { status: 502 }
    )
  }

  try {
    const ai = parseAIResponse(rawText)
    if (ai.kind === 'extracted') {
      return NextResponse.json({ kind: 'extracted', data: ai })
    }
    return NextResponse.json({ kind: 'clarify', data: ai })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json(
      { kind: 'error', message: `Could not parse model response: ${detail}` },
      { status: 502 }
    )
  }
}
