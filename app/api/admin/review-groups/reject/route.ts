import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rejectReviewGroup } from '@/lib/services/productions'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') return new NextResponse('Unauthorized', { status: 401 })
  const { companyId, canonicalPlay } = await req.json()
  if (!companyId || !canonicalPlay) return new NextResponse('Missing params', { status: 400 })
  await rejectReviewGroup(companyId, canonicalPlay)
  return NextResponse.json({ ok: true })
}
