export function MaitriMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M6 22c14-4 24 2 30 12s2 22-8 26C14 56 4 40 6 22z" fill="#23358A" stroke="#111B38" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 22c-14-4-24 2-30 12s-2 22 8 26c14-4 24-20 22-38z" fill="#F7B500" fillOpacity=".92" stroke="#111B38" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.05 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: compact ? '1.2rem' : '2.8rem' }}>मैत्री</span>
      <span style={{ fontWeight: 600, fontSize: compact ? '0.85rem' : '1.2rem' }}>Maitri</span>
    </span>
  );
}
