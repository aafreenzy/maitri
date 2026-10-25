import type { Tier } from '../../engine/types';

const SHAPE: Record<Tier, string> = {
  RED: 'octagon', AMBER: 'triangle', GREEN: 'circle',
};

/** Tier is carried by shape and word together, so it reads in greyscale. */
export function SignalShape({ tier, word, size = 220, className }: { tier: Tier; word: string; size?: number; className?: string }) {
  const stroke = { stroke: '#111B38', strokeWidth: 6, strokeLinejoin: 'round' as const };
  return (
    <svg className={className} data-shape={SHAPE[tier]} width="100%" style={{ maxWidth: size }} viewBox="0 0 200 200" role="img" aria-label={word}>
      {tier === 'RED' && <polygon points="62,8 138,8 192,62 192,138 138,192 62,192 8,138 8,62" fill="#FFFFFF" {...stroke} />}
      {tier === 'AMBER' && <polygon points="100,12 192,176 8,176" fill="#FFFFFF" {...stroke} />}
      {tier === 'GREEN' && <circle cx="100" cy="100" r="90" fill="#FFFFFF" {...stroke} />}
      <text x="100" y={tier === 'AMBER' ? 138 : 114} textAnchor="middle" fontFamily="var(--font-display)" fontSize={tier === 'AMBER' ? 28 : 40} fill="#111B38">{word}</text>
    </svg>
  );
}
