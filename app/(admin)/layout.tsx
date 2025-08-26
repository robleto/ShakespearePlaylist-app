import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Admin – ShakesFind',
    template: '%s • Admin • ShakesFind'
  }
}

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/api/auth/signin')
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
