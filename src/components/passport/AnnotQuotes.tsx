type Props = {
  quotes: string[]
  refs?: (string | null)[]
}

export function AnnotQuotes({ quotes, refs }: Props) {
  const visible = quotes.slice(0, 3)
  return (
    <div className="annot">
      <div className="lbl">
        <span>NOTABLE LINES</span>
      </div>
      {visible.map((q, i) => {
        const ref = refs?.[i]
        return (
          <div key={i} className="l" style={{ marginBottom: 6 }}>
            {q}
            {ref ? (
              <span
                style={{
                  color: 'var(--ink-soft)',
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 9,
                  marginLeft: 8,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {ref}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
