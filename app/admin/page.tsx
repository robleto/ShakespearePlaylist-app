import { getAggregatedReviewGroups } from '@/lib/services/productions'
import { PLAY_TITLES } from '@/lib/normalization/plays'
import { formatDateRange } from '@/lib/utils/date'
import RunEditor from '../../components/admin/run-editor'
import GroupActions from '@/components/admin/group-actions'

export const revalidate = 0

export default async function AdminReviewPage() {
	const groups = await getAggregatedReviewGroups()
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Review Queue (Grouped)</h2>
				<p className="text-sm text-gray-600">One row per company & play. Approve publishes all underlying REVIEW rows; Reject archives them.</p>
			</div>
			<GroupedTable groups={groups} />
		</div>
	)
}

function GroupedTable({ groups }: { groups: Awaited<ReturnType<typeof getAggregatedReviewGroups>> }) {
	return (
		<div className="overflow-x-auto border rounded bg-white">
			<table className="min-w-full text-sm">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-3 py-2 text-left">Company</th>
						<th className="px-3 py-2 text-left">Play</th>
						<th className="px-3 py-2 text-left">Run</th>
						<th className="px-3 py-2 text-left">Count</th>
						<th className="px-3 py-2 text-left">Confidence</th>
						<th className="px-3 py-2 text-left">Samples</th>
						<th className="px-3 py-2 text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					{groups.map(g => (
						<tr key={g.companyId + g.canonicalPlay} className="border-t">
											<td className="px-3 py-2 whitespace-nowrap text-xs">
												<div className="font-medium text-sm">{g.company.name}</div>
												{ (g.company as any).website && (
													<a href={(g.company as any).website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Site</a>
												)}
												{ (g.company as any).sources?.[0]?.url && (
													<>
														{' '}
														<a href={(g.company as any).sources[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Source</a>
													</>
												)}
											</td>
							<td className="px-3 py-2 whitespace-nowrap">{PLAY_TITLES[g.canonicalPlay as keyof typeof PLAY_TITLES] || g.canonicalPlay}</td>
															<td className="px-3 py-2 whitespace-nowrap">
																<RunEditor companyId={g.companyId} canonicalPlay={g.canonicalPlay} startDate={g.startDate} endDate={g.endDate} />
															</td>
							<td className="px-3 py-2 whitespace-nowrap">{g.count}</td>
							<td className="px-3 py-2 whitespace-nowrap">{Math.round(g.minConfidence*100)}–{Math.round(g.maxConfidence*100)}%</td>
							<td className="px-3 py-2 text-xs max-w-xs truncate" title={g.sampleTitles.join(' | ')}>{g.sampleTitles.join(' | ')}</td>
							  <td className="px-3 py-2 whitespace-nowrap"><GroupActions companyId={g.companyId} canonicalPlay={g.canonicalPlay} /></td>
						</tr>
					))}
					{groups.length===0 && (
						<tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Nothing pending 🎉</td></tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

// Client actions with undo (imported above)
