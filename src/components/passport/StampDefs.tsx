/**
 * Shared SVG defs used by every stamp on the page. Mount once at the
 * root layout. The #stamp-rough filter is what gives stamps their
 * "pressed not printed" turbulence; without this mounted, stamps fall
 * back to clean rectangles.
 */
export function StampDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="stamp-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={1.3} />
          <feComponentTransfer>
            <feFuncA type="linear" slope={1.05} intercept={-0.05} />
          </feComponentTransfer>
        </filter>
        <filter id="stamp-rough-2" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={2} seed={9} />
          <feDisplacementMap in="SourceGraphic" scale={0.9} />
        </filter>
      </defs>
    </svg>
  )
}
