import './globals.css'
import type { Metadata } from 'next'
import { EB_Garamond, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { StampDefs } from '@/components/passport/StampDefs'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-edition="light"
      className={`${garamond.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <StampDefs />
        {children}
      </body>
    </html>
  )
}
