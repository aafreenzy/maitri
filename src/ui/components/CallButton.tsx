import { getNumber, telHref } from '../../lib/config';
import { t } from '../../lib/i18n';

/** Reads its number only from config. Renders nothing when the number is missing. */
export function CallButton({ numberKey, label, white = true, text }: { numberKey: string; label?: string; white?: boolean; text?: string }) {
  const n = getNumber(numberKey);
  const href = telHref(numberKey);
  if (!n || !href) return null;
  return (
    <a className={`btn ${white ? 'white' : 'primary'}`} href={href}>
      {text ?? label ?? t('common.call', { number: n.number })}
    </a>
  );
}
