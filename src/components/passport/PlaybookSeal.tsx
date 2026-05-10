/**
 * Abstract stage-glyph seal — outer ring + inner ring + proscenium
 * lines + xxxix mark + footlight dots + circumscript and registry
 * crosses. Uses currentColor so it inherits ink/paper inversion.
 */
export function PlaybookSeal({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ color: 'var(--ink)' }}>
      <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="currentColor"
        strokeWidth=".5"
        opacity=".5"
      />
      <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth=".75" />
      <line x1="34" y1="76" x2="86" y2="76" stroke="currentColor" strokeWidth="1.25" />
      <line x1="40" y1="46" x2="40" y2="76" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="46" x2="80" y2="76" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="46" x2="80" y2="46" stroke="currentColor" strokeWidth="1" />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="12"
        fontStyle="italic"
        fill="currentColor"
      >
        xxxix
      </text>
      {[42, 48, 54, 60, 66, 72, 78].map((x) => (
        <circle key={x} cx={x} cy="80" r=".9" fill="currentColor" />
      ))}
      <defs>
        <path id="seal-arc-top" d="M 14 60 A 46 46 0 0 1 106 60" fill="none" />
        <path id="seal-arc-bot" d="M 18 64 A 42 42 0 0 0 102 64" fill="none" />
      </defs>
      <text
        fontFamily="var(--font-mono), monospace"
        fontSize="6.2"
        letterSpacing="3"
        fill="currentColor"
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          SHAKESPEARE · PLAYBOOK
        </textPath>
      </text>
      <text
        fontFamily="var(--font-mono), monospace"
        fontSize="5.2"
        letterSpacing="2"
        fill="currentColor"
        opacity=".7"
      >
        <textPath href="#seal-arc-bot" startOffset="50%" textAnchor="middle">
          VIDI · AUDIVI · SEDI
        </textPath>
      </text>
      {[
        [6, 6],
        [114, 6],
        [6, 114],
        [114, 114],
      ].map(([x, y], i) => (
        <g key={i} stroke="currentColor" strokeWidth=".6">
          <line x1={x - 3} y1={y} x2={x + 3} y2={y} />
          <line x1={x} y1={y - 3} x2={x} y2={y + 3} />
        </g>
      ))}
    </svg>
  )
}
