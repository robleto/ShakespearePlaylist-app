import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '../../../lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    
    const validatedParams = searchSchema.parse(params)
    
    const where: any = {}

    if (validatedParams.q) {
      where.OR = [
        { name: { contains: validatedParams.q, mode: 'insensitive' } },
        { city: { contains: validatedParams.q, mode: 'insensitive' } },
      ]
    }

    if (validatedParams.region) {
      where.region = validatedParams.region
    }

    if (validatedParams.country) {
      where.country = validatedParams.country
    }

    const limit = validatedParams.limit ? parseInt(validatedParams.limit) : 20
    const cursor = validatedParams.cursor

    const queryOptions: any = {
      where,
      include: {
        _count: {
          select: { productions: { where: { status: 'PUBLISHED' } } },
        },
      },
      orderBy: { name: 'asc' },
      take: limit + 1,
    }

    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1
    }

    const companies = await prisma.company.findMany(queryOptions)
    
    const hasMore = companies.length > limit
    if (hasMore) {
      companies.pop()
    }

    const nextCursor = hasMore ? companies[companies.length - 1]?.id : null

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        nextCursor,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Companies API error:', error)
    
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
