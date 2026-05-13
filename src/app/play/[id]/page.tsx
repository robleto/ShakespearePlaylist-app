import { notFound } from 'next/navigation'
import { PLAYS, getPlay } from '@/lib/plays'
import { productionsForPlay } from '@/lib/productions'
import { PlayPageView } from '@/components/passport/PlayPageView'

export function generateStaticParams() {
  return PLAYS.map((play) => ({ id: play.id }))
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const play = getPlay(params.id)
  if (!play) notFound()
  const productions = productionsForPlay(play.id)
  return <PlayPageView play={play} productions={productions} />
}
