import { ICONS } from './registry';

export function Pictogram({ id, size = 96, title }: { id: string; size?: number; title?: string }) {
  let icon = ICONS[id];
  if (!icon) {
    if (import.meta.env?.DEV) console.warn(`Pictogram: unknown icon ${id}`);
    icon = ICONS['tier-unknown'];
  }
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      {icon}
    </svg>
  );
}
