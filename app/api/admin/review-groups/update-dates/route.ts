import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateReviewGroupDates } from '@/lib/services/productions'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') return new NextResponse('Unauthorized', { status: 401 })
  const { companyId, canonicalPlay, startDate, endDate } = await req.json()
  if (!companyId || !canonicalPlay || !startDate || !endDate) return new NextResponse('Missing params', { status: 400 })
  const s = new Date(startDate)
  const e = new Date(endDate)
  if (e < s) return new NextResponse('End before start', { status: 400 })
  await updateReviewGroupDates(companyId, canonicalPlay, s, e)
  return NextResponse.json({ ok: true })
}
