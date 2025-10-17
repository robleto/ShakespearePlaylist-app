import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { searchProductions } from '../../../lib/services/productions'
import { z } from 'zod'

const searchSchema = z.object({
  play: z.string().optional(),
  companyId: z.string().optional(),
  q: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  status: z.enum(['PUBLISHED', 'REVIEW', 'ARCHIVED']).optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    
    const validatedParams = searchSchema.parse(params)
    
    const filters = {
      play: validatedParams.play,
      companyId: validatedParams.companyId,
      q: validatedParams.q,
      start: validatedParams.start ? new Date(validatedParams.start) : undefined,
      end: validatedParams.end ? new Date(validatedParams.end) : undefined,
      status: validatedParams.status || 'PUBLISHED',
    }

    const limit = validatedParams.limit ? parseInt(validatedParams.limit) : 20
    const cursor = validatedParams.cursor

    const result = await searchProductions(filters, limit, cursor)

    return NextResponse.json({
      success: true,
      data: result.productions,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    })
  } catch (error) {
    console.error('Productions API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
