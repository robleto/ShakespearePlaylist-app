import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shakespeare Playbook',
  description: 'A digital passport for tracking live Shakespeare productions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
