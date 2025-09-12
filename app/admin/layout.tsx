import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(authOptions)
	if (!session || session.user?.role !== 'ADMIN') {
		redirect('/api/auth/signin')
	}
	return <div className="min-h-screen bg-gray-50">{children}</div>
}
