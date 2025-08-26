import { prisma } from '../../../../lib/db'
import type { SourceWithCompany } from '../../../../types/admin'

export const revalidate = 0

export default async function AdminSourcesPage() {
  const sources = await prisma.source.findMany({
    include: { company: true },
    orderBy: { updatedAt: 'desc' }
  }) as SourceWithCompany[]
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sources</h2>
      <p className="text-sm text-gray-600 mb-6">Scraping endpoints and their latest status.</p>
      <table className="w-full text-sm border rounded overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Company</th>
            <th className="p-2">Parser</th>
            <th className="p-2">Kind</th>
            <th className="p-2">Enabled</th>
            <th className="p-2">Status</th>
            <th className="p-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2 whitespace-nowrap">{s.company.name}</td>
              <td className="p-2"><code className="text-xs">{s.parserName}</code></td>
              <td className="p-2">{s.kind}</td>
              <td className="p-2">{s.enabled ? '✅' : '❌'}</td>
              <td className="p-2 text-xs text-gray-600">{s.lastStatus || '—'}</td>
              <td className="p-2 text-xs text-gray-500">{new Date(s.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {sources.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No sources</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
