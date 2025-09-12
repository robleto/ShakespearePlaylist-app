import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { archiveProduction } from '@/lib/services/productions'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  try {
    await archiveProduction(params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return new NextResponse(e.message || 'Error', { status: 500 })
  }
}
