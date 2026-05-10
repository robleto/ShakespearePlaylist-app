export function AnnotQuotes({ quotes }: { quotes: string[] }) {
  const visible = quotes.slice(0, 3)
  return (
    <div className="annot">
      <div className="lbl">
        <span>NOTABLE LINES</span>
        <span className="num">FIG. 01 — 0{visible.length}</span>
      </div>
      {visible.map((q, i) => (
        <div key={i} className="l" style={{ marginBottom: 6 }}>
          <span
            style={{
              color: 'var(--ink-soft)',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 9,
              marginRight: 6,
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          {q}
        </div>
      ))}
    </div>
  )
}
