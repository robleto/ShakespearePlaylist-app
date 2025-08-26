import { describe, it, expect, vi } from 'vitest'
import { mockNoSession, mockAdminSession } from '../test-utils/mockAuth'

describe('admin auth gating', () => {
  it('redirects when no session', async () => {
    const { redirectSpy } = mockNoSession()
    const pageMod = await import('../../app/(admin)/admin/page')
    await pageMod.default()
    expect(redirectSpy).toHaveBeenCalled()
  })

  it('renders when admin session present', async () => {
    vi.resetModules()
    const { redirectSpy } = mockAdminSession()
    const pageMod = await import('../../app/(admin)/admin/page')
    const result = await pageMod.default()
    expect(redirectSpy).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })
})
