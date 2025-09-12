import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  try {
    await prisma.production.update({ where: { id: params.id }, data: { status: 'ARCHIVED' } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return new NextResponse(e.message || 'Error', { status: 500 })
  }
}