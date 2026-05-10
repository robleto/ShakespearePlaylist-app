type PageRunnerProps = {
  playbook?: string
  page: number
  total?: number
  holder?: string
}

export function PageRunner({
  playbook = 'SHAKESPEARE PLAYBOOK · FIRST FOLIO ED.',
  page,
  total = 39,
  holder = 'PB·0042·MD',
}: PageRunnerProps) {
  return (
    <div className="runner">
      <span className="spaced">{playbook}</span>
      <span className="spaced">{holder}</span>
      <span className="spaced">
        PAGE {String(page).padStart(2, '0')} / {total}
      </span>
    </div>
  )
}
