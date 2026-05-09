import Link from 'next/link'
import { PLAYS } from '@/lib/plays'
import type { PlayGenre } from '@/types/play'

const GENRE_ORDER: PlayGenre[] = ['tragedy', 'comedy', 'history', 'romance', 'apocrypha']

export default function IndexPage() {
  const byGenre = GENRE_ORDER.map((genre) => ({
    genre,
    plays: PLAYS.filter((p) => p.genre === genre).sort((a, b) =>
      a.title.localeCompare(b.title),
    ),
  }))

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
          <Link href="/" className="hover:underline underline-offset-4">
            ← Cover
          </Link>
          <span className="mx-3">/</span>
          Index
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-4">The Index</h1>
        <p className="mt-4 max-w-prose">
          {PLAYS.length} plays. Tap any to open the page.
        </p>

        <div className="mt-16 space-y-12">
          {byGenre.map(({ genre, plays }) => (
            <section key={genre}>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-red border-b border-navy/20 pb-2">
                {genre} · {plays.length}
              </h2>
              <ul className="mt-4 divide-y divide-navy/10">
                {plays.map((play) => (
                  <li key={play.id}>
                    <Link
                      href={`/play/${play.id}`}
                      className="flex items-baseline justify-between py-3 hover:bg-cream/40 transition-colors"
                    >
                      <span className="font-display text-xl">{play.title}</span>
                      <span className="font-mono text-xs text-navy/60">
                        {play.serial} · {play.yearWritten}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
