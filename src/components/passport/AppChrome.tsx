'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IndexSheet } from './IndexSheet'

function currentPlayIdFromPath(pathname: string | null): string | undefined {
  if (pathname?.startsWith('/play/')) return pathname.slice('/play/'.length)
  return undefined
}

export function AppChrome() {
  const [sheetOpen, setSheetOpen] = useState(false)
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
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          zIndex: 40,
        }}
      >
        <Link
          href="/"
          aria-current={onCover ? 'page' : undefined}
          className="mono-cap"
          style={{
            textAlign: 'center',
            padding: '9px 8px',
            border: `1px solid ${onCover ? 'var(--ink)' : 'var(--ink-faint)'}`,
            color: 'var(--ink)',
            textDecoration: 'none',
            background: onCover ? 'var(--paper-deep)' : 'transparent',
            fontSize: 10,
          }}
        >
          ⌂ &nbsp; HOME
        </Link>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mono-cap"
          style={{
            textAlign: 'center',
            padding: '9px 8px',
            border: '1px solid var(--ink-faint)',
            color: 'var(--ink)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          ☰ &nbsp; INDEX
        </button>
      </nav>
      <IndexSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        currentPlayId={currentPlayId}
      />
    </>
  )
}
