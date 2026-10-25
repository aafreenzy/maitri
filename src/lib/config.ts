import { data } from '../engine/loadData';
import type { NumberEntry } from '../engine/types';
import { getLang } from './i18n';

export interface NumberInfo { key: string; number: string; label: string; status: string; confirmed: boolean }

const isConfirmed = (n: NumberEntry) => n.status.startsWith('confirmed');

export function getNumber(key: string): NumberInfo | null {
  const n = data.config.numbers[key];
  if (!n) {
    if (import.meta.env?.DEV) throw new Error(`Unknown number key: ${key}`);
    return null;
  }
  return { key, number: n.number, label: getLang() === 'hi' ? n.label_hi : n.label_en, status: n.status, confirmed: isConfirmed(n) };
}

export function telHref(key: string): string | null {
  const n = getNumber(key);
  return n ? `tel:${n.number}` : null;
}

export function allNumbers(): NumberInfo[] {
  return Object.keys(data.config.numbers).map((k) => getNumber(k)).filter((x): x is NumberInfo => x !== null);
}

export const unconfirmedNumbers = () => allNumbers().filter((n) => !n.confirmed);
export const entitlement = (lang: 'hi' | 'en') => (lang === 'hi' ? data.config.entitlements.jssk_hi : data.config.entitlements.jssk_en);
export const appInfo = () => data.config.app;
export const featureFlag = (name: string) => data.config.feature_flags[name] === true;
