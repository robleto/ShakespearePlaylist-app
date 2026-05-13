'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IndexSheet } from './IndexSheet'
import { ChatSheet } from './ChatSheet'

function currentPlayIdFromPath(pathname: string | null): string | undefined {
  if (pathname?.startsWith('/play/')) return pathname.slice('/play/'.length)
  return undefined
}

export function AppChrome() {
  const [indexOpen, setIndexOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const pathname = usePathname()
  const onCover = pathname === '/'
  const currentPlayId = currentPlayIdFromPath(pathname)

  return (
    <>
      <nav
        aria-label="Playbook"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--paper)',
          borderTop: '1px solid var(--ink)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          zIndex: 40,
        }}
      >
        <Link
          href="/"
          aria-current={onCover ? 'page' : undefined}
          className="mono-cap"
          style={{
            textAlign: 'center',
            padding: '9px 6px',
            border: `1px solid ${onCover ? 'var(--ink)' : 'var(--ink-faint)'}`,
            color: 'var(--ink)',
            textDecoration: 'none',
            background: onCover ? 'var(--paper-deep)' : 'transparent',
            fontSize: 10,
          }}
        >
          HOME
        </Link>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="mono-cap"
          style={{
            textAlign: 'center',
            padding: '9px 6px',
            border: '1px solid var(--ink)',
            color: 'var(--paper)',
            background: 'var(--ink)',
            cursor: 'pointer',
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          INTAKE
        </button>
        <button
          type="button"
          onClick={() => setIndexOpen(true)}
          className="mono-cap"
          style={{
            textAlign: 'center',
            padding: '9px 6px',
            border: '1px solid var(--ink-faint)',
            color: 'var(--ink)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          INDEX
        </button>
      </nav>
      <IndexSheet
        open={indexOpen}
        onClose={() => setIndexOpen(false)}
        currentPlayId={currentPlayId}
      />
      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}
