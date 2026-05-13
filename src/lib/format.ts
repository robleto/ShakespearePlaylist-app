// Pure formatters. No filesystem, no Node-only imports — safe in client
// bundles. Keep this file dependency-free so client components can pull
// from it without dragging server modules along.

/** Formats "2026-06-04" + "2026-07-12" → "JUN 04 – JUL 12, 2026". */
export function formatRun(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00Z')
  const e = new Date(end + 'T00:00:00Z')
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  })
  const yearS = s.getUTCFullYear()
  const yearE = e.getUTCFullYear()
  const left = fmt.format(s).toUpperCase()
  const right = fmt.format(e).toUpperCase()
  if (yearS !== yearE) {
    return `${left}, ${yearS} – ${right}, ${yearE}`
  }
  return `${left} – ${right}, ${yearE}`
}
