import Link from 'next/link'
import { PLAYS } from '@/lib/plays'

export default function CoverPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
          Shakespeare Playbook · v1
        </p>
        <h1 className="font-display text-5xl md:text-6xl mt-6 leading-[1.05]">
          A passport for live Shakespeare.
        </h1>
        <p className="mt-6 text-lg max-w-prose">
          Thirty-nine plays. Stamp the page when you see the show. Watch the
          book fill in.
        </p>
        <div className="mt-12 flex gap-4 font-mono text-sm">
          <Link href="/plays" className="underline underline-offset-4">
            Open the index →
          </Link>
        </div>
        <p className="mt-16 font-mono text-xs text-navy/60">
          {PLAYS.length} plays catalogued.
        </p>
      </div>
    </main>
  )
}
