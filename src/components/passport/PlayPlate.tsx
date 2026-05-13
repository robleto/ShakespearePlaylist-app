import type { Play } from '@/types/play'

export function PlayPlate({ play, withTicks = true }: { play: Play; withTicks?: boolean }) {
  if (!play.plate) {
    return <div className="plate placeholder">PLATE · TO BE COMMISSIONED</div>
  }
  return (
    <div className="plate">
      {withTicks && (
        <>
          <span className="crop-tick ct-tl" />
          <span className="crop-tick ct-tr" />
          <span className="crop-tick ct-bl" />
          <span className="crop-tick ct-br" />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={play.plate} alt={play.title} />
    </div>
  )
}
