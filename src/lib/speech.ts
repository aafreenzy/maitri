import type { Lang } from './i18n';

export type SpeechErrorCode = 'unsupported' | 'denied' | 'network' | 'no-speech' | 'other';
export class SpeechError extends Error {
  constructor(public code: SpeechErrorCode) { super(code); }
}

export interface Listener { stop(): void; abort(): void; result: Promise<string> }

/* ------------------------------------------------------------------ */
/* Engine 1: the browser's own speech recognition (needs internet).   */
/* ------------------------------------------------------------------ */

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

const browserSupported = () => typeof window !== 'undefined' && ctor() !== null;
const BCP47: Record<Lang, string> = { hi: 'hi-IN', en: 'en-IN' };

function startBrowserListening(opts: { lang: Lang; continuous?: boolean; onInterim?: (text: string) => void }): Listener {
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

/* ------------------------------------------------------------------ */
/* Engine 2: record audio, send it to our Supabase function (Whisper). */
/* The speech service key stays in Supabase; this file has no secret.  */
/* ------------------------------------------------------------------ */

const SB_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const FUNCTION_NAME = 'smooth-action';
const MAX_SECONDS = 60;

// After one failure we use the browser engine for the rest of this visit.
let cloudFailed = false;

const cloudSupported = () =>
  typeof window !== 'undefined' &&
  Boolean(SB_URL && SB_KEY) &&
  typeof MediaRecorder !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia);

const pickMime = (): string => {
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
};

async function transcribe(blob: Blob, lang: Lang): Promise<string> {
  if (blob.size < 1500) throw new SpeechError('no-speech');
  let res: Response;
  try {
    res = await fetch(`${SB_URL}/functions/v1/${FUNCTION_NAME}?lang=${lang}`, {
      method: 'POST',
      headers: { 'Content-Type': blob.type.split(';')[0] || 'audio/webm', apikey: SB_KEY as string },
      body: blob,
    });
  } catch {
    cloudFailed = true;
    throw new SpeechError('network');
  }
  if (res.status === 400) throw new SpeechError('no-speech');
  if (!res.ok) { cloudFailed = true; throw new SpeechError('network'); }
  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  return String(data?.text ?? '').trim();
}

function startCloudListening(opts: { lang: Lang }): Listener {
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let aborted = false;
  let stopRequested = false;
  const chunks: Blob[] = [];

  const release = () => {
    if (timer) clearTimeout(timer);
    stream?.getTracks().forEach((tr) => tr.stop());
    stream = null;
  };

  const result = new Promise<string>((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(
      (s) => {
        stream = s;
        if (aborted) { release(); resolve(''); return; }
        const mime = pickMime();
        let rec: MediaRecorder;
        try { rec = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s); }
        catch { release(); reject(new SpeechError('other')); return; }
        recorder = rec;
        rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = async () => {
          release();
          if (aborted) { resolve(''); return; }
          const blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' });
          try { resolve(await transcribe(blob, opts.lang)); }
          catch (e) { reject(e instanceof SpeechError ? e : new SpeechError('other')); }
        };
        rec.start();
        timer = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, MAX_SECONDS * 1000);
        if (stopRequested) rec.stop();
      },
      (e: unknown) => {
        const name = (e as { name?: string } | null)?.name;
        reject(new SpeechError(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'other'));
      },
    );
  });

  return {
    stop: () => { stopRequested = true; if (recorder && recorder.state === 'recording') recorder.stop(); },
    abort: () => { aborted = true; if (recorder && recorder.state === 'recording') recorder.stop(); else release(); },
    result,
  };
}

/* ------------------------------------------------------------------ */
/* Public API (same names as before, so the screens need no changes). */
/* ------------------------------------------------------------------ */

export const recognitionSupported = () => browserSupported() || cloudSupported();

/**
 * Starts listening. Uses the cloud engine when recording works and the phone is online,
 * otherwise the browser's recognition. Rejects with a SpeechError the UI turns into a message.
 * Note: the cloud engine has no live text, so the screen shows "listening" until the user stops.
 */
export function startListening(opts: { lang: Lang; continuous?: boolean; onInterim?: (text: string) => void }): Listener {
  if (cloudSupported() && !cloudFailed && navigator.onLine) return startCloudListening({ lang: opts.lang });
  return startBrowserListening(opts);
}