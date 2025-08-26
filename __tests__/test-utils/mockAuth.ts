import { vi } from 'vitest'

export function mockNoSession() {
  vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }))
  const redirectSpy = vi.fn()
  vi.mock('next/navigation', () => ({ redirect: redirectSpy }))
  return { redirectSpy }
}

export function mockAdminSession() {
  vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { role: 'ADMIN' } }) }))
  const redirectSpy = vi.fn()
  vi.mock('next/navigation', () => ({ redirect: redirectSpy }))
  return { redirectSpy }
}