import type { ReactNode } from 'react';

export const INK = '#111B38', NIL = '#23358A', HALDI = '#F7B500', PAPER = '#FFFFFF';
export const S = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A limb drawn as an outlined tube: ink underlay, coloured top. */
export const limb = (d: string, fill = NIL, w = 6) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export function Head({ cx, cy, r = 10, hair = 'bun', rotate = 0 }: { cx: number; cy: number; r?: number; hair?: 'bun' | 'short' | 'none'; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy + r})`}>
      {hair === 'bun' && <circle cx={cx} cy={cy - r - 1} r={r * 0.42} fill={INK} />}
      <circle cx={cx} cy={cy} r={r} fill={PAPER} {...S} />
      {hair !== 'none' && <path d={`M${cx - r} ${cy + 1}a${r} ${r} 0 0 1 ${2 * r} 0q${-r * 0.45} ${-r * 0.65} ${-r * 2} 0z`} fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />}
    </g>
  );
}

export interface PersonProps {
  x?: number; y?: number; s?: number; rotate?: number;
  top?: string; bottom?: string; hair?: 'bun' | 'short';
  belly?: boolean; arms?: 'down' | 'belly' | 'hold'; headTilt?: number; extra?: ReactNode;
}

/** Front view figure, neutral clothing, no skin tone, no facial detail. Drawn on a 96 box. */
export function Person({ x = 0, y = 0, s = 1, rotate = 0, top = NIL, bottom = HALDI, hair = 'bun', belly = false, arms = 'down', headTilt = 0, extra }: PersonProps) {
  const armPaths = {
    down: ['M35 33Q27 46 31 60', 'M61 33Q69 46 65 60'],
    belly: ['M35 33Q27 50 42 60', 'M61 33Q69 50 54 60'],
    hold: ['M35 33Q26 52 46 58', 'M61 33Q70 52 50 58'],
  }[arms];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 48 60) scale(${s})`}>
      <path d="M33 60L63 60L67 87L29 87Z" fill={bottom} {...S} />
      <ellipse cx="39" cy="90.500" rx="6" ry="3" fill={INK} /><ellipse cx="57" cy="90.500" rx="6" ry="3" fill={INK} />
      <path d="M35 31Q48 25 61 31L63 62L33 62Z" fill={top} {...S} />
      {belly && <><ellipse cx="48" cy="52" rx="14.500" ry="12" fill={top} {...S} /><path d="M41 50Q48 56 55 50" fill="none" stroke={PAPER} strokeWidth="2.500" strokeLinecap="round" /></>}
      {armPaths.map((d, i) => <g key={i}>{limb(d, top, 5.5)}</g>)}
      <Head cx={48} cy={16} r={10} hair={hair} rotate={headTilt} />
      {extra}
    </g>
  );
}

/** Highlight on a drop so it reads as liquid. */
export const Drop = ({ x, y, s = 1, fill = NIL }: { x: number; y: number; s?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -15C0 -15 -12 0 -12 7a12 12 0 0 0 24 0C12 0 0 -15 0 -15Z" fill={fill} {...S} />
    <path d="M-6 6a6 6 0 0 0 4 5" fill="none" stroke={PAPER} strokeWidth="2.500" strokeLinecap="round" />
  </g>
);

export const Zig = ({ x, y, flip = 1 }: { x: number; y: number; flip?: number }) => (
  <path d={`M${x} ${y}l${6 * flip} 8l${-10 * flip} 8l${6 * flip} 8`} fill="none" {...S} />
);
