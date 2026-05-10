'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { type Location, locationHref, nextLocation, prevLocation } from '@/lib/navigation'

const COMMIT_THRESHOLD = 80
const MAX_DRAG = 220
const RESTORE_MS = 200

function locationFromPath(pathname: string | null): Location {
  if (!pathname || pathname === '/') return { kind: 'cover' }
  if (pathname.startsWith('/play/')) {
    return { kind: 'play', playId: pathname.slice('/play/'.length) }
  }
  return { kind: 'cover' }
}

export function SwipeNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const current = locationFromPath(pathname)
  const startX = useRef<number | null>(null)
  const [dx, setDx] = useState(0)
  const [committing, setCommitting] = useState<'next' | 'prev' | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      }
      if (e.key === 'ArrowLeft') router.push(locationHref(prevLocation(current)))
      else if (e.key === 'ArrowRight') router.push(locationHref(nextLocation(current)))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, router])

  // Reset transform when route changes (a new page is mounted at rest).
  useEffect(() => {
    setDx(0)
    setCommitting(null)
  }, [pathname])

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setDx(0)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (startX.current === null) return
    const delta = e.touches[0].clientX - startX.current
    const clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta))
    setDx(clamped)
  }
  function handleTouchEnd() {
    if (startX.current === null) return
    const delta = dx
    startX.current = null
    if (delta <= -COMMIT_THRESHOLD) {
      setCommitting('next')
      router.push(locationHref(nextLocation(current)))
    } else if (delta >= COMMIT_THRESHOLD) {
      setCommitting('prev')
      router.push(locationHref(prevLocation(current)))
    } else {
      setDx(0)
    }
  }

  const transform =
    committing === 'next'
      ? 'translateX(-100%)'
      : committing === 'prev'
        ? 'translateX(100%)'
        : `translateX(${dx}px)`
  const transition =
    committing || (dx !== 0 && startX.current === null)
      ? `transform ${RESTORE_MS}ms ease-out`
      : 'none'

  return (
    <div
      className="swipe-nav"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'pan-y', position: 'relative' }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          width: '100%',
          transform,
          transition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
