"use client"
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  // Defer reading window.origin until after mount so initial SSR & hydration HTML match
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])
  const resolvedOrigin = origin || ''
  const directHref = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`
  const expectedCallback = `${resolvedOrigin || 'http://localhost:3001'}/api/auth/callback/github`
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg shadow p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold mb-1">Admin Sign In</h1>
          <p className="text-xs text-gray-500">Only the authorized admin account may proceed.</p>
        </div>
        <button
          onClick={() => signIn('github', { callbackUrl })}
          className="w-full py-2 rounded bg-black text-white text-sm font-medium hover:bg-gray-800"
        >
          Sign in with GitHub
        </button>
        <a href={directHref} className="block text-center text-xs text-blue-600 hover:underline">
          Direct GitHub auth link
        </a>
    <details className="border-t pt-3 text-[11px] text-gray-500">
          <summary className="cursor-pointer text-gray-700 font-medium">Debug info</summary>
          <div className="mt-2 space-y-1">
      <div><strong>Callback URL param:</strong> {callbackUrl}</div>
      <div>
        <strong>Detected origin:</strong>{' '}
        <span suppressHydrationWarning>{resolvedOrigin || '(origin pending client)'}</span>
      </div>
      <div>
        <strong>Expected GitHub callback:</strong>{' '}
        <span suppressHydrationWarning>
          {resolvedOrigin ? expectedCallback : '(waiting for origin)'}
        </span>
      </div>
          </div>
          <p className="mt-2">If the button does nothing, verify that your GitHub OAuth app has the above callback URL configured and that the dev server port matches NEXTAUTH_URL.</p>
        </details>
      </div>
    </div>
  )
}