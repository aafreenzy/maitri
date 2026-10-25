import { useSyncExternalStore } from 'react';
import en from '../data/i18n/en.json';
import hi from '../data/i18n/hi.json';
import type { Dictionary, Question, Stage } from '../engine/types';

export type Lang = 'hi' | 'en';
const dicts: Record<Lang, Dictionary> = { en: en as Dictionary, hi: hi as Dictionary };

let current: Lang = 'hi';
const listeners = new Set<() => void>();
const warned = new Set<string>();

function applyHtmlLang() {
  if (typeof document !== 'undefined') document.documentElement.lang = current;
}

export function getLang(): Lang { return current; }
export function setLang(l: Lang) {
  current = l;
  applyHtmlLang();
  listeners.forEach((fn) => fn());
}
export function subscribeLang(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, getLang);
}

export function t(key: string, params?: Record<string, string | number>): string {
  let s = dicts[current][key] ?? dicts.en[key];
  if (s === undefined) {
    if (import.meta.env?.DEV && !warned.has(key)) { warned.add(key); console.warn(`i18n: missing key ${key}`); }
    return key;
  }
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export const questionText = (q: Question) => (current === 'hi' ? q.hi : q.en);
export const questionShort = (q: Question) => (current === 'hi' ? q.short_hi : q.short_en);
export const stageLabel = (s: Stage) => (current === 'hi' ? s.hi : s.en);

applyHtmlLang();
