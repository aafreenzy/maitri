import type { Lang } from './i18n';

export type SpeechErrorCode = 'unsupported' | 'denied' | 'network' | 'no-speech' | 'other';
export class SpeechError extends Error {
  constructor(public code: SpeechErrorCode) { super(code); }
}

interface Rec {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type RecCtor = new () => Rec;

const ctor = (): RecCtor | null => {
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const recognitionSupported = () => typeof window !== 'undefined' && ctor() !== null;
const BCP47: Record<Lang, string> = { hi: 'hi-IN', en: 'en-IN' };

export interface Listener { stop(): void; abort(): void; result: Promise<string> }

/**
 * Starts the browser's speech recognition. On Chrome this sends audio to the browser vendor's
 * speech service, so it needs internet. Resolves with the text heard when stop() is called or
 * the browser ends the session. Rejects with a SpeechError the UI turns into a helpful message.
 */
export function startListening(opts: { lang: Lang; continuous?: boolean; onInterim?: (text: string) => void }): Listener {
  const C = ctor();
  if (!C) return { stop() {}, abort() {}, result: Promise.reject(new SpeechError('unsupported')) };
  const rec = new C();
  rec.lang = BCP47[opts.lang];
  rec.continuous = opts.continuous ?? false;
  rec.interimResults = true;
  let text = '';
  let failure: SpeechError | null = null;
  const result = new Promise<string>((resolve, reject) => {
    rec.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += (e.results[i]![0]?.transcript ?? '') + ' ';
      text = t.trim();
      opts.onInterim?.(text);
    };
    rec.onerror = (e) => {
      failure = new SpeechError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied'
          : e.error === 'network' ? 'network'
          : e.error === 'no-speech' ? 'no-speech' : 'other');
    };
    rec.onend = () => (failure && !text ? reject(failure) : resolve(text));
    try { rec.start(); } catch { reject(new SpeechError('other')); }
  });
  return { stop: () => rec.stop(), abort: () => rec.abort(), result };
}
