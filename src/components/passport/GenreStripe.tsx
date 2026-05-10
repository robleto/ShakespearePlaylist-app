import type { PlayGenre } from '@/types/play'

const ORDER: { key: PlayGenre; label: string }[] = [
  { key: 'tragedy', label: 'TRAGEDY' },
  { key: 'comedy', label: 'COMEDY' },
  { key: 'history', label: 'HISTORY' },
  { key: 'romance', label: 'ROMANCE' },
  { key: 'apocrypha', label: 'APOCRYPHA' },
]

export function GenreStripe({ genre }: { genre: PlayGenre }) {
  return (
    <div className="genre-stripe">
      <span className="spaced" style={{ fontSize: 9, color: 'var(--ink-soft)' }}>
        CLASSIFICATION ·
      </span>
      {ORDER.map(({ key, label }) => {
        const active = key === genre
        const isApocrypha = active && key === 'apocrypha'
        return (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className={`pip ${active ? 'fill' : ''} ${isApocrypha ? 'red' : ''}`} />
            <span style={{ fontSize: 9, opacity: active ? 1 : 0.35 }}>{label}</span>
          </span>
        )
      })}
    </div>
  )
}
