import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'ShakesFind – Discover Shakespeare Productions',
    template: '%s • ShakesFind'
  },
  description: 'Browse upcoming Shakespeare productions, companies, and plays.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'ShakesFind',
    description: 'Discover and track upcoming Shakespeare productions across theaters.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShakesFind',
    description: 'Discover upcoming Shakespeare productions.'
  }
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#site-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white border px-3 py-2 rounded shadow">Skip to main content</a>
      <Header />
      <main id="site-main" role="main" className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}
