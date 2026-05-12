import { HOLDER } from '@/lib/holder'

type PageRunnerProps = {
  page: number
  total?: number
}

export function PageRunner({ page, total = 39 }: PageRunnerProps) {
  return (
    <div className="runner">
      <span className="spaced">{HOLDER.name}</span>
      <span className="spaced">
        {String(page).padStart(2, '0')} / {total}
      </span>
    </div>
  )
}
