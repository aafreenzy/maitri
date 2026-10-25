const INK = '#111B38', NIL = '#23358A', HALDI = '#F7B500';

export type GlyphName = 'tick' | 'cross' | 'question' | 'phone' | 'mic' | 'stop' | 'doc' | 'list';

/** Small interface symbols for buttons. Shape carries the meaning, not colour. */
export function Glyph({ name, size = 32 }: { name: GlyphName; size?: number }) {
  const s = { stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" style={{ flex: 'none' }}>
      {name === 'tick' && (<><circle cx="16" cy="16" r="13" fill={NIL} {...s} /><path d="M9.5 16.5l4.5 4.5 8.5-9.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></>)}
      {name === 'cross' && (<><circle cx="16" cy="16" r="13" fill="#fff" {...s} /><path d="M10.5 10.5l11 11M21.5 10.5l-11 11" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" /></>)}
      {name === 'question' && (<><circle cx="16" cy="16" r="13" fill={HALDI} {...s} /><path d="M12 13a4 4 0 1 1 6 3.4c-1.4.9-2 1.6-2 3" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" /><circle cx="16" cy="25" r="1.8" fill={INK} /></>)}
      {name === 'phone' && (<path d="M8 4h5l2 6-3 2c1.5 3 3.5 5 6.500 6.500l2-3 6 2v5c0 1.500-1.500 3-3 3C13 25.500 6.500 19 5 7c0-1.500 1.500-3 3-3z" fill={NIL} {...s} transform="translate(-1 0) scale(.95)" />)}
      {name === 'mic' && (<><rect x="11" y="3" width="10" height="17" rx="5" fill={NIL} {...s} /><path d="M6 15a10 10 0 0 0 20 0M16 25v4" fill="none" {...s} /></>)}
      {name === 'stop' && <rect x="7" y="7" width="18" height="18" rx="3" fill="#fff" {...s} />}
      {name === 'doc' && (<><path d="M8 3h11l6 6v20H8z" fill="#fff" {...s} /><path d="M12 16h9M12 21h9M12 11h4" fill="none" {...s} /></>)}
      {name === 'list' && (<><rect x="5" y="4" width="22" height="24" rx="3" fill="#fff" {...s} /><path d="M10 11l2 2 3-3M10 19l2 2 3-3M18 12h5M18 20h5" fill="none" {...s} /></>)}
    </svg>
  );
}
