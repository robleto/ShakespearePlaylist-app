"use client"
import { useState, useEffect } from 'react'

interface Props { companyId: string; canonicalPlay: string }

export default function GroupActions({ companyId, canonicalPlay }: Props) {
  const [pending, setPending] = useState<null | { action: 'approve' | 'reject'; fromStatus: 'PUBLISHED' | 'ARCHIVED' }>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(()=>{
    if (pending) {
      setCooldown(10)
    }
  },[pending])

  useEffect(()=>{
    if (cooldown>0) {
      const id = setTimeout(()=> setCooldown(cooldown-1), 1000)
      return ()=> clearTimeout(id)
    } else if (cooldown===0 && pending) {
      // finalize (clear undo opportunity)
      setPending(null)
      window.location.reload()
    }
  },[cooldown, pending])

  const doAction = async (action: 'approve' | 'reject') => {
    const endpoint = action === 'approve' ? 'approve' : 'reject'
    await fetch(`/api/admin/review-groups/${endpoint}`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ companyId, canonicalPlay }) })
    setPending({ action, fromStatus: action==='approve' ? 'PUBLISHED':'ARCHIVED' })
  }

  const undo = async () => {
    if (!pending) return
    await fetch('/api/admin/review-groups/revert', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ companyId, canonicalPlay, fromStatus: pending.fromStatus }) })
    setPending(null)
    window.location.reload()
  }

  if (pending) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-600">{pending.action==='approve' ? 'Approved' : 'Rejected'} (undo {cooldown}s)</span>
        <button onClick={undo} className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600">Undo</button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button onClick={()=>doAction('approve')} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
      <button onClick={()=>doAction('reject')} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
    </div>
  )
}
