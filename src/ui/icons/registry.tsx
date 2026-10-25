import type { ReactNode } from 'react';

const INK = '#111B38', NIL = '#23358A', HALDI = '#F7B500', PAPER = '#FFFFFF';
const S = { stroke: INK, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const head = (cx: number, cy: number, r = 9, fill = PAPER) => <circle cx={cx} cy={cy} r={r} fill={fill} {...S} />;
const legs = (x1: number, x2: number, y1 = 74, y2 = 90) => (
  <>
    <path d={`M${x1} ${y1}V${y2}`} {...S} fill="none" />
    <path d={`M${x2} ${y1}V${y2}`} {...S} fill="none" />
  </>
);
const drop = (x: number, y: number, s = 1, fill = NIL) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -14C0 -14 -11 0 -11 6a11 11 0 0 0 22 0C11 0 0 -14 0 -14Z" fill={fill} {...S} />
);
const woman = (belly = true) => (
  <>
    {head(38, 18)}
    <ellipse cx="38" cy="50" rx="13" ry="22" fill={NIL} {...S} />
    {belly && <circle cx="55" cy="56" r="14" fill={HALDI} {...S} />}
    {legs(34, 44, 70, 90)}
  </>
);
const zig = (x: number, y: number, flip = 1) => (
  <path d={`M${x} ${y}l${6 * flip} 8l${-10 * flip} 8l${6 * flip} 8`} fill="none" {...S} />
);
const thermo = (x: number) => (
  <>
    <rect x={x - 8} y="8" width="16" height="54" rx="8" fill={PAPER} {...S} />
    <circle cx={x} cy="72" r="13" fill={NIL} {...S} />
    <path d={`M${x} 28V66`} stroke={NIL} strokeWidth="6" strokeLinecap="round" />
  </>
);

export const ICONS: Record<string, ReactNode> = {
  'stage-pregnant': woman(true),
  'stage-labour': (<>{woman(true)}<path d="M74 40l10-6M76 56h12M74 72l10 6" {...S} fill="none" /></>),
  'stage-after-birth': (
    <>
      {head(34, 18)}
      <ellipse cx="34" cy="52" rx="13" ry="23" fill={NIL} {...S} />
      {legs(30, 40, 72, 90)}
      <rect x="44" y="46" width="34" height="20" rx="10" transform="rotate(-18 61 56)" fill={HALDI} {...S} />
      <circle cx="76" cy="42" r="8" fill={PAPER} {...S} />
    </>
  ),
  fits: (
    <>
      {head(48, 18)}
      <ellipse cx="48" cy="52" rx="13" ry="22" fill={NIL} {...S} transform="rotate(12 48 52)" />
      {legs(42, 56, 72, 90)}
      {zig(14, 24)}{zig(82, 24, -1)}
    </>
  ),
  bleeding: drop(48, 52, 2.2),
  'bleeding-cloth': (
    <>
      <rect x="8" y="34" width="52" height="46" rx="6" fill={PAPER} {...S} />
      {drop(24, 58, 0.7)}{drop(42, 64, 0.6)}
      <circle cx="74" cy="26" r="16" fill={HALDI} {...S} />
      <path d="M74 16v10l7 5" fill="none" {...S} />
    </>
  ),
  'head-eye': (
    <>
      <circle cx="42" cy="52" r="32" fill={PAPER} {...S} />
      <ellipse cx="42" cy="52" rx="18" ry="11" fill={HALDI} {...S} />
      <circle cx="42" cy="52" r="5" fill={NIL} stroke="none" />
      <path d="M80 10l-6 12M88 28l-12 4M72 2l-2 8" {...S} fill="none" />
    </>
  ),
  swelling: (
    <>
      <circle cx="48" cy="62" r="26" fill={HALDI} {...S} />
      <circle cx="28" cy="32" r="8" fill={HALDI} {...S} /><circle cx="42" cy="26" r="8" fill={HALDI} {...S} />
      <circle cx="56" cy="26" r="8" fill={HALDI} {...S} /><circle cx="69" cy="33" r="8" fill={HALDI} {...S} />
      <path d="M38 62h20M48 52v20" stroke={NIL} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  fever: (<>{thermo(40)}<path d="M64 14l10-6M66 32h16M64 50l10 6" {...S} fill="none" /></>),
  discharge: (
    <>
      {drop(34, 56, 1.7)}
      <path d="M66 26c8 6-8 12 0 18s-8 12 0 18M80 20c8 6-8 12 0 18s-8 12 0 18" {...S} fill="none" />
    </>
  ),
  'water-leak': (
    <>
      <path d="M20 12c-8 20-8 44 0 56h32c10-14 10-36 0-56" fill={PAPER} {...S} transform="translate(8 0)" />
      {drop(34, 82, 0.7)}{drop(56, 86, 0.6)}{drop(74, 80, 0.65)}
    </>
  ),
  'pale-weak': (
    <>
      <circle cx="58" cy="26" r="10" fill={PAPER} {...S} />
      <path d="M52 38c-18 4-22 24-16 44M52 38c12 6 14 24 6 44" fill={PAPER} {...S} />
      <path d="M36 82h26" fill="none" {...S} />
      <path d="M18 54l-8 14M78 50l8 14" fill="none" {...S} />
    </>
  ),
  breathing: (
    <>
      <path d="M24 14c-6 24-8 48-4 64h34c6-14 4-40-6-64z" fill={PAPER} {...S} />
      <path d="M36 40h22M36 54h22" stroke={NIL} strokeWidth="5" strokeLinecap="round" />
      <path d="M68 28h18M64 48h24M68 68h18" {...S} fill="none" />
    </>
  ),
  'belly-pain': (
    <>
      <path d="M30 10c-8 22-8 44-2 76h40c6-32 6-54-2-76z" fill={HALDI} {...S} />
      <path d="M40 38l12 10-12 10 12 10" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 34l8-6M80 54h10M78 74l8 6" {...S} fill="none" />
    </>
  ),
  'baby-moves': (
    <>
      <path d="M24 10c-10 24-10 52 0 76h34c10-24 10-52 0-76z" fill={PAPER} {...S} />
      <path d="M58 40c14-2 16 16 0 16" fill={NIL} {...S} />
      <path d="M72 70l10 8M80 56h10M72 22l10-8" {...S} fill="none" />
    </>
  ),
  'calf-pain': (
    <>
      <path d="M34 8c4 24-6 36-2 52l-4 28h26l-2-28c6-16 0-30 4-52z" fill={PAPER} {...S} />
      <path d="M72 30l-12 18h12l-10 20" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 44h16M40 58h16" stroke={NIL} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  confused: (
    <>
      <circle cx="48" cy="48" r="34" fill={PAPER} {...S} />
      <path d="M48 48c0-8 12-8 12 0s-16 6-16-6 24-12 24 4" fill="none" stroke={NIL} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  'clock-12': (
    <>
      <circle cx="48" cy="48" r="36" fill={PAPER} {...S} />
      <path d="M48 48V20A28 28 0 1 1 20 48z" fill={HALDI} stroke="none" />
      <circle cx="48" cy="48" r="36" fill="none" {...S} />
      <path d="M48 48V20M48 48l20 10" fill="none" {...S} />
    </>
  ),
  'heavy-heart': (
    <>
      <path d="M48 62C20 44 18 22 34 18c8-2 14 4 14 10 0-6 6-12 14-10 16 4 14 26-14 44z" fill={HALDI} {...S} />
      <rect x="30" y="68" width="36" height="22" rx="5" fill={NIL} {...S} />
      <path d="M48 62v6" {...S} />
    </>
  ),
  'baby-feed': (
    <>
      {head(34, 40, 18)}
      <path d="M28 42h.1M40 42h.1" {...S} />
      <rect x="58" y="34" width="22" height="46" rx="8" fill={PAPER} {...S} />
      <rect x="62" y="52" width="14" height="24" fill={NIL} />
      <path d="M58 34c0-10 22-10 22 0" fill={HALDI} {...S} />
      <path d="M52 44l-8 6" {...S} />
    </>
  ),
  'baby-breath': (
    <>
      {head(34, 26, 16)}
      <path d="M14 82c0-18 8-30 20-30s20 12 20 30z" fill={NIL} {...S} />
      <path d="M62 52h22M62 66h28M62 80h22" {...S} fill="none" />
    </>
  ),
  'baby-temp': (
    <>
      {head(40, 50, 26)}
      <path d="M34 50h.1M46 50h.1" {...S} />
      <path d="M72 14l-4 14M84 24l-12 8M82 40l-12 0" {...S} fill="none" />
      <path d="M16 12l6 6M22 6v10M12 18h12" stroke={NIL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
  'baby-fit': (
    <>
      <rect x="22" y="44" width="52" height="30" rx="15" fill={HALDI} {...S} />
      {head(30, 38, 13)}
      {zig(12, 10)}{zig(84, 10, -1)}
    </>
  ),
  'baby-yellow': (
    <>
      <circle cx="48" cy="58" r="28" fill={HALDI} {...S} />
      <circle cx="30" cy="26" r="7" fill={HALDI} {...S} /><circle cx="44" cy="20" r="7" fill={HALDI} {...S} />
      <circle cx="58" cy="20" r="7" fill={HALDI} {...S} /><circle cx="70" cy="28" r="7" fill={HALDI} {...S} />
      <circle cx="48" cy="60" r="6" fill={PAPER} {...S} />
    </>
  ),
  'baby-cord': (
    <>
      <ellipse cx="48" cy="52" rx="34" ry="30" fill={PAPER} {...S} />
      <path d="M48 52c-6 8 8 12 0 20" fill="none" stroke={NIL} strokeWidth="5" strokeLinecap="round" />
      <circle cx="48" cy="52" r="5" fill={HALDI} {...S} />
      <path d="M82 18l-8 8M88 36H76" {...S} fill="none" />
    </>
  ),
  'mode-woman': woman(false),
  'mode-asha': (
    <>
      {head(40, 18)}
      <ellipse cx="40" cy="50" rx="14" ry="22" fill={NIL} {...S} />
      {legs(34, 46, 70, 90)}
      <rect x="58" y="54" width="28" height="22" rx="4" fill={HALDI} {...S} />
      <path d="M72 59v12M66 65h12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M64 54v-4a8 8 0 0 1 16 0v4" fill="none" {...S} />
    </>
  ),
  'mode-family': (
    <>
      {head(30, 20, 8)}
      <ellipse cx="30" cy="54" rx="12" ry="22" fill={NIL} {...S} />
      {head(66, 34, 8, HALDI)}
      <ellipse cx="66" cy="62" rx="11" ry="17" fill={HALDI} {...S} />
    </>
  ),
  'tier-unknown': <circle cx="48" cy="48" r="30" fill={PAPER} {...S} />,
};

export const ICON_IDS = Object.keys(ICONS);
