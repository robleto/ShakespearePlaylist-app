import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PLAYS, getPlay } from '@/lib/plays'

export function generateStaticParams() {
  return PLAYS.map((play) => ({ id: play.id }))
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const play = getPlay(params.id)
  if (!play) notFound()

  const runtimeHrs = Math.floor(play.approximateRuntime / 60)
  const runtimeMin = play.approximateRuntime % 60
  const runtimeText = runtimeHrs
    ? `${runtimeHrs}h ${runtimeMin}m`
    : `${runtimeMin}m`

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
          <Link href="/" className="hover:underline underline-offset-4">
            Cover
          </Link>
          <span className="mx-3">/</span>
          <Link href="/plays" className="hover:underline underline-offset-4">
            Index
          </Link>
          <span className="mx-3">/</span>
          {play.serial}
        </p>

        <header className="mt-8 border-b border-navy/20 pb-8">
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
            {play.title}
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-red">
            {play.genre}
            {!play.inFirstFolio && ' · not in first folio'}
          </p>
        </header>

        <dl className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 font-mono text-sm">
          <Field label="Year written" value={String(play.yearWritten)} />
          <Field label="Acts" value={String(play.acts)} />
          <Field label="Characters" value={`~${play.characterCount}`} />
          <Field label="Runtime" value={`~${runtimeText}`} />
          <Field
            label="First folio"
            value={play.inFirstFolio ? 'Yes' : 'No'}
          />
          <Field label="Serial" value={play.serial} />
        </dl>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
            Source
          </h2>
          <p className="mt-2">{play.source}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
            Notable lines
          </h2>
          <ul className="mt-2 space-y-3 max-w-prose">
            {play.notableLines.map((line, i) => (
              <li key={i} className="font-display text-xl leading-snug">
                “{line}”
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 border-t border-navy/20 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
            Stamps
          </h2>
          <p className="mt-3 font-mono text-sm text-navy/60">
            No stamps yet — manual stamping ships in step 2.
          </p>
        </section>

        <section className="mt-12 border-t border-navy/20 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-navy/70">
            Where to see this
          </h2>
          <p className="mt-3 font-mono text-sm text-navy/60">
            Discovery layer ships in step 4.
          </p>
        </section>
      </div>
    </main>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.15em] text-navy/60">
        {label}
      </dt>
      <dd className="mt-1">{value}</dd>
    </div>
  )
}
