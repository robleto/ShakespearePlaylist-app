import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ShakesFind
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/productions" className="text-gray-600 hover:text-gray-900">
              Browse
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-gray-900">
              Companies
            </Link>
            <Link href="/api" className="text-gray-600 hover:text-gray-900">
              API
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}

function AuthButton() {
  return null // Simplified for now - would need client component for auth
}
