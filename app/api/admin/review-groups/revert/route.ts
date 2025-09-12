import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revertGroupStatus } from '@/lib/services/productions'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') return new NextResponse('Unauthorized', { status: 401 })
  const { companyId, canonicalPlay, fromStatus } = await req.json()
  if (!companyId || !canonicalPlay || !fromStatus) return new NextResponse('Missing params', { status: 400 })
  await revertGroupStatus(companyId, canonicalPlay, fromStatus)
  return NextResponse.json({ ok: true })
}
