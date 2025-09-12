import { prisma } from '@/lib/db'
import { PLAY_TITLES } from '@/lib/normalization/plays'
import { formatDateRange } from '@/lib/utils/date'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function archive(id: string) {
  'use server'
  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/productions/${id}/archive`, { method: 'POST' })
}

export default async function AdminCompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } })
  if (!company) return <div className="p-6">Company not found.</div>
  const productions = await prisma.production.findMany({
    where: { companyId: company.id, status: { in: ['PUBLISHED', 'REVIEW'] } },
    orderBy: { startDate: 'asc' }
  })
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage: {company.name}</h1>
        <Link href="/admin/coverage" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>
      <table className="min-w-full text-sm border rounded bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2">Play</th>
            <th className="text-left px-3 py-2">Raw Title</th>
            <th className="text-left px-3 py-2">Dates</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Confidence</th>
            <th className="text-left px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productions.map(p => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2 whitespace-nowrap">{PLAY_TITLES[p.canonicalPlay as keyof typeof PLAY_TITLES] || p.canonicalPlay}</td>
              <td className="px-3 py-2 max-w-xs truncate" title={p.titleRaw}>{p.titleRaw}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDateRange(p.startDate, p.endDate)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{p.status}</td>
              <td className="px-3 py-2 whitespace-nowrap">{p.sourceConfidence.toFixed(2)}</td>
              <td className="px-3 py-2">
                <form action={archive.bind(null, p.id)}>
                  <button className="text-xs text-red-600 hover:underline" type="submit">Archive</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500">Archive incorrect rows (auditions, classes, wrong play). Page auto-refreshes on action.</p>
    </div>
  )
}
