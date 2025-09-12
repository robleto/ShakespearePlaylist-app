"use client"
import { useState } from 'react'
import { formatDateRange } from '@/lib/utils/date'

interface Props { companyId: string; canonicalPlay: string; startDate: Date; endDate: Date }

export default function RunEditor({ companyId, canonicalPlay, startDate, endDate }: Props) {
  const [editing, setEditing] = useState(false)
  const [start, setStart] = useState(startDate.toISOString().slice(0,10))
  const [end, setEnd] = useState(endDate.toISOString().slice(0,10))
  const [saving, setSaving] = useState(false)
  const display = formatDateRange(startDate, endDate)
  const submit = async () => {
    setSaving(true)
    await fetch('/api/admin/review-groups/update-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, canonicalPlay, startDate: start, endDate: end })
    })
    window.location.reload()
  }
  if (!editing) return <div className="flex items-center gap-2"><span>{display}</span><button onClick={()=>setEditing(true)} className="text-[10px] text-indigo-600 hover:underline">Edit</button></div>
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1 items-center">
        <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="border px-1 py-0.5 text-xs rounded" />
        <span className="text-xs">→</span>
        <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="border px-1 py-0.5 text-xs rounded" />
      </div>
      <div className="flex gap-2">
        <button disabled={saving} onClick={submit} className="px-2 py-0.5 text-[10px] bg-green-600 text-white rounded disabled:opacity-50">Save</button>
        <button disabled={saving} onClick={()=>setEditing(false)} className="px-2 py-0.5 text-[10px] text-gray-600 hover:underline">Cancel</button>
      </div>
    </div>
  )
}
