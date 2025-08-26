import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'

// Mock prisma before importing the page
vi.mock('../../lib/db', () => {
  return {
    prisma: {
      source: {
        findMany: vi.fn()
      }
    }
  }
})

// Auth/session not needed here because the admin group layout handles gating upstream.

describe('Admin Sources Page', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('renders a table of sources', async () => {
    const { prisma } = await import('../../lib/db') as any
    ;(prisma.source.findMany as any).mockResolvedValue([
      { id: 's1', companyId: 'c1', url: 'https://example.org', kind: 'HTML', parserName: 'example.org', enabled: true, lastRunAt: null, lastStatus: 'OK', etag: null, lastModified: null, createdAt: new Date(), updatedAt: new Date(), company: { id: 'c1', name: 'Example Co', city: 'City', region: 'ST', country: 'US', website: 'https://example.org', createdAt: new Date(), updatedAt: new Date() } }
    ])
    const pageMod = await import('../../app/(admin)/admin/sources/page')
    const element = await pageMod.default()
    const html = renderToString(element as any)
    expect(html).toContain('Sources')
    expect(html).toContain('Example Co')
    expect(html).toContain('example.org')
  })
})
