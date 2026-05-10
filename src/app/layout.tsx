import './globals.css'
import type { Metadata, Viewport } from 'next'
import { EB_Garamond, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { StampDefs } from '@/components/passport/StampDefs'
import { SwipeNav } from '@/components/passport/SwipeNav'
import { AppChrome } from '@/components/passport/AppChrome'

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Shakespeare Playbook',
  description:
    'A passport for live Shakespeare. Thirty-nine plays, stamped on the page when the show is seen.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-edition="light"
      className={`${garamond.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <StampDefs />
        <main className="page-stage">
          <SwipeNav>{children}</SwipeNav>
        </main>
        <AppChrome />
      </body>
    </html>
  )
}
